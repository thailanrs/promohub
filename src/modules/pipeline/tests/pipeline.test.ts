import { describe, it, expect, vi } from 'vitest';
import {
  evaluateDiscount,
  evaluateKeywords,
  isInQuietHours,
  evaluatePipelineRules,
} from '../services/rules-evaluator.service';
import {
  buildCopyPrompt,
  generateFallbackCopy,
  generateAICopy,
} from '../services/ai-copywriter.service';
import { PipelineRules } from '../types';

describe('Pipeline Engine — Rules Evaluator', () => {
  it('should evaluate minimum discount requirement correctly', () => {
    expect(evaluateDiscount(30, 20).passed).toBe(true);
    expect(evaluateDiscount(15, 20).passed).toBe(false);
    expect(evaluateDiscount(15, 20).reason).toContain('menor que o mínimo exigido');
  });

  it('should reject offers containing excluded keywords', () => {
    const res = evaluateKeywords('Smartphone Samsung Usado em bom estado', [], ['usado', 'recondicionado']);
    expect(res.passed).toBe(false);
    expect(res.reason).toContain('usado');
  });

  it('should reject offers that fail required inclusion keywords', () => {
    const res = evaluateKeywords('Notebook Dell Inspiron i5', ['fralda', 'pampers'], []);
    expect(res.passed).toBe(false);
    expect(res.reason).toContain('palavras-chave obrigatórias');
  });

  it('should approve offers meeting both inclusion and exclusion criteria', () => {
    const res = evaluateKeywords('Fralda Pampers Pants Pote G', ['fralda', 'pampers'], ['usado']);
    expect(res.passed).toBe(true);
  });

  it('should evaluate Quiet Hours overnight ranges correctly', () => {
    // Range 23:00 to 07:00
    expect(isInQuietHours('01:30', '23:00', '07:00')).toBe(true);
    expect(isInQuietHours('23:30', '23:00', '07:00')).toBe(true);
    expect(isInQuietHours('14:00', '23:00', '07:00')).toBe(false);
  });

  it('should combine rules in evaluatePipelineRules', () => {
    const rules: PipelineRules = {
      minDiscountPercent: 20,
      keywordsExclude: ['usado'],
      quietHoursStart: '23:00',
      quietHoursEnd: '07:00',
      aiTone: 'persuasive',
    };

    const offer = {
      title: 'Echo Dot 5ª Geração',
      discountPercent: 30,
    };

    const refTimeNight = new Date('2026-08-01T02:00:00Z');
    const resultNight = evaluatePipelineRules(offer, rules, refTimeNight);

    expect(resultNight.passed).toBe(true);
    expect(resultNight.isQuietHours).toBe(true);
  });
});

describe('Pipeline Engine — AI Copywriter', () => {
  it('should build structured LLM prompt with offer details', () => {
    const prompt = buildCopyPrompt({
      title: 'Echo Dot 5ª Geração',
      store: 'amazon',
      discountedPrice: 269.1,
      originalPrice: 429.0,
      couponCode: 'ALEXA10',
      tone: 'persuasive',
    });

    expect(prompt).toContain('Echo Dot 5ª Geração');
    expect(prompt).toContain('ALEXA10');
    expect(prompt).toContain('persuasive');
  });

  it('should generate fallback copy for different tenant tones', () => {
    const urgentResult = generateFallbackCopy({
      title: 'Smart TV 55 4K',
      store: 'mercadolivre',
      discountedPrice: 2199,
      tone: 'urgent',
    });
    expect(urgentResult.aiCopy).toContain('⚡️ CORRA!');

    const informativeResult = generateFallbackCopy({
      title: 'Smart TV 55 4K',
      store: 'mercadolivre',
      discountedPrice: 2199,
      tone: 'informative',
    });
    expect(informativeResult.aiCopy).toContain('📌 Destaque de Oferta:');
  });

  it('should call LLM provider when present and fallback gracefully on error', async () => {
    const mockLlm = vi.fn().mockResolvedValue('✨ Copy gerada por IA de teste!');
    const result = await generateAICopy(
      {
        title: 'Fone Bluetooth TWS',
        store: 'shopee',
        discountedPrice: 49.9,
      },
      mockLlm
    );

    expect(result.aiCopy).toBe('✨ Copy gerada por IA de teste!');

    // Test failure fallback
    const failingLlm = vi.fn().mockRejectedValue(new Error('LLM Timeout'));
    const fallbackResult = await generateAICopy(
      {
        title: 'Fone Bluetooth TWS',
        store: 'shopee',
        discountedPrice: 49.9,
      },
      failingLlm
    );

    expect(fallbackResult.aiCopy).toContain('Fone Bluetooth TWS');
  });
});
