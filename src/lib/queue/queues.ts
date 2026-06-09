import { Queue } from 'bullmq';
import { redisConnection, QUEUE_NAMES } from './config';

export const reviewQueue = new Queue(QUEUE_NAMES.REVIEW, {
  connection: redisConnection as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

export const agentQueue = new Queue(QUEUE_NAMES.AGENT, {
  connection: redisConnection as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});
