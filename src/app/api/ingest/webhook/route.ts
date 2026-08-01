import { NextRequest, NextResponse } from 'next/server';
import { RawPayloadSchema } from '@/modules/ingestion/types';
import { parseIngestionPayload } from '@/modules/ingestion/services/ingestion.service';

/**
 * Ingestion Webhook Endpoint.
 * Receives JSON payloads from external automation scripts, Telegram scrapers, or third-party webhooks.
 */
export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const validatedPayload = RawPayloadSchema.parse(json);

    const { extractedUrls, cleanText } = parseIngestionPayload(validatedPayload);

    return NextResponse.json(
      {
        success: true,
        data: {
          tenantId: validatedPayload.tenantId,
          sourceId: validatedPayload.sourceId || null,
          extractedUrls,
          cleanText,
          urlCount: extractedUrls.length,
          receivedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid webhook payload';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 400 }
    );
  }
}
