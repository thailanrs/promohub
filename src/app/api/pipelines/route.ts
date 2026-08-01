import { NextResponse } from 'next/server';
import { db } from '../../../db';
import { pipelines, tenants } from '../../../db/schema';
import { ensureDefaultTenant } from '../../../db/seed-utils';
import { PipelineRulesSchema } from '../../../modules/pipeline/types';

export async function GET() {
  try {
    const tenant = await ensureDefaultTenant();
    if (!tenant) {
      return NextResponse.json({ pipelines: [] });
    }

    const list = await db.select().from(pipelines);
    return NextResponse.json({ pipelines: list });
  } catch (error) {
    console.error('[API Pipelines Error]', error);
    return NextResponse.json({ error: 'Erro ao buscar pipelines do banco.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const tenant = await ensureDefaultTenant();
    const body = await request.json();
    const validated = PipelineRulesSchema.partial().parse(body);

    const [newPipeline] = await db
      .insert(pipelines)
      .values({
        tenantId: tenant?.id!,
        name: body.name || 'Novo Nicho de Ofertas',
        aiTone: validated.aiTone || 'persuasive',
        minDiscountPercent: validated.minDiscountPercent ?? 10,
        keywordsInclude: validated.keywordsInclude || [],
        keywordsExclude: validated.keywordsExclude || [],
        quietHoursStart: validated.quietHoursStart || '01:00',
        quietHoursEnd: validated.quietHoursEnd || '06:00',
        isAutoApprove: body.isAutoApprove ?? false,
        isActive: true,
      })
      .returning();

    return NextResponse.json({ success: true, pipeline: newPipeline });
  } catch (error: any) {
    console.error('[API Create Pipeline Error]', error);
    return NextResponse.json(
      { error: error?.message || 'Dados inválidos para o pipeline.' },
      { status: 400 }
    );
  }
}
