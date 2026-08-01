import {
  RawUrlInput,
  StoreEnum,
  UnshortenedResult,
} from '../types';

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

/**
 * Detects the e-commerce store from the given URL.
 */
export function detectStore(urlStr: string): StoreEnum {
  try {
    const url = new URL(urlStr);
    const host = url.hostname.toLowerCase();

    if (host.includes('amazon.') || host === 'amzn.to' || host === 'amzn.br') {
      return 'amazon';
    }
    if (host.includes('shopee.') || host === 'shope.ee') {
      return 'shopee';
    }
    if (
      host.includes('mercadolivre.') ||
      host.includes('mercadolibre.') ||
      host.includes('mercado.livre')
    ) {
      return 'mercadolivre';
    }
    if (host.includes('magazineluiza.') || host === 'magalu.me') {
      return 'magalu';
    }
    if (host.includes('aliexpress.') || host === 'ali.ski') {
      return 'ali-express';
    }

    return 'other';
  } catch {
    return 'other';
  }
}

/**
 * Extracts Amazon ASIN (10-character alphanumeric code) from URL.
 */
export function extractAmazonAsin(urlStr: string): string | null {
  const asinPatterns = [
    /[\/\?\&](?:dp|gp\/product|product|ASIN)\/([A-Z0-9]{10})/i,
    /\/d\/([A-Z0-9]{10})/i,
    /asin=([A-Z0-9]{10})/i,
  ];

  for (const pattern of asinPatterns) {
    const match = urlStr.match(pattern);
    if (match && match[1]) {
      return match[1].toUpperCase();
    }
  }

  return null;
}

/**
 * Sanitizes Amazon URL, extracting ASIN and stripping third-party tracking tags.
 */
export function sanitizeAmazonUrl(urlStr: string): { canonicalUrl: string; productId: string | null } {
  const asin = extractAmazonAsin(urlStr);

  if (asin) {
    return {
      canonicalUrl: `https://www.amazon.com.br/dp/${asin}`,
      productId: asin,
    };
  }

  try {
    const url = new URL(urlStr);
    const paramsToClean = [
      'tag',
      'linkCode',
      'ascsubtag',
      'ref',
      'ref_',
      'pf_rd_r',
      'pf_rd_p',
      'pd_rd_r',
      'pd_rd_w',
      'pd_rd_wg',
      'smid',
      'qid',
      'sr',
      'crid',
      'sprefix',
      'keywords',
    ];

    paramsToClean.forEach((param) => url.searchParams.delete(param));

    return {
      canonicalUrl: url.toString(),
      productId: null,
    };
  } catch {
    return {
      canonicalUrl: urlStr,
      productId: null,
    };
  }
}

/**
 * Sanitizes Mercado Livre URL, extracting product ID and stripping tracking params.
 */
export function sanitizeMercadoLivreUrl(urlStr: string): { canonicalUrl: string; productId: string | null } {
  let productId: string | null = null;
  const mlbMatch = urlStr.match(/(MLB-?\d+)/i);
  if (mlbMatch && mlbMatch[1]) {
    productId = mlbMatch[1].toUpperCase().replace('-', '');
  }

  try {
    const url = new URL(urlStr);
    const paramsToClean = [
      'gclid',
      'matt_tool',
      'matt_word',
      'pdp_filters',
      'searchVariation',
      'attributes',
      'search_layout',
      'position',
      'type',
      'tracking_id',
    ];

    // Clean tracking params and utm_*
    Array.from(url.searchParams.keys()).forEach((key) => {
      if (key.startsWith('utm_') || paramsToClean.includes(key)) {
        url.searchParams.delete(key);
      }
    });

    return {
      canonicalUrl: url.toString(),
      productId,
    };
  } catch {
    return {
      canonicalUrl: urlStr,
      productId,
    };
  }
}

/**
 * Sanitizes Shopee URL, extracting product ID and stripping tracking params.
 */
export function sanitizeShopeeUrl(urlStr: string): { canonicalUrl: string; productId: string | null } {
  let productId: string | null = null;

  const productMatch = urlStr.match(/-i\.(\d+)\.(\d+)/) || urlStr.match(/\/product\/(\d+)\/(\d+)/);
  if (productMatch && productMatch[1] && productMatch[2]) {
    productId = `${productMatch[1]}.${productMatch[2]}`;
  }

  try {
    const url = new URL(urlStr);
    const paramsToClean = ['smtt', 'spm', 'gclid', 'deep_link', 'is_from_signup'];

    Array.from(url.searchParams.keys()).forEach((key) => {
      if (key.startsWith('utm_') || key.startsWith('af_') || paramsToClean.includes(key)) {
        url.searchParams.delete(key);
      }
    });

    return {
      canonicalUrl: url.toString(),
      productId,
    };
  } catch {
    return {
      canonicalUrl: urlStr,
      productId,
    };
  }
}

/**
 * Generic URL sanitizer stripping common analytics & ad trackers.
 */
export function sanitizeGenericUrl(urlStr: string): { canonicalUrl: string; productId: string | null } {
  try {
    const url = new URL(urlStr);
    const trackingParams = ['gclid', 'fbclid', 'msclkid', 'twclid'];

    Array.from(url.searchParams.keys()).forEach((key) => {
      if (key.startsWith('utm_') || trackingParams.includes(key)) {
        url.searchParams.delete(key);
      }
    });

    return {
      canonicalUrl: url.toString(),
      productId: null,
    };
  } catch {
    return {
      canonicalUrl: urlStr,
      productId: null,
    };
  }
}

/**
 * Main URL sanitizer routing to the appropriate store sanitizer.
 */
export function sanitizeUrl(urlStr: string): { canonicalUrl: string; store: StoreEnum; productId: string | null } {
  const store = detectStore(urlStr);

  switch (store) {
    case 'amazon': {
      const { canonicalUrl, productId } = sanitizeAmazonUrl(urlStr);
      return { canonicalUrl, store, productId };
    }
    case 'mercadolivre': {
      const { canonicalUrl, productId } = sanitizeMercadoLivreUrl(urlStr);
      return { canonicalUrl, store, productId };
    }
    case 'shopee': {
      const { canonicalUrl, productId } = sanitizeShopeeUrl(urlStr);
      return { canonicalUrl, store, productId };
    }
    default: {
      const { canonicalUrl, productId } = sanitizeGenericUrl(urlStr);
      return { canonicalUrl, store, productId };
    }
  }
}

/**
 * Resolves short links via HTTP GET request with timeout and graceful fallback.
 */
export async function unshortenUrl(
  input: RawUrlInput | string,
  timeoutMs = 5000
): Promise<UnshortenedResult> {
  const rawUrl = typeof input === 'string' ? input : input.rawUrl;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(rawUrl, {
      method: 'GET',
      headers: {
        'User-Agent': DEFAULT_USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      redirect: 'follow',
      signal: controller.signal,
    });

    clearTimeout(timer);

    const finalUrl = response.url || rawUrl;
    const { canonicalUrl, store, productId } = sanitizeUrl(finalUrl);

    return {
      canonicalUrl,
      store,
      productId,
      rawUrl,
      isResolved: true,
    };
  } catch {
    clearTimeout(timer);

    // Fallback: sanitize the raw URL directly without network resolution
    const { canonicalUrl, store, productId } = sanitizeUrl(rawUrl);

    return {
      canonicalUrl,
      store,
      productId,
      rawUrl,
      isResolved: false,
    };
  }
}
