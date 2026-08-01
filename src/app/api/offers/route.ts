import { NextResponse } from 'next/server';
import { db } from '../../../db';
import { offers } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { ensureDefaultTenant } from '../../../db/seed-utils';

export async function GET() {
  try {
    await ensureDefaultTenant();
    const offerList = await db
      .select()
      .from(offers)
      .where(eq(offers.status, 'pending'));

    const formattedOffers = offerList.map((off) => ({
      id: off.id,
      tenantId: off.tenantId,
      pipelineId: off.pipelineId || 'pip_default',
      canonicalUrl: off.canonicalUrl,
      affiliateUrl: off.affiliateUrl,
      shortCode: off.shortCode,
      store: off.store,
      title: off.title,
      originalPrice: off.originalPrice ? parseFloat(off.originalPrice) : null,
      discountedPrice: parseFloat(off.discountedPrice),
      discountPercent: off.discountPercent,
      couponCode: off.couponCode,
      imageUrl: off.imageUrl,
      aiCopy: off.aiCopy,
      isOutOfStock: off.isOutOfStock,
      status: off.status,
      createdAt: off.createdAt,
    }));

    return NextResponse.json({ offers: formattedOffers });
  } catch (error) {
    console.error('[API Offers Error]', error);
    return NextResponse.json(
      { error: 'Falha ao buscar ofertas do banco de dados.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, title, discountedPrice, aiCopy, couponCode } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID da oferta é obrigatório' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (title) updateData.title = title;
    if (discountedPrice) updateData.discountedPrice = String(discountedPrice);
    if (aiCopy) updateData.aiCopy = aiCopy;
    if (couponCode !== undefined) updateData.couponCode = couponCode;

    updateData.updatedAt = new Date();

    const [updated] = await db
      .update(offers)
      .set(updateData)
      .where(eq(offers.id, id))
      .returning();

    return NextResponse.json({ success: true, offer: updated });
  } catch (error) {
    console.error('[API Update Offer Error]', error);
    return NextResponse.json({ error: 'Falha ao atualizar oferta no Supabase.' }, { status: 500 });
  }
}
