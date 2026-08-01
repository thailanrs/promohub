import { NextResponse } from 'next/server';
import { processDispatchJob } from '../../../../workers';
import { formatOfferForWhatsApp } from '../../../../modules/output/services/formatter.service';
import { EnrichedOffer } from '../../../../modules/swipe/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { destinationJid, formattedMessage, offer } = body;

    if (!destinationJid) {
      return NextResponse.json(
        { error: 'Parâmetro "destinationJid" (número de WhatsApp ou ID de Grupo) é obrigatório.' },
        { status: 400 }
      );
    }

    // Format destination JID if pure phone number is provided (e.g. 5511999999999)
    const cleanedJid = destinationJid.includes('@')
      ? destinationJid
      : `${destinationJid.replace(/\D/g, '')}@s.whatsapp.net`;

    const messageText = formattedMessage || (offer ? formatOfferForWhatsApp(offer as EnrichedOffer) : '🔥 *[PromoHub Teste]* Disparo de teste para validação do fluxo!');

    // Mock socket or real dispatch worker call
    const mockSocket = {
      sendMessage: async (jid: string, content: any) => ({
        key: { id: `WA_TEST_${Date.now()}` },
      }),
    };

    const dispatchResult = await processDispatchJob(
      {
        tenantId: 'tenant_demo_123',
        offerId: offer?.id || `off_${Date.now()}`,
        destinationId: 'dest_test_whatsapp',
        destinationJid: cleanedJid,
        formattedMessage: messageText,
        imageUrl: offer?.imageUrl,
      },
      mockSocket
    );

    return NextResponse.json({
      success: true,
      messageId: dispatchResult.messageId,
      recipient: cleanedJid,
      sentMessage: messageText,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API Test Send Error]', error);
    return NextResponse.json(
      { error: 'Falha ao disparar mensagem de teste de WhatsApp.' },
      { status: 500 }
    );
  }
}
