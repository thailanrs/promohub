import { NextResponse } from 'next/server';
import { PipelineRulesSchema } from '../../../modules/pipeline/types';

// Mock in-memory state for initial demo pipelines
let mockPipelinesList = [
  {
    id: 'pip_tech_01',
    name: 'Eletrônicos & Smartphones',
    aiTone: 'persuasive',
    minDiscountPercent: 15,
    keywordsInclude: ['smartphone', 'fone', 'headphone', 'alexa', 'tws', 'gasp', 'notebook'],
    keywordsExclude: ['usado', 'reembalado', 'defeito'],
    quietHoursStart: '01:00',
    quietHoursEnd: '06:00',
    isAutoApprove: false,
    isActive: true,
  },
  {
    id: 'pip_bebe_02',
    name: 'Bebês & Maternidade',
    aiTone: 'informative',
    minDiscountPercent: 10,
    keywordsInclude: ['fralda', 'pampers', 'huggies', 'carrinho', 'mamadeira', 'lenço'],
    keywordsExclude: ['usado'],
    quietHoursStart: '00:00',
    quietHoursEnd: '07:00',
    isAutoApprove: true,
    isActive: true,
  },
];

export async function GET() {
  return NextResponse.json({ pipelines: mockPipelinesList });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = PipelineRulesSchema.partial().parse(body);

    const newPipeline = {
      id: `pip_${Date.now()}`,
      name: body.name || 'Novo Nicho de Ofertas',
      aiTone: validated.aiTone || 'persuasive',
      minDiscountPercent: validated.minDiscountPercent ?? 10,
      keywordsInclude: validated.keywordsInclude || [],
      keywordsExclude: validated.keywordsExclude || [],
      quietHoursStart: validated.quietHoursStart || '01:00',
      quietHoursEnd: validated.quietHoursEnd || '06:00',
      isAutoApprove: body.isAutoApprove ?? false,
      isActive: true,
    };

    mockPipelinesList.push(newPipeline);

    return NextResponse.json({ success: true, pipeline: newPipeline });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Dados inválidos para o pipeline.' },
      { status: 400 }
    );
  }
}
