import { z } from 'zod';
import { EnrichedOfferSchema } from '../swipe/types';

export const WhatsAppMessagePayloadSchema = z.object({
  offer: EnrichedOfferSchema,
  destinationJid: z.string(),
  formattedMessage: z.string(),
  imageUrl: z.string().optional(),
});

export type WhatsAppMessagePayload = z.infer<typeof WhatsAppMessagePayloadSchema>;

export const PublishResultSchema = z.object({
  success: z.boolean(),
  messageId: z.string().nullable(),
  destinationJid: z.string(),
  sentAt: z.date(),
  error: z.string().optional(),
});

export type PublishResult = z.infer<typeof PublishResultSchema>;

export const AntiBanConfigSchema = z.object({
  minDelayMs: z.number().default(15000),
  maxDelayMs: z.number().default(45000),
  randomizeTyping: z.boolean().default(true),
});

export type AntiBanConfig = z.infer<typeof AntiBanConfigSchema>;

export const UpdateMessagePayloadSchema = z.object({
  destinationJid: z.string(),
  messageId: z.string(),
  updatedText: z.string(),
});

export type UpdateMessagePayload = z.infer<typeof UpdateMessagePayloadSchema>;
