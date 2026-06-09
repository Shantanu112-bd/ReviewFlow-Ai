import IORedis from 'ioredis';

const connectionString = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisConnection = new IORedis(connectionString, {
  maxRetriesPerRequest: null, // Required by BullMQ
});

export const QUEUE_NAMES = {
  REVIEW: 'review-queue',
  AGENT: 'agent-queue',
};
