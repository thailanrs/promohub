import { describe, it, expect } from 'vitest';
import {
  extractUrlsFromText,
  parseIngestionPayload,
} from '../services/ingestion.service';
import {
  generateProductHash,
  isDuplicateOffer,
  isWithinDeduplicationWindow,
} from '../services/deduplication.service';

describe('Ingestion Engine — URL Extractor & Text Parser', () => {
  it('should extract URLs from social media text containing emojis and line breaks', () => {
    const rawText = `🔥 OFERTA IMPERDÍVEL!
Confira este produto top por apenas R$ 99,90!
Acesse aqui: https://www.amazon.com.br/dp/B08N5WRWNW!
E também veja na Shopee: https://shopee.com.br/product/123/456.`;

    const extracted = extractUrlsFromText(rawText);

    expect(extracted).toHaveLength(2);
    expect(extracted[0]).toBe('https://www.amazon.com.br/dp/B08N5WRWNW');
    expect(extracted[1]).toBe('https://shopee.com.br/product/123/456');
  });

  it('should parse ingestion payload and return extracted URLs along with clean copy text', () => {
    const payload = {
      text: 'Super promoção da TV 4K https://produto.mercadolivre.com.br/MLB123456 aproveite!',
      tenantId: '00000000-0000-4000-a000-000000000000',
    };

    const parsed = parseIngestionPayload(payload);

    expect(parsed.extractedUrls).toEqual(['https://produto.mercadolivre.com.br/MLB123456']);
    expect(parsed.cleanText).not.toContain('https://produto.mercadolivre.com.br/MLB123456');
  });
});

describe('Ingestion Engine — Product Hash & Deduplication', () => {
  it('should generate deterministic product hashes for e-commerce products', () => {
    const hash1 = generateProductHash('amazon', 'B08N5WRWNW');
    const hash2 = generateProductHash('AMAZON', 'b08n5wrwnw');

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 hex length
  });

  it('should validate deduplication window within 24 hours', () => {
    const now = new Date('2026-08-01T14:00:00Z');
    const recent = new Date('2026-08-01T10:00:00Z'); // 4 hours ago
    const old = new Date('2026-07-30T10:00:00Z'); // >48 hours ago

    expect(isWithinDeduplicationWindow(recent, 24, now)).toBe(true);
    expect(isWithinDeduplicationWindow(old, 24, now)).toBe(false);
  });

  it('should correctly flag duplicate offers for the same tenant within time window', () => {
    const tenantId = 'tenant_123';
    const now = new Date('2026-08-01T14:00:00Z');

    const existingOffers = [
      {
        id: 'off_1',
        tenantId,
        canonicalUrl: 'https://www.amazon.com.br/dp/B08N5WRWNW',
        createdAt: new Date('2026-08-01T12:00:00Z'), // 2 hours ago
      },
    ];

    const isDup = isDuplicateOffer(
      existingOffers,
      'https://www.amazon.com.br/dp/B08N5WRWNW',
      tenantId,
      24,
      now
    );

    expect(isDup).toBe(true);

    const isDifferentTenantDup = isDuplicateOffer(
      existingOffers,
      'https://www.amazon.com.br/dp/B08N5WRWNW',
      'tenant_456',
      24,
      now
    );

    expect(isDifferentTenantDup).toBe(false);
  });
});
