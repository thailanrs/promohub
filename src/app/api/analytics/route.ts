import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    metrics: {
      totalClicksToday: 1428,
      uniqueVisitorsToday: 912,
      offersDispatchedToday: 48,
      estimatedRevenueTodayBrl: 384.50,
      conversionRatePercent: 4.8,
    },
    topOffers: [
      {
        id: 'off_01',
        title: 'Smartphone Echo Dot 5ª Geração com Alexa',
        store: 'amazon',
        clicks: 412,
        affiliateUrl: 'https://www.amazon.com.br/dp/B08N5WRWNW?tag=promohub-20',
      },
      {
        id: 'off_02',
        title: 'Fone TWS Bluetooth Sem Fios i12',
        store: 'shopee',
        clicks: 298,
        affiliateUrl: 'https://shopee.com.br/product/123/456?sub_id=promohub_tech',
      },
      {
        id: 'off_03',
        title: 'Fralda Pampers Supersec Bag G 120 Unidades',
        store: 'mercadolivre',
        clicks: 184,
        affiliateUrl: 'https://produto.mercadolivre.com.br/MLB-123?utm_source=promohub',
      },
    ],
    serviceHealth: {
      workerVps: 'online',
      redisQueue: 'healthy',
      supabaseDb: 'healthy',
      whatsappSocket: 'connected',
      telegramBot: 'active',
    },
  });
}
