import Redis, { RedisOptions } from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisConnectionOptions: RedisOptions = {
  maxRetriesPerRequest: null, // Mandatory for BullMQ
  enableReadyCheck: false,
};

/**
 * Shared Redis client connection instance.
 */
export const redisClient = new Redis(REDIS_URL, redisConnectionOptions);
