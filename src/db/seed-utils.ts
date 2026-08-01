import { db } from './index';
import { tenants, pipelines, destinations, tenantAffiliateCredentials, offers } from './schema';
import { eq } from 'drizzle-orm';
import { encryptGCM } from '../lib/crypto';

export const DEFAULT_TENANT_ID = '00000000-0000-4000-a000-000000000000';

/**
 * Ensures default tenant, default pipelines, and initial destinations exist in Supabase Postgres.
 */
export async function ensureDefaultTenant() {
  try {
    const existingTenants = await db.select().from(tenants).where(eq(tenants.tenantId, DEFAULT_TENANT_ID));

    if (existingTenants.length === 0) {
      // Create Tenant
      const [newTenant] = await db.insert(tenants).values({
        tenantId: DEFAULT_TENANT_ID,
        name: 'PromoHub Default Tenant',
        slug: 'default-tenant',
        plan: 'pro',
      }).returning();

      const tenantDbId = newTenant.id;

      // Create Default Pipelines
      await db.insert(pipelines).values([
        {
          tenantId: tenantDbId,
          name: 'Eletrônicos & Tech',
          aiTone: 'persuasive',
          minDiscountPercent: 15,
          keywordsInclude: ['smartphone', 'fone', 'headphone', 'alexa', 'tws', 'notebook'],
          keywordsExclude: ['usado', 'reembalado', 'defeito'],
          quietHoursStart: '01:00',
          quietHoursEnd: '06:00',
          isAutoApprove: false,
          isActive: true,
        },
        {
          tenantId: tenantDbId,
          name: 'Bebês & Casa',
          aiTone: 'informative',
          minDiscountPercent: 10,
          keywordsInclude: ['fralda', 'carrinho', 'mamadeira', 'panelas', 'airfryer'],
          keywordsExclude: ['usado'],
          quietHoursStart: '00:00',
          quietHoursEnd: '07:00',
          isAutoApprove: true,
          isActive: true,
        },
      ]);

      // Create Initial Destinations
      await db.insert(destinations).values([
        {
          tenantId: tenantDbId,
          name: 'Grupo WhatsApp Ofertas Tech',
          type: 'whatsapp',
          config: { jid: '1203630123456789@g.us' },
          isActive: true,
        },
        {
          tenantId: tenantDbId,
          name: 'Canal Telegram Promos BR',
          type: 'telegram',
          config: { chatId: '@promosbr_oficial' },
          isActive: true,
        },
      ]);

      // Create Initial Encrypted Credentials
      await db.insert(tenantAffiliateCredentials).values([
        {
          tenantId: tenantDbId,
          store: 'amazon',
          encryptedApiKey: encryptGCM('promohub-20'),
        },
        {
          tenantId: tenantDbId,
          store: 'shopee',
          encryptedApiKey: encryptGCM('promohub_tech'),
        },
      ]);

      // Create Sample Real Initial Offers
      await db.insert(offers).values([
        {
          tenantId: tenantDbId,
          canonicalUrl: 'https://www.amazon.com.br/dp/B09B2SBHQK',
          affiliateUrl: 'https://www.amazon.com.br/dp/B09B2SBHQK?tag=promohub-20',
          shortCode: 'p/echot5',
          store: 'amazon',
          title: 'Echo Dot 5ª Geração | Smart Speaker com Alexa',
          originalPrice: '429.00',
          discountedPrice: '269.10',
          discountPercent: 37,
          couponCode: 'ALEXA10',
          imageUrl: 'https://images.unsplash.com/photo-1543512214-318c7553f230',
          aiCopy: '🔥 MENOR PREÇO DO ANO! Echo Dot 5ª Geração com Alexa por apenas R$ 269,10!\n\n⚡️ Som potente e controle de casa inteligente.\n🎟 Use o cupom ALEXA10.',
          isOutOfStock: false,
          status: 'pending',
        },
        {
          tenantId: tenantDbId,
          canonicalUrl: 'https://shopee.com.br/product/998877/112233',
          affiliateUrl: 'https://shopee.com.br/product/998877/112233?sub_id=promohub_tech',
          shortCode: 'p/fonebt',
          store: 'shopee',
          title: 'Fone de Ouvido Bluetooth Sem Fio TWS',
          originalPrice: '129.90',
          discountedPrice: '49.90',
          discountPercent: 62,
          couponCode: 'FONE20',
          imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df',
          aiCopy: '🎧 Fone Bluetooth TWS com 62% OFF por R$ 49,90 na Shopee!\n\n✨ Bateria duradoura e graves potentes.',
          isOutOfStock: false,
          status: 'pending',
        },
      ]);

      return newTenant;
    }

    return existingTenants[0];
  } catch (error) {
    console.error('Erro no seed tenant:', error);
    return null;
  }
}
