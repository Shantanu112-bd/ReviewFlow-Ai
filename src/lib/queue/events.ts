import { QueueEvents } from 'bullmq';
import { redisConnection, QUEUE_NAMES } from './config';

export const setupQueueEvents = () => {
  const reviewEvents = new QueueEvents(QUEUE_NAMES.REVIEW, { connection: redisConnection as any });
  const agentEvents = new QueueEvents(QUEUE_NAMES.AGENT, { connection: redisConnection as any });

  reviewEvents.on('failed', async ({ jobId, failedReason }) => {
    console.error(`Review Job ${jobId} failed:`, failedReason);
  });

  agentEvents.on('failed', async ({ jobId, failedReason }) => {
    console.error(`Agent Job ${jobId} failed:`, failedReason);
  });

  agentEvents.on('completed', async ({ jobId }) => {
    console.log(`Agent Job ${jobId} completed successfully.`);
  });

  return { reviewEvents, agentEvents };
};
