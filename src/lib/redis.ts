import Redis, { RedisOptions } from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

function parseRedisUrl(urlStr: string): { host: string; port: number; password?: string; username?: string } {
  try {
    const parsed = new URL(urlStr);
    return {
      host: parsed.hostname || 'localhost',
      port: parsed.port ? parseInt(parsed.port, 10) : 6379,
      username: parsed.username ? decodeURIComponent(parsed.username) : undefined,
      password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
    };
  } catch {
    return { host: 'localhost', port: 6379 };
  }
}

const parsedConn = parseRedisUrl(REDIS_URL);
const isTls = REDIS_URL.startsWith('rediss://');

export const redisConnectionOptions: RedisOptions = {
  host: parsedConn.host,
  port: parsedConn.port,
  username: parsedConn.username,
  password: parsedConn.password,
  tls: isTls ? {} : undefined,
  maxRetriesPerRequest: null, // Mandatory for BullMQ
  enableReadyCheck: false,
};

/**
 * Shared Redis client connection instance.
 */
export const redisClient = new Redis(REDIS_URL, {
  ...redisConnectionOptions,
});
