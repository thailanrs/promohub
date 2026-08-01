import { AICopyInput, AICopyResult } from '../types';

/**
 * Builds a structured prompt for LLMs (Gemini / OpenAI / Claude) to generate high-converting promotional copies.
 */
export function buildCopyPrompt(input: AICopyInput): string {
  const { title, store, discountedPrice, originalPrice, couponCode, tone, rawText } = input;

  return `Você é um Copywriter especialista em Marketing de Afiliados no e-commerce.

Crie uma mensagem promocional curta, persuasiva e altamente engajadora para postagem em grupos de ofertas no WhatsApp e Telegram.

[DADOS DA OFERTA]
- Produto: ${title}
- Loja: ${store}
- Preço Promocional: R$ ${discountedPrice.toFixed(2)}
${originalPrice ? `- Preço Original: R$ ${originalPrice.toFixed(2)}` : ''}
${couponCode ? `- Cupom de Desconto: ${couponCode}` : ''}
${rawText ? `- Texto Bruto de Origem: ${rawText}` : ''}
- Tom de Voz Solicitado: ${tone}

[REGRAS DE FORMATAÇÃO]
1. Use a sintaxe Markdown do WhatsApp (*negrito*, ~tachado~, \`cupom em código\`).
2. Mantenha o texto objetivo (máximo 4 linhas de corpo).
3. Inclua um call-to-action chamativo no final.
4. Responda apenas com o texto final da copy, sem explicações adicionais.`;
}

/**
 * Deterministic fallback copy generator when LLM API is unavailable.
 * Generates copy tailored to the tenant's chosen tone.
 */
export function generateFallbackCopy(input: AICopyInput): AICopyResult {
  const { title, discountedPrice, originalPrice, couponCode, tone } = input;

  const formattedDiscounted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(discountedPrice);

  const formattedOriginal = originalPrice
    ? new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(originalPrice)
    : null;

  let copyBody = '';

  switch (tone) {
    case 'urgent':
      copyBody = `⚡️ CORRA! OPORTUNIDADE POR TEMPO LIMITADO!\n${title} em super oferta por apenas ${formattedDiscounted}!`;
      break;

    case 'informative':
      copyBody = `📌 Destaque de Oferta:\n${title}\nValor atualizado para ${formattedDiscounted}.`;
      break;

    case 'direct':
      copyBody = `🔥 ${title}\nPor ${formattedDiscounted}`;
      break;

    case 'persuasive':
    default:
      copyBody = `🔥 MENOR PREÇO DETECTADO!\n${title} está com um desconto incrível por apenas ${formattedDiscounted}!`;
      break;
  }

  if (formattedOriginal && originalPrice && originalPrice > discountedPrice) {
    copyBody += `\nDe: ${formattedOriginal}`;
  }

  if (couponCode) {
    copyBody += `\n🎟 Use o cupom: ${couponCode}`;
  }

  return {
    aiCopy: copyBody,
    extractedCoupon: couponCode || null,
    detectedOriginalPrice: originalPrice || null,
    detectedDiscountedPrice: discountedPrice,
  };
}

/**
 * Main AI Copywriting entry point. Invokes LLM provider if provided, falling back to deterministic generator on failure.
 */
export async function generateAICopy(
  input: AICopyInput,
  llmProvider?: (prompt: string) => Promise<string>
): Promise<AICopyResult> {
  if (llmProvider) {
    try {
      const prompt = buildCopyPrompt(input);
      const generatedCopy = await llmProvider(prompt);

      if (generatedCopy && generatedCopy.trim().length > 10) {
        return {
          aiCopy: generatedCopy.trim(),
          extractedCoupon: input.couponCode || null,
          detectedOriginalPrice: input.originalPrice || null,
          detectedDiscountedPrice: input.discountedPrice,
        };
      }
    } catch {
      // Fallback gracioso em caso de timeout/erro na API externa do LLM
    }
  }

  return generateFallbackCopy(input);
}
