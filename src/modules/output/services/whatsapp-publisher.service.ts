import {
  AntiBanConfig,
  PublishResult,
  UpdateMessagePayload,
  WhatsAppMessagePayload,
} from '../types';

export interface WASocketLike {
  sendMessage: (
    jid: string,
    content: {
      text?: string;
      image?: { url: string };
      caption?: string;
      edit?: { remoteJid: string; id: string; fromMe: boolean };
    },
    options?: unknown
  ) => Promise<{ key: { id?: string | null; remoteJid?: string | null } }>;
  sendPresenceUpdate?: (presence: 'composing' | 'paused', jid: string) => Promise<void>;
}

/**
 * Calculates a random delay in milliseconds between minMs and maxMs for anti-ban human simulation.
 */
export function getRandomDelay(minMs = 15000, maxMs = 45000): number {
  const min = Math.min(minMs, maxMs);
  const max = Math.max(minMs, maxMs);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Promisified delay helper for anti-ban pauses.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Publishes an offer to a WhatsApp destination group using Baileys socket with anti-ban delay.
 */
export async function publishOfferToWhatsApp(
  sock: WASocketLike,
  payload: WhatsAppMessagePayload,
  antiBanConfig?: AntiBanConfig,
  skipDelay = false
): Promise<PublishResult> {
  try {
    const minDelay = antiBanConfig?.minDelayMs ?? 15000;
    const maxDelay = antiBanConfig?.maxDelayMs ?? 45000;

    if (!skipDelay) {
      const delayMs = getRandomDelay(minDelay, maxDelay);
      if (antiBanConfig?.randomizeTyping && sock.sendPresenceUpdate) {
        await sock.sendPresenceUpdate('composing', payload.destinationJid);
      }
      await sleep(delayMs);
    }

    let messageResponse: { key: { id?: string | null } };

    if (payload.imageUrl) {
      messageResponse = await sock.sendMessage(payload.destinationJid, {
        image: { url: payload.imageUrl },
        caption: payload.formattedMessage,
      });
    } else {
      messageResponse = await sock.sendMessage(payload.destinationJid, {
        text: payload.formattedMessage,
      });
    }

    const messageId = messageResponse?.key?.id || null;

    return {
      success: true,
      messageId,
      destinationJid: payload.destinationJid,
      sentAt: new Date(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown WhatsApp dispatch error';
    return {
      success: false,
      messageId: null,
      destinationJid: payload.destinationJid,
      sentAt: new Date(),
      error: errorMessage,
    };
  }
}

/**
 * Updates a previously published WhatsApp message (e.g. appending "ESGOTADO" banner).
 */
export async function updatePublishedMessage(
  sock: WASocketLike,
  payload: UpdateMessagePayload
): Promise<PublishResult> {
  try {
    await sock.sendMessage(payload.destinationJid, {
      text: payload.updatedText,
      edit: {
        remoteJid: payload.destinationJid,
        id: payload.messageId,
        fromMe: true,
      },
    });

    return {
      success: true,
      messageId: payload.messageId,
      destinationJid: payload.destinationJid,
      sentAt: new Date(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to edit WhatsApp message';
    return {
      success: false,
      messageId: payload.messageId,
      destinationJid: payload.destinationJid,
      sentAt: new Date(),
      error: errorMessage,
    };
  }
}
