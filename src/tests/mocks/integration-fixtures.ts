import { RawPayload } from '../../modules/ingestion/types';
import { TenantCredentials } from '../../modules/link-engine/types';
import { PipelineRules } from '../../modules/pipeline/types';

export const mockTenant = {
  id: '7b9b0000-0000-4000-8000-000000000001',
  tenantId: '7b9b0000-0000-4000-8000-000000000001',
  name: 'PromoHub Test Tenant',
  slug: 'promohub-test-tenant',
  customDomain: 'promos.test.com',
  plan: 'pro' as const,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

export const mockCredentials: Record<string, TenantCredentials> = {
  amazon: {
    amazonTag: 'promohub-20',
  },
  shopee: {
    shopeeSubId: 'promohub_tech',
    shopeeAppId: 'app_promohub_123',
  },
  full: {
    amazonTag: 'promohub-20',
    shopeeSubId: 'promohub_tech',
    shopeeAppId: 'app_promohub_123',
    mlUtmSource: 'promohub',
    mlMattTool: 'matt_promohub_999',
    awinPublisherId: 'awin_pub_555',
  },
};

export const mockPipeline: PipelineRules = {
  minDiscountPercent: 10,
  keywordsInclude: ['smartphone', 'echo', 'headphone', 'fone', 'super oferta', 'promoção', 'tws'],
  keywordsExclude: ['usado', 'reembalado', 'defeito'],
  aiTone: 'persuasive',
  quietHoursStart: '02:00',
  quietHoursEnd: '06:00',
};

export const mockRawPayloads = {
  amazon: {
    tenantId: mockTenant.tenantId,
    text: '🔥 Ofertão imperdível! Smartphone Echo Dot 5ª Geração com Alexa por apenas R$ 299,00! Confira: https://amzn.to/3Xyz123?ref=social_share&tag=oldtag-20',
    rawUrl: 'https://amzn.to/3Xyz123?ref=social_share&tag=oldtag-20',
    sourceId: 'src_telegram_01',
    metadata: { channel: 'telegram', channelId: '-100123456789' },
  } as RawPayload,

  shopee: {
    tenantId: mockTenant.tenantId,
    text: '⚡️ Fone TWS Bluetooth sem fio em Super Oferta com frete grátis! Link: https://shope.ee/987654321?smtt=0.0.9&spm=123',
    rawUrl: 'https://shope.ee/987654321?smtt=0.0.9&spm=123',
    sourceId: 'src_webhook_02',
    metadata: { channel: 'webhook' },
  } as RawPayload,

  rejectedLowDiscount: {
    tenantId: mockTenant.tenantId,
    text: 'Oferta de Fone Bluetooth com apenas 5% de desconto por R$ 95,00! Confira: https://amzn.to/3LowDisc',
    rawUrl: 'https://amzn.to/3LowDisc',
    sourceId: 'src_manual_03',
  } as RawPayload,
};
