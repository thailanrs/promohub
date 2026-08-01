import { describe, it, expect, vi } from 'vitest';
import { defaultJobOptions } from '../ingestion.queue';
import {
  processIngestionJob,
  processEnrichmentJob,
  processDispatchJob,
  processStockCheckerCronJob,
} from '../../workers';
import { WASocketLike } from '../../modules/output/services/whatsapp-publisher.service';

describe('BullMQ & Redis Queue Configuration', () => {
  it('should configure exponential backoff retry options with 3 attempts', () => {
    expect(defaultJobOptions.attempts).toBe(3);
    expect(defaultJobOptions.backoff).toEqual({
      type: 'exponential',
      delay: 2000,
    });
  });
});

describe('Orchestration & Worker Pipelines', () => {
  it('should process Ingestion Job and extract valid e-commerce URLs', async () => {
    const result = await processIngestionJob({
      tenantId: 'tenant_123',
      rawText: 'Confira a oferta https://www.amazon.com.br/dp/B08N5WRWNW imperdível!',
    });

    expect(result.enqueuedCount).toBe(1);
    expect(result.urls[0]).toBe('https://www.amazon.com.br/dp/B08N5WRWNW');
  });

  it('should process Enrichment Job E2E within SLA (< 60s) and route to Swipe Inbox in manual mode', async () => {
    const startTime = Date.now();

    const result = await processEnrichmentJob(
      {
        tenantId: 'tenant_123',
        rawUrl: 'https://www.amazon.com.br/dp/B08N5WRWNW',
        rawText: 'Echo Dot 5ª Geração',
      },
      {
        tenantCredentials: { amazonTag: 'promohub-20' },
        mode: 'manual',
      }
    );

    const elapsedTime = Date.now() - startTime;

    expect(elapsedTime).toBeLessThan(60000); // SLA < 60s
    expect(result.nextStep).toBe('swipe_inbox');
    expect(result.offer.status).toBe('pending');
    expect(result.offer.affiliateUrl).toContain('tag=promohub-20');
    expect(result.offer.aiCopy).toBeTruthy();
  });

  it('should route directly to Dispatch queue when pipeline mode is auto', async () => {
    const result = await processEnrichmentJob(
      {
        tenantId: 'tenant_123',
        rawUrl: 'https://shopee.com.br/product/123/456',
        rawText: 'Fone TWS',
      },
      {
        tenantCredentials: { shopeeSubId: 'sub_123' },
        mode: 'auto',
      }
    );

    expect(result.nextStep).toBe('dispatch');
    expect(result.offer.status).toBe('approved');
  });

  it('should process Dispatch Job and return message ID from WhatsApp socket', async () => {
    const mockSocket: WASocketLike = {
      sendMessage: vi.fn().mockResolvedValue({
        key: { id: 'WA_MSG_DISPATCH_999' },
      }),
    };

    const result = await processDispatchJob(
      {
        tenantId: 'tenant_123',
        offerId: 'off_1',
        destinationId: 'dest_1',
        destinationJid: '1203630123456789@g.us',
        formattedMessage: 'Message text',
      },
      mockSocket
    );

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('WA_MSG_DISPATCH_999');
  });

  it('should process Stock Checker Cron Worker and update out-of-stock messages', async () => {
    const mockSocket: WASocketLike = {
      sendMessage: vi.fn().mockResolvedValue({
        key: { id: 'WA_MSG_DISPATCH_999' },
      }),
    };

    const offers = [
      {
        id: 'off_1',
        canonicalUrl: 'https://www.amazon.com.br/dp/B08N5WRWNW',
        destinationJid: '1203630123456789@g.us',
        messageId: 'WA_MSG_1',
        formattedMessage: 'In stock item',
      },
      {
        id: 'off_2',
        canonicalUrl: 'https://www.amazon.com.br/dp/B08N5WRWNW/esgotado',
        destinationJid: '1203630123456789@g.us',
        messageId: 'WA_MSG_2',
        formattedMessage: 'Out of stock item',
      },
    ];

    const cronResult = await processStockCheckerCronJob(offers, mockSocket);

    expect(cronResult.checked).toBe(2);
    expect(cronResult.updatedOutOfStock).toBe(1);
    expect(mockSocket.sendMessage).toHaveBeenCalledWith(
      '1203630123456789@g.us',
      expect.objectContaining({
        text: expect.stringContaining('❌ *[OFERTA ESGOTADA]*'),
      })
    );
  });
});
