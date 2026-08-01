import { Queue, JobsOptions } from 'bullmq';
import { redisConnectionOptions } from '../lib/redis';
import { DispatchJobPayload, QUEUE_NAMES } from './queue.types';

export const defaultJobOptions: JobsOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
  removeOnComplete: 100,
  removeOnFail: 500,
};

export const dispatchQueue = new Queue<DispatchJobPayload>(QUEUE_NAMES.DISPATCH, {
  connection: redisConnectionOptions,
  defaultJobOptions,
});
