import { z } from 'zod';

export const StoreEnumSchema = z.enum([
  'amazon',
  'shopee',
  'mercadolivre',
  'magalu',
  'ali-express',
  'other',
]);

export type StoreEnum = z.infer<typeof StoreEnumSchema>;

export const RawUrlInputSchema = z.object({
  rawUrl: z.string().url(),
  metadata: z.record(z.unknown()).optional(),
});

export type RawUrlInput = z.infer<typeof RawUrlInputSchema>;

export const UnshortenedResultSchema = z.object({
  canonicalUrl: z.string().url(),
  store: StoreEnumSchema,
  productId: z.string().nullable(),
  rawUrl: z.string(),
  isResolved: z.boolean(),
});

export type UnshortenedResult = z.infer<typeof UnshortenedResultSchema>;

export const TenantCredentialsSchema = z.object({
  amazonTag: z.string().optional().nullable(),
  shopeeSubId: z.string().optional().nullable(),
  shopeeAppId: z.string().optional().nullable(),
  mlUtmSource: z.string().optional().nullable(),
  mlMattTool: z.string().optional().nullable(),
  awinPublisherId: z.string().optional().nullable(),
});

export type TenantCredentials = z.infer<typeof TenantCredentialsSchema>;

export const AffiliateInjectorInputSchema = z.object({
  canonicalUrl: z.string().url(),
  store: StoreEnumSchema,
  tenantCredentials: TenantCredentialsSchema.optional().nullable(),
  fallbackAwinId: z.string().optional().nullable(),
});

export type AffiliateInjectorInput = z.infer<typeof AffiliateInjectorInputSchema>;

export const AffiliateInjectorResultSchema = z.object({
  affiliateUrl: z.string().url(),
  store: StoreEnumSchema,
  tagApplied: z.string().nullable(),
  isFallback: z.boolean(),
});

export type AffiliateInjectorResult = z.infer<typeof AffiliateInjectorResultSchema>;
