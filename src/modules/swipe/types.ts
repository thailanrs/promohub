import { z } from 'zod';

export const EnrichedOfferSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  pipelineId: z.string(),
  canonicalUrl: z.string(),
  affiliateUrl: z.string(),
  shortCode: z.string(),
  store: z.enum(['amazon', 'shopee', 'mercadolivre', 'magalu', 'ali-express', 'other']),
  title: z.string(),
  originalPrice: z.number().nullable(),
  discountedPrice: z.number(),
  discountPercent: z.number(),
  couponCode: z.string().nullable(),
  imageUrl: z.string(),
  aiCopy: z.string(),
  isOutOfStock: z.boolean().default(false),
  status: z.enum(['pending', 'approved', 'rejected', 'published', 'failed']),
  createdAt: z.date(),
});

export type EnrichedOffer = z.infer<typeof EnrichedOfferSchema>;
