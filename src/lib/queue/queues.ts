import { Queue } from 'bullmq';
import { redisConnection, QUEUE_NAMES } from './config';

const createReviewQueue = () => new Queue(QUEUE_NAMES.REVIEW, {
  connection: redisConnection as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

const createAgentQueue = () => new Queue(QUEUE_NAMES.AGENT, {
  connection: redisConnection as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

declare global {
  var reviewQueueGlobal: undefined | ReturnType<typeof createReviewQueue>;
  var agentQueueGlobal: undefined | ReturnType<typeof createAgentQueue>;
}

export const reviewQueue = globalThis.reviewQueueGlobal ?? createReviewQueue();
export const agentQueue = globalThis.agentQueueGlobal ?? createAgentQueue();

if (process.env.NODE_ENV !== 'production') {
  globalThis.reviewQueueGlobal = reviewQueue;
  globalThis.agentQueueGlobal = agentQueue;
}
