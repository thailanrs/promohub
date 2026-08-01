import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseIngestionPayload, extractUrlsFromText } from '../modules/ingestion/services/ingestion.service';
import { unshortenUrl } from '../modules/link-engine/services/unshortener.service';
import { injectAffiliateTag } from '../modules/link-engine/services/affiliate-injector.service';
import { evaluatePipelineRules } from '../modules/pipeline/services/rules-evaluator.service';
import { generateAICopy } from '../modules/pipeline/services/ai-copywriter.service';
import { formatOfferForWhatsApp } from '../modules/output/services/formatter.service';
import {
  processIngestionJob,
  processEnrichmentJob,
  processDispatchJob,
} from '../workers';
import { WASocketLike } from '../modules/output/services/whatsapp-publisher.service';
import {
  mockTenant,
  mockCredentials,
  mockPipeline,
  mockRawPayloads,
} from './mocks/integration-fixtures';
import { EnrichedOfferSchema } from '../modules/swipe/types';

describe('PromoHub E2E Pipeline Integration Test Suite', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock HTTP fetch calls for short links unshortening
    globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('amzn.to/3Xyz123')) {
        return {
          url: 'https://www.amazon.com.br/dp/B08N5WRWNW?ref=social_share&tag=oldtag-20',
        } as Response;
      }
      if (url.includes('shope.ee/987654321')) {
        return {
          url: 'https://shopee.com.br/product/123456/789012?smtt=0.0.9&spm=123',
        } as Response;
      }
      if (url.includes('amzn.to/3LowDisc')) {
        return {
          url: 'https://www.amazon.com.br/dp/B09LOWDISC?ref=social_share',
        } as Response;
      }
      return { url } as Response;
    });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('should process full Amazon offer lifecycle across all 5 stages in < 1000ms SLA', async () => {
    const startTime = performance.now();

    // ----------------------------------------------------
    // Etapa 1 (Ingestão): Extração de URL limpa do payload bruto
    // ----------------------------------------------------
    const ingestionPayload = mockRawPayloads.amazon;
    const ingestionJobResult = await processIngestionJob({
      tenantId: ingestionPayload.tenantId,
      rawText: ingestionPayload.text,
      rawUrl: ingestionPayload.rawUrl,
    });

    expect(ingestionJobResult.enqueuedCount).toBeGreaterThanOrEqual(1);
    expect(ingestionJobResult.urls).toContain('https://amzn.to/3Xyz123?ref=social_share&tag=oldtag-20');

    const parsedPayload = parseIngestionPayload(ingestionPayload);
    expect(parsedPayload.extractedUrls.length).toBeGreaterThan(0);
    const targetUrl = parsedPayload.extractedUrls[0];

    // ----------------------------------------------------
    // Etapa 2 (Link Engine): Resolution, Sanitização & Injeção de Tag
    // ----------------------------------------------------
    const unshortened = await unshortenUrl(targetUrl);
    expect(unshortened.isResolved).toBe(true);
    expect(unshortened.store).toBe('amazon');
    expect(unshortened.canonicalUrl).toBe('https://www.amazon.com.br/dp/B08N5WRWNW');
    expect(unshortened.canonicalUrl).not.toContain('oldtag-20');

    const affiliateResult = injectAffiliateTag({
      canonicalUrl: unshortened.canonicalUrl,
      store: unshortened.store,
      tenantCredentials: mockCredentials.amazon,
    });
    expect(affiliateResult.affiliateUrl).toBe('https://www.amazon.com.br/dp/B08N5WRWNW?tag=promohub-20');
    expect(affiliateResult.tagApplied).toBe('promohub-20');

    // ----------------------------------------------------
    // Etapa 3 (Pipeline & IA): Avaliação de Regras & Geração de Copy
    // ----------------------------------------------------
    const offerForRules = {
      title: parsedPayload.cleanText,
      discountPercent: 25,
    };

    const rulesResult = evaluatePipelineRules(offerForRules, mockPipeline);
    expect(rulesResult.passed).toBe(true);

    const aiResult = await generateAICopy({
      title: 'Smartphone Echo Dot 5ª Geração com Alexa',
      store: unshortened.store,
      discountedPrice: 299,
      originalPrice: 399,
      tone: mockPipeline.aiTone,
    });
    expect(aiResult.aiCopy).toBeTruthy();

    // ----------------------------------------------------
    // Etapa 4 (Enfileiramento & Worker): Processamento via Enrichment Worker
    // ----------------------------------------------------
    const enrichmentResult = await processEnrichmentJob(
      {
        tenantId: mockTenant.tenantId,
        rawUrl: targetUrl,
        rawText: parsedPayload.cleanText,
        pipelineId: 'pip_amazon_test',
      },
      {
        tenantCredentials: mockCredentials.amazon,
        pipelineRules: mockPipeline,
        mode: 'manual',
      }
    );

    expect(enrichmentResult.nextStep).toBe('swipe_inbox');
    expect(enrichmentResult.offer.status).toBe('pending');
    expect(enrichmentResult.offer.affiliateUrl).toBe('https://www.amazon.com.br/dp/B08N5WRWNW?tag=promohub-20');
    expect(enrichmentResult.offer.store).toBe('amazon');

    // Structural Zod schema validation
    const parseResult = EnrichedOfferSchema.safeParse(enrichmentResult.offer);
    expect(parseResult.success).toBe(true);

    // ----------------------------------------------------
    // Etapa 5 (Formatação de Saída / WhatsApp Dispatch)
    // ----------------------------------------------------
    const formattedMessage = formatOfferForWhatsApp(enrichmentResult.offer);
    expect(formattedMessage).toContain('📦'); // Amazon emoji
    expect(formattedMessage).toContain('Por: R$');
    expect(formattedMessage).toContain(enrichmentResult.offer.affiliateUrl);

    const mockSocket: WASocketLike = {
      sendMessage: vi.fn().mockResolvedValue({
        key: { id: 'WA_MSG_AMAZON_E2E_01' },
      }),
    };

    const dispatchResult = await processDispatchJob(
      {
        tenantId: mockTenant.tenantId,
        offerId: enrichmentResult.offer.id,
        destinationId: 'dest_wa_group_01',
        destinationJid: '5511999999999@g.us',
        formattedMessage,
        imageUrl: enrichmentResult.offer.imageUrl,
      },
      mockSocket
    );

    expect(dispatchResult.success).toBe(true);
    expect(dispatchResult.messageId).toBe('WA_MSG_AMAZON_E2E_01');

    // ----------------------------------------------------
    // Validação do SLA (< 1000ms)
    // ----------------------------------------------------
    const totalDurationMs = performance.now() - startTime;
    expect(totalDurationMs).toBeLessThan(1000);
  });

  it('should process full Shopee offer lifecycle with sub_id tag injection and auto mode routing', async () => {
    const startTime = performance.now();

    const shopeePayload = mockRawPayloads.shopee;

    // 1. Ingest
    const urls = extractUrlsFromText(shopeePayload.text);
    expect(urls).toContain('https://shope.ee/987654321?smtt=0.0.9&spm=123');

    // 2. Worker enrichment in auto mode
    const enrichmentResult = await processEnrichmentJob(
      {
        tenantId: mockTenant.tenantId,
        rawUrl: urls[0],
        rawText: shopeePayload.text,
      },
      {
        tenantCredentials: mockCredentials.shopee,
        pipelineRules: mockPipeline,
        mode: 'auto',
      }
    );

    expect(enrichmentResult.nextStep).toBe('dispatch');
    expect(enrichmentResult.offer.status).toBe('approved');
    expect(enrichmentResult.offer.store).toBe('shopee');
    expect(enrichmentResult.offer.affiliateUrl).toContain('sub_id=promohub_tech');

    // 3. Format & Dispatch
    const formatted = formatOfferForWhatsApp(enrichmentResult.offer);
    expect(formatted).toContain('🧡'); // Shopee emoji
    expect(formatted).toContain('sub_id=promohub_tech');

    const totalDurationMs = performance.now() - startTime;
    expect(totalDurationMs).toBeLessThan(1000);
  });

  it('should reject offer when discount percentage does not satisfy pipeline minimum rule', async () => {
    const lowDiscountPayload = mockRawPayloads.rejectedLowDiscount;

    // Custom rule demanding at least 15% discount
    const strictPipeline = {
      ...mockPipeline,
      minDiscountPercent: 15,
    };

    const enrichmentResult = await processEnrichmentJob(
      {
        tenantId: mockTenant.tenantId,
        rawUrl: lowDiscountPayload.rawUrl!,
        rawText: lowDiscountPayload.text,
      },
      {
        tenantCredentials: mockCredentials.amazon,
        pipelineRules: strictPipeline,
        mode: 'manual',
        discountPercent: 5,
      }
    );

    expect(enrichmentResult.nextStep).toBe('rejected');
    expect(enrichmentResult.offer.status).toBe('rejected');
    expect(enrichmentResult.offer.aiCopy).toContain('menor que o mínimo');
  });
});
