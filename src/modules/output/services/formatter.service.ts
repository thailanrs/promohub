import { EnrichedOffer } from '../../swipe/types';

const STORE_EMOJI_MAP: Record<EnrichedOffer['store'], string> = {
  amazon: '📦',
  shopee: '🧡',
  mercadolivre: '⚡️',
  magalu: '🛍',
  'ali-express': '🌐',
  other: '🔥',
};

/**
 * Formats an EnrichedOffer into WhatsApp markdown syntax with rich emojis, pricing, and coupon details.
 */
export function formatOfferForWhatsApp(offer: EnrichedOffer): string {
  const storeEmoji = STORE_EMOJI_MAP[offer.store] || '🔥';

  const formattedDiscounted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
    .format(offer.discountedPrice)
    .replace(/\u00A0/g, ' ');

  const formattedOriginal = offer.originalPrice
    ? new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
        .format(offer.originalPrice)
        .replace(/\u00A0/g, ' ')
    : null;

  const lines: string[] = [];

  if (offer.isOutOfStock) {
    lines.push('❌ *[OFERTA ESGOTADA]*');
    lines.push('');
  }

  // Header line
  lines.push(`${storeEmoji} *${offer.title}*`);
  lines.push('');

  // Price line
  if (formattedOriginal) {
    lines.push(`~De: ${formattedOriginal}~`);
  }
  lines.push(`💥 *Por: ${formattedDiscounted}*${offer.discountPercent > 0 ? ` (${offer.discountPercent}% OFF)` : ''}`);
  lines.push('');

  // Coupon line
  if (offer.couponCode) {
    lines.push(`🎟 *Cupom:* \`${offer.couponCode}\``);
    lines.push('');
  }

  // AI Copy line
  if (offer.aiCopy) {
    lines.push(offer.aiCopy);
    lines.push('');
  }

  // Link line
  lines.push(`🛒 *Compre aqui:* ${offer.affiliateUrl}`);

  return lines.join('\n');
}

/**
 * Prepends out-of-stock indicator to an existing formatted WhatsApp message.
 */
export function appendOutOfStockToMessage(formattedMessage: string): string {
  if (formattedMessage.includes('❌ *[OFERTA ESGOTADA]*')) {
    return formattedMessage;
  }
  return `❌ *[OFERTA ESGOTADA]*\n\n${formattedMessage}`;
}
