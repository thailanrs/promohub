import { z } from 'zod';

export const PipelineRulesSchema = z.object({
  minDiscountPercent: z.number().default(0),
  keywordsInclude: z.array(z.string()).optional(),
  keywordsExclude: z.array(z.string()).optional(),
  quietHoursStart: z.string().optional(),
  quietHoursEnd: z.string().optional(),
  aiTone: z.enum(['persuasive', 'informative', 'direct', 'urgent']).default('persuasive'),
});

export type PipelineRules = z.infer<typeof PipelineRulesSchema>;

export const EvaluationResultSchema = z.object({
  passed: z.boolean(),
  reason: z.string().optional(),
  isQuietHours: z.boolean().default(false),
});

export type EvaluationResult = z.infer<typeof EvaluationResultSchema>;

export const AICopyInputSchema = z.object({
  title: z.string(),
  rawText: z.string().optional(),
  originalPrice: z.number().nullable().optional(),
  discountedPrice: z.number(),
  discountPercent: z.number().optional(),
  couponCode: z.string().nullable().optional(),
  store: z.string(),
  tone: z.enum(['persuasive', 'informative', 'direct', 'urgent']).optional().default('persuasive'),
});

export interface AICopyInput {
  title: string;
  rawText?: string;
  originalPrice?: number | null;
  discountedPrice: number;
  discountPercent?: number;
  couponCode?: string | null;
  store: string;
  tone?: 'persuasive' | 'informative' | 'direct' | 'urgent';
}

export const AICopyResultSchema = z.object({
  aiCopy: z.string(),
  extractedCoupon: z.string().nullable(),
  detectedOriginalPrice: z.number().nullable(),
  detectedDiscountedPrice: z.number(),
});

export type AICopyResult = z.infer<typeof AICopyResultSchema>;
