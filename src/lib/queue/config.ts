import IORedis from 'ioredis';

const connectionString = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClientSingleton = () => {
  return new IORedis(connectionString, {
    maxRetriesPerRequest: null, // Required by BullMQ
  });
};

declare global {
  var redisGlobal: undefined | ReturnType<typeof redisClientSingleton>;
}

export const redisConnection = globalThis.redisGlobal ?? redisClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.redisGlobal = redisConnection;

export const QUEUE_NAMES = {
  REVIEW: 'review-queue',
  AGENT: 'agent-queue',
};
