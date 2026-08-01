import {
  AffiliateInjectorInput,
  AffiliateInjectorResult,
} from '../types';

/**
 * Injects tenant affiliate tags into clean canonical URLs for supported e-commerce stores.
 * Handles fallback gracefully when tenant credentials are not provided.
 */
export function injectAffiliateTag(input: AffiliateInjectorInput): AffiliateInjectorResult {
  const { canonicalUrl, store, tenantCredentials, fallbackAwinId } = input;

  try {
    const url = new URL(canonicalUrl);

    switch (store) {
      case 'amazon': {
        const amazonTag = tenantCredentials?.amazonTag;
        if (amazonTag) {
          url.searchParams.set('tag', amazonTag);
          return {
            affiliateUrl: url.toString(),
            store: 'amazon',
            tagApplied: amazonTag,
            isFallback: false,
          };
        }
        break;
      }

      case 'shopee': {
        const shopeeSubId = tenantCredentials?.shopeeSubId;
        if (shopeeSubId) {
          url.searchParams.set('sub_id', shopeeSubId);
          return {
            affiliateUrl: url.toString(),
            store: 'shopee',
            tagApplied: shopeeSubId,
            isFallback: false,
          };
        }
        break;
      }

      case 'mercadolivre': {
        const mlUtmSource = tenantCredentials?.mlUtmSource;
        const mlMattTool = tenantCredentials?.mlMattTool;

        if (mlUtmSource || mlMattTool) {
          if (mlUtmSource) url.searchParams.set('utm_source', mlUtmSource);
          if (mlMattTool) url.searchParams.set('matt_tool', mlMattTool);

          return {
            affiliateUrl: url.toString(),
            store: 'mercadolivre',
            tagApplied: mlUtmSource || mlMattTool || null,
            isFallback: false,
          };
        }
        break;
      }

      default:
        break;
    }

    // Fallback logic: check for Awin universal affiliate wrapping if provided
    const awinId = tenantCredentials?.awinPublisherId || fallbackAwinId;
    if (awinId) {
      const awinWrapperUrl = `https://www.awin1.com/cread.php?awinmid=1000&awinaffid=${encodeURIComponent(awinId)}&ued=${encodeURIComponent(canonicalUrl)}`;
      return {
        affiliateUrl: awinWrapperUrl,
        store,
        tagApplied: awinId,
        isFallback: true,
      };
    }

    // Default fallback: return clean canonical URL
    return {
      affiliateUrl: canonicalUrl,
      store,
      tagApplied: null,
      isFallback: true,
    };
  } catch {
    // Defense against invalid URL inputs
    return {
      affiliateUrl: canonicalUrl,
      store,
      tagApplied: null,
      isFallback: true,
    };
  }
}
