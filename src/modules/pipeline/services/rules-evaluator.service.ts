import { EvaluationResult, PipelineRules } from '../types';

/**
 * Validates if the offer discount percentage meets or exceeds the pipeline's minimum requirement.
 */
export function evaluateDiscount(
  discountPercent: number,
  minDiscountPercent: number
): { passed: boolean; reason?: string } {
  if (discountPercent < minDiscountPercent) {
    return {
      passed: false,
      reason: `Desconto de ${discountPercent}% é menor que o mínimo exigido de ${minDiscountPercent}%`,
    };
  }
  return { passed: true };
}

/**
 * Validates offer text against pipeline inclusion and exclusion keyword rules.
 */
export function evaluateKeywords(
  text: string,
  keywordsInclude?: string[],
  keywordsExclude?: string[]
): { passed: boolean; reason?: string } {
  const normalizedText = (text || '').toLowerCase();

  // 1. Exclusion filter (Reject if any excluded keyword is present)
  if (keywordsExclude && keywordsExclude.length > 0) {
    for (const kw of keywordsExclude) {
      const normalizedKw = kw.trim().toLowerCase();
      if (normalizedKw && normalizedText.includes(normalizedKw)) {
        return {
          passed: false,
          reason: `Contém palavra-chave excluída: "${kw}"`,
        };
      }
    }
  }

  // 2. Inclusion filter (Reject if inclusion list is defined but no keyword matches)
  if (keywordsInclude && keywordsInclude.length > 0) {
    const validIncludes = keywordsInclude.map((k) => k.trim().toLowerCase()).filter(Boolean);
    if (validIncludes.length > 0) {
      const hasMatchingInclude = validIncludes.some((kw) => normalizedText.includes(kw));
      if (!hasMatchingInclude) {
        return {
          passed: false,
          reason: `Não contém nenhuma das palavras-chave obrigatórias: [${validIncludes.join(', ')}]`,
        };
      }
    }
  }

  return { passed: true };
}

/**
 * Helper to convert "HH:MM" string into minutes from midnight (0 to 1439).
 */
function timeStringToMinutes(timeStr: string): number | null {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/**
 * Checks if the current time falls within the configured Quiet Hours window.
 * Supports overnight windows (e.g. 23:00 to 07:00).
 */
export function isInQuietHours(
  currentTimeStr: string,
  startStr?: string,
  endStr?: string
): boolean {
  if (!startStr || !endStr) return false;

  const currentMin = timeStringToMinutes(currentTimeStr);
  const startMin = timeStringToMinutes(startStr);
  const endMin = timeStringToMinutes(endStr);

  if (currentMin === null || startMin === null || endMin === null) return false;

  if (startMin <= endMin) {
    // Daytime range (e.g., 13:00 to 17:00)
    return currentMin >= startMin && currentMin <= endMin;
  } else {
    // Overnight range (e.g., 23:00 to 07:00)
    return currentMin >= startMin || currentMin <= endMin;
  }
}

/**
 * Main pipeline evaluator assessing discount minimum, keyword rules, and quiet hours.
 */
export function evaluatePipelineRules(
  offer: { title: string; text?: string; discountPercent: number },
  rules: PipelineRules,
  referenceTime = new Date()
): EvaluationResult {
  // 1. Discount Evaluation
  const discountEval = evaluateDiscount(offer.discountPercent, rules.minDiscountPercent);
  if (!discountEval.passed) {
    return {
      passed: false,
      reason: discountEval.reason,
      isQuietHours: false,
    };
  }

  // 2. Keyword Evaluation
  const fullText = `${offer.title} ${offer.text || ''}`;
  const keywordEval = evaluateKeywords(fullText, rules.keywordsInclude, rules.keywordsExclude);
  if (!keywordEval.passed) {
    return {
      passed: false,
      reason: keywordEval.reason,
      isQuietHours: false,
    };
  }

  // 3. Quiet Hours Check
  const currentHours = referenceTime.getHours().toString().padStart(2, '0');
  const currentMinutes = referenceTime.getMinutes().toString().padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMinutes}`;

  const isQuiet = isInQuietHours(currentTimeStr, rules.quietHoursStart, rules.quietHoursEnd);

  return {
    passed: true,
    isQuietHours: isQuiet,
  };
}
