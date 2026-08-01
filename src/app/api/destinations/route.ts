import { NextResponse } from 'next/server';

let mockDestinations = [
  {
    id: 'dest_wa_01',
    name: 'Grupo WhatsApp Ofertas Tech (1,200 membros)',
    type: 'whatsapp',
    config: { jid: '1203630123456789@g.us', mode: 'auto' },
    status: 'connected',
    lastActive: '2 min atrás',
  },
  {
    id: 'dest_tg_02',
    name: 'Canal Telegram Promos BR',
    type: 'telegram',
    config: { chatId: '@promosbr_oficial' },
    status: 'connected',
    lastActive: '1 hora atrás',
  },
  {
    id: 'dest_dc_03',
    name: 'Servidor Discord - Canal #ofertas',
    type: 'discord',
    config: { webhookUrl: 'https://discord.com/api/webhooks/123/abc' },
    status: 'connected',
    lastActive: '5 min atrás',
  },
];

export async function GET() {
  return NextResponse.json({
    destinations: mockDestinations,
    whatsappSession: {
      isConnected: true,
      phoneNumber: '+55 (11) 99887-6655',
      pushName: 'PromoHub Automation Bot',
      qrCodeData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newDest = {
      id: `dest_${Date.now()}`,
      name: body.name || 'Novo Grupo de Destino',
      type: body.type || 'whatsapp',
      config: body.config || {},
      status: 'connected',
      lastActive: 'Agora',
    };

    mockDestinations.push(newDest);
    return NextResponse.json({ success: true, destination: newDest });
  } catch {
    return NextResponse.json({ error: 'Erro ao criar destino' }, { status: 400 });
  }
}
