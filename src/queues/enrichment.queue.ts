import { Queue, JobsOptions } from 'bullmq';
import { redisConnectionOptions } from '../lib/redis';
import { EnrichmentJobPayload, QUEUE_NAMES } from './queue.types';

export const defaultJobOptions: JobsOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
  removeOnComplete: 100,
  removeOnFail: 500,
};

export const enrichmentQueue = new Queue<EnrichmentJobPayload>(QUEUE_NAMES.ENRICHMENT, {
  connection: redisConnectionOptions,
  defaultJobOptions,
});
