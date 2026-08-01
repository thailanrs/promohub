import { describe, it, expect, vi } from 'vitest';
import {
  formatOfferForWhatsApp,
  appendOutOfStockToMessage,
} from '../services/formatter.service';
import {
  getRandomDelay,
  publishOfferToWhatsApp,
  updatePublishedMessage,
  WASocketLike,
} from '../services/whatsapp-publisher.service';
import { EnrichedOffer } from '../../swipe/types';

const mockOffer: EnrichedOffer = {
  id: '11111111-1111-4111-a111-111111111111',
  tenantId: '00000000-0000-4000-a000-000000000000',
  pipelineId: '22222222-2222-4222-a222-222222222222',
  canonicalUrl: 'https://www.amazon.com.br/dp/B08N5WRWNW',
  affiliateUrl: 'https://www.amazon.com.br/dp/B08N5WRWNW?tag=promohub-20',
  shortCode: 'p/amz123',
  store: 'amazon',
  title: 'Echo Dot 5ª Geração Smart Speaker',
  originalPrice: 429.0,
  discountedPrice: 269.1,
  discountPercent: 37,
  couponCode: 'ALEXA10',
  imageUrl: 'https://m.media-amazon.com/images/I/714Rq4k05UL.jpg',
  aiCopy: '🔥 Preço histórico! Alexa com 37% OFF.',
  isOutOfStock: false,
  status: 'pending',
  createdAt: new Date(),
};

describe('OutputEngine — WhatsApp Formatter', () => {
  it('should format offer into rich WhatsApp Markdown syntax', () => {
    const formatted = formatOfferForWhatsApp(mockOffer);

    expect(formatted).toContain('📦 *Echo Dot 5ª Geração Smart Speaker*');
    expect(formatted).toContain('~De: R$ 429,00~');
    expect(formatted).toContain('💥 *Por: R$ 269,10* (37% OFF)');
    expect(formatted).toContain('🎟 *Cupom:* `ALEXA10`');
    expect(formatted).toContain('🛒 *Compre aqui:* https://www.amazon.com.br/dp/B08N5WRWNW?tag=promohub-20');
  });

  it('should format offer without original price or coupon code gracefully', () => {
    const simpleOffer: EnrichedOffer = {
      ...mockOffer,
      originalPrice: null,
      couponCode: null,
    };

    const formatted = formatOfferForWhatsApp(simpleOffer);

    expect(formatted).not.toContain('~De:');
    expect(formatted).not.toContain('🎟 *Cupom:*');
    expect(formatted).toContain('💥 *Por: R$ 269,10*');
  });

  it('should append out-of-stock banner to formatted message', () => {
    const initialText = formatOfferForWhatsApp(mockOffer);
    const updatedText = appendOutOfStockToMessage(initialText);

    expect(updatedText).toContain('❌ *[OFERTA ESGOTADA]*');
    expect(updatedText).toContain(initialText);
  });
});

describe('OutputEngine — Anti-Ban Delay Generator', () => {
  it('should generate random delays strictly within the configured bounds', () => {
    const min = 15000;
    const max = 45000;

    for (let i = 0; i < 100; i++) {
      const delay = getRandomDelay(min, max);
      expect(delay).toBeGreaterThanOrEqual(min);
      expect(delay).toBeLessThanOrEqual(max);
    }
  });
});

describe('OutputEngine — WhatsApp Publisher Service', () => {
  it('should publish offer message with image and return message ID', async () => {
    const mockSocket: WASocketLike = {
      sendMessage: vi.fn().mockResolvedValue({
        key: { id: 'WA_MSG_ID_9988776655' },
      }),
      sendPresenceUpdate: vi.fn().mockResolvedValue(undefined),
    };

    const formattedMessage = formatOfferForWhatsApp(mockOffer);

    const result = await publishOfferToWhatsApp(
      mockSocket,
      {
        offer: mockOffer,
        destinationJid: '1203630123456789@g.us',
        formattedMessage,
        imageUrl: mockOffer.imageUrl,
      },
      undefined,
      true // skip delay for unit test speed
    );

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('WA_MSG_ID_9988776655');
    expect(result.destinationJid).toBe('1203630123456789@g.us');
    expect(mockSocket.sendMessage).toHaveBeenCalledWith('1203630123456789@g.us', {
      image: { url: mockOffer.imageUrl },
      caption: formattedMessage,
    });
  });

  it('should update previously published message with edited text payload', async () => {
    const mockSocket: WASocketLike = {
      sendMessage: vi.fn().mockResolvedValue({
        key: { id: 'WA_MSG_ID_9988776655' },
      }),
    };

    const updatedText = appendOutOfStockToMessage(formatOfferForWhatsApp(mockOffer));

    const result = await updatePublishedMessage(mockSocket, {
      destinationJid: '1203630123456789@g.us',
      messageId: 'WA_MSG_ID_9988776655',
      updatedText,
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('WA_MSG_ID_9988776655');
    expect(mockSocket.sendMessage).toHaveBeenCalledWith('1203630123456789@g.us', {
      text: updatedText,
      edit: {
        remoteJid: '1203630123456789@g.us',
        id: 'WA_MSG_ID_9988776655',
        fromMe: true,
      },
    });
  });

  it('should handle socket dispatch errors gracefully without crashing', async () => {
    const mockSocket: WASocketLike = {
      sendMessage: vi.fn().mockRejectedValue(new Error('Connection Closed')),
    };

    const result = await publishOfferToWhatsApp(
      mockSocket,
      {
        offer: mockOffer,
        destinationJid: '1203630123456789@g.us',
        formattedMessage: 'test',
      },
      undefined,
      true
    );

    expect(result.success).toBe(false);
    expect(result.messageId).toBeNull();
    expect(result.error).toBe('Connection Closed');
  });
});
