import { z } from 'zod';

export const RawPayloadSchema = z.object({
  text: z.string(),
  rawUrl: z.string().optional(),
  sourceId: z.string().optional(),
  tenantId: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

export type RawPayload = z.infer<typeof RawPayloadSchema>;

export const IngestResultSchema = z.object({
  extractedUrls: z.array(z.string().url()),
  rawText: z.string(),
  isDuplicate: z.boolean(),
  productHash: z.string().nullable(),
  tenantId: z.string(),
});

export type IngestResult = z.infer<typeof IngestResultSchema>;

export const DeduplicationCheckInputSchema = z.object({
  url: z.string(),
  tenantId: z.string(),
  windowHours: z.number().default(24),
});

export type DeduplicationCheckInput = z.infer<typeof DeduplicationCheckInputSchema>;

export const WebShareTargetPayloadSchema = z.object({
  title: z.string().optional(),
  text: z.string().optional(),
  url: z.string().optional(),
});

export type WebShareTargetPayload = z.infer<typeof WebShareTargetPayloadSchema>;
