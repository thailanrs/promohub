import { describe, it, expect } from 'vitest';
import { encryptGCM, decryptGCM } from '../../../lib/crypto';
import { injectAffiliateTag } from '../services/affiliate-injector.service';
import { TenantCredentials } from '../types';

describe('Crypto Helper — AES-256-GCM', () => {
  it('should encrypt and decrypt string payload successfully', () => {
    const secretText = 'amzn_api_key_secret_token_12345';
    const encrypted = encryptGCM(secretText);

    expect(encrypted).toContain(':');
    expect(encrypted.split(':')).toHaveLength(3);

    const decrypted = decryptGCM(encrypted);
    expect(decrypted).toBe(secretText);
  });

  it('should encrypt and decrypt using custom secret key', () => {
    const customKey = 'custom_32_bytes_secret_key_for_test!';
    const secretText = 'shopee_partner_key_secret';

    const encrypted = encryptGCM(secretText, customKey);
    const decrypted = decryptGCM(encrypted, customKey);

    expect(decrypted).toBe(secretText);
  });

  it('should throw error when deciphering tampered payload', () => {
    const encrypted = encryptGCM('valid_payload');
    const tampered = encrypted.substring(0, encrypted.length - 4) + 'abcd';

    expect(() => decryptGCM(tampered)).toThrow();
  });
});

describe('LinkEngine — Affiliate Tag Injection', () => {
  it('should inject Amazon tag into clean canonical URL', () => {
    const credentials: TenantCredentials = {
      amazonTag: 'promohub-20',
    };

    const result = injectAffiliateTag({
      canonicalUrl: 'https://www.amazon.com.br/dp/B08N5WRWNW',
      store: 'amazon',
      tenantCredentials: credentials,
    });

    expect(result.isFallback).toBe(false);
    expect(result.tagApplied).toBe('promohub-20');
    expect(result.affiliateUrl).toBe('https://www.amazon.com.br/dp/B08N5WRWNW?tag=promohub-20');
  });

  it('should inject sub_id into Shopee clean URL', () => {
    const credentials: TenantCredentials = {
      shopeeSubId: 'my_shopee_sub_123',
    };

    const result = injectAffiliateTag({
      canonicalUrl: 'https://shopee.com.br/product/123/456',
      store: 'shopee',
      tenantCredentials: credentials,
    });

    expect(result.isFallback).toBe(false);
    expect(result.tagApplied).toBe('my_shopee_sub_123');
    expect(result.affiliateUrl).toBe('https://shopee.com.br/product/123/456?sub_id=my_shopee_sub_123');
  });

  it('should inject utm_source and matt_tool into Mercado Livre URL', () => {
    const credentials: TenantCredentials = {
      mlUtmSource: 'promohub_channel',
      mlMattTool: '998877',
    };

    const result = injectAffiliateTag({
      canonicalUrl: 'https://produto.mercadolivre.com.br/MLB123456',
      store: 'mercadolivre',
      tenantCredentials: credentials,
    });

    expect(result.isFallback).toBe(false);
    expect(result.tagApplied).toBe('promohub_channel');
    expect(result.affiliateUrl).toContain('utm_source=promohub_channel');
    expect(result.affiliateUrl).toContain('matt_tool=998877');
  });

  it('should fallback gracefully to clean canonical URL when tenant has no credentials for store', () => {
    const credentials: TenantCredentials = {
      amazonTag: 'other-tag-20', // No shopee credentials
    };

    const result = injectAffiliateTag({
      canonicalUrl: 'https://shopee.com.br/product/123/456',
      store: 'shopee',
      tenantCredentials: credentials,
    });

    expect(result.isFallback).toBe(true);
    expect(result.tagApplied).toBeNull();
    expect(result.affiliateUrl).toBe('https://shopee.com.br/product/123/456');
  });

  it('should wrap URL with Awin deep link when fallbackAwinId is provided', () => {
    const result = injectAffiliateTag({
      canonicalUrl: 'https://www.magazineluiza.com.br/produto/123',
      store: 'magalu',
      fallbackAwinId: 'awin_pub_9999',
    });

    expect(result.isFallback).toBe(true);
    expect(result.tagApplied).toBe('awin_pub_9999');
    expect(result.affiliateUrl).toContain('https://www.awin1.com/cread.php');
    expect(result.affiliateUrl).toContain('awinaffid=awin_pub_9999');
  });
});
