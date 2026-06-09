import 'dotenv/config';
import { createReviewWorker, createAgentWorker } from '../src/lib/queue/workers';
import { setupQueueEvents } from '../src/lib/queue/events';

console.log("Starting BullMQ Workers...");

const reviewWorker = createReviewWorker();
const agentWorker = createAgentWorker();
setupQueueEvents();

console.log("Workers started and listening for jobs on REVIEW and AGENT queues.");

process.on('SIGINT', async () => {
  console.log("Shutting down workers...");
  await reviewWorker.close();
  await agentWorker.close();
  process.exit(0);
});
