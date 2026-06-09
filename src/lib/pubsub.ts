import IORedis from 'ioredis';

const connectionString = process.env.REDIS_URL || 'redis://localhost:6379';

// We need distinct connections for pub and sub because subscribing blocks other operations
export const redisPublisher = new IORedis(connectionString);
export const redisSubscriber = new IORedis(connectionString);

export type ReviewEvent = 
  | { type: 'AGENT_START'; agentName: string; reviewId: string }
  | { type: 'AGENT_SUCCESS'; agentName: string; reviewId: string }
  | { type: 'AGENT_FAILED'; agentName: string; reviewId: string; error?: string }
  | { type: 'REVIEW_COMPLETED'; reviewId: string; score: number }
  | { type: 'REVIEW_FAILED'; reviewId: string; error?: string };

export function publishReviewEvent(reviewId: string, event: ReviewEvent) {
  return redisPublisher.publish(`review:${reviewId}`, JSON.stringify(event));
}
