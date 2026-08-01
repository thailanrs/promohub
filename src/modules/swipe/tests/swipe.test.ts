import { describe, it, expect } from 'vitest';
import { EnrichedOfferSchema } from '../types';
import { STORE_LABEL_MAP } from '../components/SwipeCard';

describe('Swipe Module — Schema & Types', () => {
  it('should validate EnrichedOffer Zod schema correctly', () => {
    const validOffer = {
      id: '11111111-1111-4111-a111-111111111111',
      tenantId: '00000000-0000-4000-a000-000000000000',
      pipelineId: '22222222-2222-4222-a222-222222222222',
      canonicalUrl: 'https://www.amazon.com.br/dp/B08N5WRWNW',
      affiliateUrl: 'https://www.amazon.com.br/dp/B08N5WRWNW?tag=promohub-20',
      shortCode: 'p/abc12',
      store: 'amazon' as const,
      title: 'Test Offer Title',
      originalPrice: 199.9,
      discountedPrice: 99.9,
      discountPercent: 50,
      couponCode: 'TEST50',
      imageUrl: 'https://example.com/image.jpg',
      aiCopy: 'Generated AI copy preview text',
      isOutOfStock: false,
      status: 'pending' as const,
      createdAt: new Date(),
    };

    const parsed = EnrichedOfferSchema.safeParse(validOffer);
    expect(parsed.success).toBe(true);
  });

  it('should contain store labels for all supported stores', () => {
    const stores = ['amazon', 'shopee', 'mercadolivre', 'magalu', 'ali-express', 'other'] as const;
    stores.forEach((store) => {
      expect(STORE_LABEL_MAP[store], `Label for ${store} should be defined`).toBeDefined();
      expect(STORE_LABEL_MAP[store].name).toBeTruthy();
    });
  });
});
