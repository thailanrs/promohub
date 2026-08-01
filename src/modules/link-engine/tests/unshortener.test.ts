import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  detectStore,
  extractAmazonAsin,
  sanitizeAmazonUrl,
  sanitizeMercadoLivreUrl,
  sanitizeShopeeUrl,
  sanitizeUrl,
  unshortenUrl,
} from '../services/unshortener.service';

describe('LinkEngine — Store Detection', () => {
  it('should detect Amazon domains', () => {
    expect(detectStore('https://www.amazon.com.br/dp/B08N5WRWNW')).toBe('amazon');
    expect(detectStore('https://amzn.to/3xyz123')).toBe('amazon');
    expect(detectStore('https://amzn.br/dp/B08N5WRWNW')).toBe('amazon');
  });

  it('should detect Mercado Livre domains', () => {
    expect(detectStore('https://www.mercadolivre.com.br/p/MLB123456')).toBe('mercadolivre');
    expect(detectStore('https://produto.mercadolivre.com.br/MLB-12345678-item')).toBe('mercadolivre');
    expect(detectStore('https://mercadolivre.com/sec/2abcxyz')).toBe('mercadolivre');
  });

  it('should detect Shopee domains', () => {
    expect(detectStore('https://shopee.com.br/product/123/456')).toBe('shopee');
    expect(detectStore('https://shope.ee/8xyz987')).toBe('shopee');
  });

  it('should detect Magalu and AliExpress domains', () => {
    expect(detectStore('https://www.magazineluiza.com.br/produto/123')).toBe('magalu');
    expect(detectStore('https://magalu.me/abc')).toBe('magalu');
    expect(detectStore('https://pt.aliexpress.com/item/1005001.html')).toBe('ali-express');
    expect(detectStore('https://ali.ski/xyz')).toBe('ali-express');
  });

  it('should return other for unknown domains', () => {
    expect(detectStore('https://www.example.com/item')).toBe('other');
  });
});

describe('LinkEngine — Amazon ASIN Extraction & Sanitization', () => {
  it('should extract ASIN from standard /dp/ URL', () => {
    const url = 'https://www.amazon.com.br/Smartphone-Samsung-Galaxy/dp/B08N5WRWNW/ref=sr_1_1';
    expect(extractAmazonAsin(url)).toBe('B08N5WRWNW');
  });

  it('should extract ASIN from /gp/product/ URL', () => {
    const url = 'https://www.amazon.com.br/gp/product/B09XYZ1234?tag=affiliate-20';
    expect(extractAmazonAsin(url)).toBe('B09XYZ1234');
  });

  it('should sanitize Amazon URL and rebuild clean canonical URL without third party tags', () => {
    const dirtyUrl = 'https://www.amazon.com.br/Smartphone/dp/B08N5WRWNW?tag=thirdparty-20&linkCode=df1&ascsubtag=12345&ref_=sr_1_1';
    const result = sanitizeAmazonUrl(dirtyUrl);

    expect(result.productId).toBe('B08N5WRWNW');
    expect(result.canonicalUrl).toBe('https://www.amazon.com.br/dp/B08N5WRWNW');
  });
});

describe('LinkEngine — Mercado Livre Sanitization', () => {
  it('should extract MLB product ID and strip gclid and utm params', () => {
    const dirtyUrl = 'https://produto.mercadolivre.com.br/MLB-3456789012-produto-top?gclid=XYZ123&utm_source=google&utm_medium=cpc&matt_tool=123';
    const result = sanitizeMercadoLivreUrl(dirtyUrl);

    expect(result.productId).toBe('MLB3456789012');
    expect(result.canonicalUrl).not.toContain('gclid');
    expect(result.canonicalUrl).not.toContain('utm_source');
    expect(result.canonicalUrl).not.toContain('matt_tool');
  });
});

describe('LinkEngine — Shopee Sanitization', () => {
  it('should extract product ID and clean tracking parameters', () => {
    const dirtyUrl = 'https://shopee.com.br/Produto-Legal-i.123456.789012?smtt=0.0.9&spm=123&gclid=ABC&utm_source=facebook';
    const result = sanitizeShopeeUrl(dirtyUrl);

    expect(result.productId).toBe('123456.789012');
    expect(result.canonicalUrl).not.toContain('smtt');
    expect(result.canonicalUrl).not.toContain('spm');
    expect(result.canonicalUrl).not.toContain('gclid');
    expect(result.canonicalUrl).not.toContain('utm_source');
  });
});

describe('LinkEngine — Unshortener Service & Fallback', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('should resolve short link via fetch and sanitize final target URL', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      url: 'https://www.amazon.com.br/dp/B08N5WRWNW?tag=oldtag-20',
    } as Response);

    const result = await unshortenUrl('https://amzn.to/3xyz123');

    expect(result.isResolved).toBe(true);
    expect(result.store).toBe('amazon');
    expect(result.productId).toBe('B08N5WRWNW');
    expect(result.canonicalUrl).toBe('https://www.amazon.com.br/dp/B08N5WRWNW');
  });

  it('should handle network error with graceful fallback to raw URL sanitization', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));

    const rawUrl = 'https://produto.mercadolivre.com.br/MLB-1234567890-item?gclid=ABC123';
    const result = await unshortenUrl(rawUrl);

    expect(result.isResolved).toBe(false);
    expect(result.store).toBe('mercadolivre');
    expect(result.productId).toBe('MLB1234567890');
    expect(result.canonicalUrl).not.toContain('gclid');
  });

  it('should handle timeout with graceful fallback', async () => {
    globalThis.fetch = vi.fn().mockImplementation((_, opts) => {
      return new Promise((_, reject) => {
        opts?.signal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });
    });

    const result = await unshortenUrl('https://amzn.to/3timeout', 100);

    expect(result.isResolved).toBe(false);
    expect(result.rawUrl).toBe('https://amzn.to/3timeout');
  });
});
