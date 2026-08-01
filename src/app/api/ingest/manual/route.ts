import { NextResponse } from 'next/server';
import { parseIngestionPayload } from '../../../../modules/ingestion/services/ingestion.service';
import { processEnrichmentJob } from '../../../../workers';

export async function POST(request: Request) {
  try {
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
      tenantId: 'tenant_demo_123',
    });

    if (parsed.extractedUrls.length === 0 && !url) {
      return NextResponse.json(
        { error: 'Nenhuma URL válida de e-commerce foi encontrada no texto enviado.' },
        { status: 400 }
      );
    }

    const targetUrl = url || parsed.extractedUrls[0];

    // Process enrichment pipeline synchronously for UI responsiveness
    const result = await processEnrichmentJob(
      {
        tenantId: 'tenant_demo_123',
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

    return NextResponse.json({
      success: true,
      offer: result.offer,
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
