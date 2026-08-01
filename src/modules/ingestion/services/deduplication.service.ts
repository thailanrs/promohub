import crypto from 'crypto';

/**
 * Generates a unique 64-character SHA-256 hash for an e-commerce product offer.
 * Uses store and productId (or canonical fallback URL) to ensure uniqueness per item.
 */
export function generateProductHash(store: string, productId: string | null, fallbackUrl?: string): string {
  const storeNormalized = (store || 'other').trim().toLowerCase();
  const identifierNormalized = (productId || fallbackUrl || 'unknown').trim().toLowerCase();
  const rawKey = `${storeNormalized}:${identifierNormalized}`;

  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

/**
 * Checks if a timestamp falls within the specified deduplication window (in hours).
 */
export function isWithinDeduplicationWindow(createdAt: Date, windowHours = 24, referenceDate = new Date()): boolean {
  const diffMs = referenceDate.getTime() - new Date(createdAt).getTime();
  const windowMs = windowHours * 60 * 60 * 1000;

  return diffMs >= 0 && diffMs <= windowMs;
}

export interface ExistingOfferRecord {
  id: string;
  tenantId: string;
  canonicalUrl: string;
  createdAt: Date;
}

/**
 * Validates if an offer URL is a duplicate for the given tenant within the time window.
 */
export function isDuplicateOffer(
  existingOffers: ExistingOfferRecord[],
  targetCanonicalUrl: string,
  tenantId: string,
  windowHours = 24,
  referenceDate = new Date()
): boolean {
  const normalizedTarget = targetCanonicalUrl.trim().toLowerCase();

  return existingOffers.some((offer) => {
    if (offer.tenantId !== tenantId) return false;

    const normalizedExisting = offer.canonicalUrl.trim().toLowerCase();
    const isSameUrl = normalizedExisting === normalizedTarget;
    const isRecent = isWithinDeduplicationWindow(offer.createdAt, windowHours, referenceDate);

    return isSameUrl && isRecent;
  });
}
