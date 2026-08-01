import { Queue, JobsOptions } from 'bullmq';
import { redisConnectionOptions } from '../lib/redis';
import { IngestionJobPayload, QUEUE_NAMES } from './queue.types';

export const defaultJobOptions: JobsOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
  removeOnComplete: 100,
  removeOnFail: 500,
};

export const ingestionQueue = new Queue<IngestionJobPayload>(QUEUE_NAMES.INGESTION, {
  connection: redisConnectionOptions,
  defaultJobOptions,
});
