import { NextResponse } from 'next/server';
import { db } from '../../../db';
import { tenantAffiliateCredentials } from '../../../db/schema';
import { ensureDefaultTenant } from '../../../db/seed-utils';
import { encryptGCM, decryptGCM } from '../../../lib/crypto';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const tenant = await ensureDefaultTenant();
    if (!tenant) return NextResponse.json({ credentials: {} });

    const credList = await db
      .select()
      .from(tenantAffiliateCredentials)
      .where(eq(tenantAffiliateCredentials.tenantId, tenant.id));

    const result: Record<string, string> = {};

    credList.forEach((c) => {
      let decrypted = '';
      try {
        if (c.encryptedApiKey) {
          decrypted = decryptGCM(c.encryptedApiKey);
        }
      } catch {
        decrypted = '••••••••';
      }

      if (c.store === 'amazon') result.amazonTag = decrypted;
      if (c.store === 'shopee') result.shopeeSubId = decrypted;
      if (c.store === 'mercadolivre') result.mlUtmSource = decrypted;
      if (c.store === 'awin') result.awinPublisherId = decrypted;
    });

    return NextResponse.json({ credentials: result });
  } catch (error) {
    console.error('[API Get Credentials Error]', error);
    return NextResponse.json({ error: 'Erro ao buscar credenciais do banco.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const tenant = await ensureDefaultTenant();
    if (!tenant) return NextResponse.json({ error: 'Tenant inválido' }, { status: 400 });

    const body = await request.json();
    const { amazonTag, shopeeSubId, mlUtmSource, awinPublisherId } = body;

    const updates = [
      { store: 'amazon', key: amazonTag },
      { store: 'shopee', key: shopeeSubId },
      { store: 'mercadolivre', key: mlUtmSource },
      { store: 'awin', key: awinPublisherId },
    ];

    for (const item of updates) {
      if (item.key) {
        const encrypted = encryptGCM(item.key);

        const existing = await db
          .select()
          .from(tenantAffiliateCredentials)
          .where(eq(tenantAffiliateCredentials.tenantId, tenant.id));

        const found = existing.find((c) => c.store === item.store);

        if (found) {
          await db
            .update(tenantAffiliateCredentials)
            .set({ encryptedApiKey: encrypted, updatedAt: new Date() })
            .where(eq(tenantAffiliateCredentials.id, found.id));
        } else {
          await db.insert(tenantAffiliateCredentials).values({
            tenantId: tenant.id,
            store: item.store,
            encryptedApiKey: encrypted,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Credenciais salvas e salvas com criptografia AES-256 no banco Supabase com sucesso!',
    });
  } catch (error) {
    console.error('[API Save Credentials Error]', error);
    return NextResponse.json({ error: 'Falha ao salvar credenciais no banco.' }, { status: 500 });
  }
}
