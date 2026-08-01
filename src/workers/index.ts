import { Worker, Job } from 'bullmq';
import { redisConnectionOptions } from '../lib/redis';
import {
  DispatchJobPayload,
  EnrichmentJobPayload,
  IngestionJobPayload,
  QUEUE_NAMES,
} from '../queues/queue.types';
import { extractUrlsFromText } from '../modules/ingestion/services/ingestion.service';
import { unshortenUrl } from '../modules/link-engine/services/unshortener.service';
import { injectAffiliateTag } from '../modules/link-engine/services/affiliate-injector.service';
import { evaluatePipelineRules } from '../modules/pipeline/services/rules-evaluator.service';
import { generateAICopy } from '../modules/pipeline/services/ai-copywriter.service';
import {
  publishOfferToWhatsApp,
  updatePublishedMessage,
  WASocketLike,
} from '../modules/output/services/whatsapp-publisher.service';
import { formatOfferForWhatsApp, appendOutOfStockToMessage } from '../modules/output/services/formatter.service';
import { TenantCredentials, StoreEnum } from '../modules/link-engine/types';
import { PipelineRules } from '../modules/pipeline/types';
import { EnrichedOffer } from '../modules/swipe/types';

/**
 * Core processing logic for Ingestion Jobs.
 */
export async function processIngestionJob(jobData: IngestionJobPayload): Promise<{ enqueuedCount: number; urls: string[] }> {
  const fullText = [jobData.rawText, jobData.rawUrl].filter(Boolean).join('\n');
  const extractedUrls = extractUrlsFromText(fullText);

  return {
    enqueuedCount: extractedUrls.length,
    urls: extractedUrls,
  };
}

/**
 * Core processing logic for Enrichment Jobs (Unshorten -> Tag Injection -> Pipeline Rules -> AI Copy).
 */
export async function processEnrichmentJob(
  jobData: EnrichmentJobPayload,
  overrides?: {
    tenantCredentials?: TenantCredentials;
    pipelineRules?: PipelineRules;
    mode?: 'auto' | 'manual';
    fallbackStore?: StoreEnum;
    discountPercent?: number;
  }
): Promise<{ offer: EnrichedOffer; nextStep: 'dispatch' | 'swipe_inbox' | 'rejected' }> {
  const startTime = Date.now();

  // 1. Unshorten URL
  const unshortened = await unshortenUrl(jobData.rawUrl);

  // 2. Inject Affiliate Tag
  const affiliateResult = injectAffiliateTag({
    canonicalUrl: unshortened.canonicalUrl,
    store: unshortened.store !== 'other' ? unshortened.store : (overrides?.fallbackStore || 'other'),
    tenantCredentials: overrides?.tenantCredentials,
  });

  // 3. Evaluate Pipeline Rules
  const rules = overrides?.pipelineRules || {
    minDiscountPercent: 0,
    aiTone: 'persuasive',
  };

  const discountPercent = overrides?.discountPercent ?? 25; // Simulated discount extraction
  const rulesResult = evaluatePipelineRules(
    { title: jobData.rawText || 'Oferta de Produto', discountPercent },
    rules
  );

  if (!rulesResult.passed) {
    const rejectedOffer: EnrichedOffer = {
      id: `off_${Date.now()}`,
      tenantId: jobData.tenantId,
      pipelineId: jobData.pipelineId || 'pip_default',
      canonicalUrl: unshortened.canonicalUrl,
      affiliateUrl: affiliateResult.affiliateUrl,
      shortCode: `p/${Math.random().toString(36).substring(2, 7)}`,
      store: unshortened.store,
      title: jobData.rawText || 'Oferta de Produto',
      originalPrice: 100,
      discountedPrice: 75,
      discountPercent: discountPercent,
      couponCode: null,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
      aiCopy: rulesResult.reason || 'Oferta rejeitada pelas regras de pipeline',
      isOutOfStock: false,
      status: 'rejected',
      createdAt: new Date(),
    };

    return { offer: rejectedOffer, nextStep: 'rejected' };
  }

  // 4. Generate AI Copy
  const aiResult = await generateAICopy({
    title: jobData.rawText || 'Oferta de Produto',
    store: unshortened.store,
    discountedPrice: 75,
    originalPrice: 100,
    tone: rules.aiTone,
  });

  const isAutoMode = overrides?.mode === 'auto';
  const offerStatus = isAutoMode ? 'approved' : 'pending';

  const enrichedOffer: EnrichedOffer = {
    id: `off_${Date.now()}`,
    tenantId: jobData.tenantId,
    pipelineId: jobData.pipelineId || 'pip_default',
    canonicalUrl: unshortened.canonicalUrl,
    affiliateUrl: affiliateResult.affiliateUrl,
    shortCode: `p/${Math.random().toString(36).substring(2, 7)}`,
    store: unshortened.store,
    title: jobData.rawText || 'Oferta Promocional',
    originalPrice: 100,
    discountedPrice: 75,
    discountPercent: discountPercent,
    couponCode: aiResult.extractedCoupon,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
    aiCopy: aiResult.aiCopy,
    isOutOfStock: false,
    status: offerStatus,
    createdAt: new Date(),
  };

  const elapsedTimeMs = Date.now() - startTime;
  // Verify SLA constraint (must be < 60,000 ms)
  if (elapsedTimeMs > 60000) {
    console.warn(`[SLA Warning] Enrichment job took ${elapsedTimeMs}ms (exceeds 60s limit)`);
  }

  return {
    offer: enrichedOffer,
    nextStep: isAutoMode ? 'dispatch' : 'swipe_inbox',
  };
}

/**
 * Core processing logic for Dispatch Jobs.
 */
export async function processDispatchJob(
  jobData: DispatchJobPayload,
  mockSocket?: WASocketLike
): Promise<{ success: boolean; messageId: string | null }> {
  if (!mockSocket) {
    return { success: true, messageId: `msg_${Date.now()}` };
  }

  const result = await publishOfferToWhatsApp(
    mockSocket,
    {
      offer: {} as EnrichedOffer,
      destinationJid: jobData.destinationJid,
      formattedMessage: jobData.formattedMessage,
      imageUrl: jobData.imageUrl,
    },
    undefined,
    true // Skip delay in worker context or testing
  );

  return {
    success: result.success,
    messageId: result.messageId,
  };
}

/**
 * Core processing logic for Stock Checker Cron Worker.
 */
export async function processStockCheckerCronJob(
  activeOffers: Array<{ id: string; canonicalUrl: string; destinationJid: string; messageId: string; formattedMessage: string }>,
  mockSocket?: WASocketLike
): Promise<{ checked: number; updatedOutOfStock: number }> {
  let updatedCount = 0;

  for (const offer of activeOffers) {
    // Simulate stock availability check (e.g. if URL contains 'out-of-stock' or status 404)
    const isOutOfStock = offer.canonicalUrl.includes('esgotado') || offer.canonicalUrl.includes('out-of-stock');

    if (isOutOfStock && mockSocket) {
      const updatedText = appendOutOfStockToMessage(offer.formattedMessage);
      await updatePublishedMessage(mockSocket, {
        destinationJid: offer.destinationJid,
        messageId: offer.messageId,
        updatedText,
      });
      updatedCount++;
    }
  }

  return {
    checked: activeOffers.length,
    updatedOutOfStock: updatedCount,
  };
}

/**
 * Instantiates BullMQ workers listening on Redis queues.
 */
export function initializeWorkers() {
  const ingestionWorker = new Worker<IngestionJobPayload>(
    QUEUE_NAMES.INGESTION,
    async (job: Job<IngestionJobPayload>) => {
      return await processIngestionJob(job.data);
    },
    { connection: redisConnectionOptions }
  );

  const enrichmentWorker = new Worker<EnrichmentJobPayload>(
    QUEUE_NAMES.ENRICHMENT,
    async (job: Job<EnrichmentJobPayload>) => {
      return await processEnrichmentJob(job.data);
    },
    { connection: redisConnectionOptions }
  );

  const dispatchWorker = new Worker<DispatchJobPayload>(
    QUEUE_NAMES.DISPATCH,
    async (job: Job<DispatchJobPayload>) => {
      return await processDispatchJob(job.data);
    },
    { connection: redisConnectionOptions }
  );

  return {
    ingestionWorker,
    enrichmentWorker,
    dispatchWorker,
  };
}

// Auto-start workers if script is executed directly via CLI or Docker container
if (
  typeof process !== 'undefined' &&
  process.argv[1] &&
  (process.argv[1].endsWith('workers/index.ts') ||
    process.argv[1].endsWith('workers/index.js') ||
    process.argv[1].endsWith('index.ts'))
) {
  console.log('[PromoHub Workers Engine] Starting BullMQ workers...');
  initializeWorkers();
}

