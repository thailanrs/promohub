import { NextResponse } from 'next/server';
import { parseIngestionPayload } from '../../../../modules/ingestion/services/ingestion.service';
import { processEnrichmentJob } from '../../../../workers';
import { db } from '../../../../db';
import { offers } from '../../../../db/schema';
import { ensureDefaultTenant } from '../../../../db/seed-utils';

export async function POST(request: Request) {
  try {
    const tenant = await ensureDefaultTenant();
    const body = await request.json();
    const { url, rawText, mode = 'manual' } = body;

    if (!url && !rawText) {
      return NextResponse.json(
        { error: 'Envie pelo menos a "url" ou o "rawText" para ingestão.' },
        { status: 400 }
      );
    }

    const fullContent = [rawText, url].filter(Boolean).join('\n');
    const parsed = parseIngestionPayload({
      text: fullContent,
      rawUrl: url,
      tenantId: tenant?.id || '00000000-0000-4000-a000-000000000000',
    });

    if (parsed.extractedUrls.length === 0 && !url) {
      return NextResponse.json(
        { error: 'Nenhuma URL válida de e-commerce foi encontrada no texto enviado.' },
        { status: 400 }
      );
    }

    const targetUrl = url || parsed.extractedUrls[0];

    // Process enrichment pipeline
    const result = await processEnrichmentJob(
      {
        tenantId: tenant?.id || '00000000-0000-4000-a000-000000000000',
        rawUrl: targetUrl,
        rawText: parsed.cleanText || 'Oferta Ingerida Manualmente',
      },
      {
        tenantCredentials: {
          amazonTag: 'promohub-20',
          shopeeSubId: 'promohub_tech',
        },
        mode: mode === 'auto' ? 'auto' : 'manual',
      }
    );

    // Save enriched offer into Supabase DB
    const [savedOffer] = await db
      .insert(offers)
      .values({
        tenantId: tenant?.id || '00000000-0000-4000-a000-000000000000',
        canonicalUrl: result.offer.canonicalUrl,
        affiliateUrl: result.offer.affiliateUrl,
        shortCode: result.offer.shortCode,
        store: result.offer.store,
        title: result.offer.title,
        originalPrice: result.offer.originalPrice ? String(result.offer.originalPrice) : null,
        discountedPrice: String(result.offer.discountedPrice),
        discountPercent: result.offer.discountPercent,
        couponCode: result.offer.couponCode,
        imageUrl: result.offer.imageUrl,
        aiCopy: result.offer.aiCopy,
        isOutOfStock: false,
        status: 'pending',
      })
      .returning();

    return NextResponse.json({
      success: true,
      offer: savedOffer,
      nextStep: result.nextStep,
      extractedUrls: parsed.extractedUrls,
    });
  } catch (error) {
    console.error('[API Ingest Manual Error]', error);
    return NextResponse.json(
      { error: 'Erro interno durante o processamento de ingestão manual.' },
      { status: 500 }
    );
  }
}
