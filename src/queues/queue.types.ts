import { z } from 'zod';

export const IngestionJobPayloadSchema = z.object({
  tenantId: z.string(),
  rawText: z.string(),
  rawUrl: z.string().optional(),
  sourceId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type IngestionJobPayload = z.infer<typeof IngestionJobPayloadSchema>;

export const EnrichmentJobPayloadSchema = z.object({
  tenantId: z.string(),
  rawUrl: z.string().url(),
  rawText: z.string().optional(),
  sourceId: z.string().optional(),
  pipelineId: z.string().optional(),
});

export type EnrichmentJobPayload = z.infer<typeof EnrichmentJobPayloadSchema>;

export const DispatchJobPayloadSchema = z.object({
  tenantId: z.string(),
  offerId: z.string(),
  destinationId: z.string(),
  destinationJid: z.string(),
  formattedMessage: z.string(),
  imageUrl: z.string().optional(),
});

export type DispatchJobPayload = z.infer<typeof DispatchJobPayloadSchema>;

export const QUEUE_NAMES = {
  INGESTION: 'queue_ingestion',
  ENRICHMENT: 'queue_enrichment',
  DISPATCH: 'queue_dispatch',
  STOCK_CHECKER_CRON: 'cron_stock_checker',
} as const;
