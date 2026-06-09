import { Worker, Job } from 'bullmq';
import { redisConnection, QUEUE_NAMES } from './config';
import { GitHubService } from '@/lib/github';
import prisma from '@/lib/db';
import { agentQueue } from './queues';
import { OrchestratorService } from '@/lib/orchestrator/service';
import { publishReviewEvent } from '@/lib/pubsub';
import { 
  SecuritySentinel, 
  PerformanceHawk, 
  CodeQualityJudge, 
  ArchitectureAuditor, 
  TestCoverageAnalyst 
} from '@/lib/agents/implementations';

const AGENT_MAP: Record<string, any> = {
  "Security Sentinel": SecuritySentinel,
  "Performance Hawk": PerformanceHawk,
  "Code Quality Judge": CodeQualityJudge,
  "Architecture Auditor": ArchitectureAuditor,
  "Test Coverage Analyst": TestCoverageAnalyst,
};

export const createReviewWorker = () => {
  return new Worker(QUEUE_NAMES.REVIEW, async (job: Job) => {
    const { reviewId, pullRequestId, owner, repo, pull_number, githubToken } = job.data;
    
    await prisma.review.update({
      where: { id: reviewId },
      data: { status: 'IN_PROGRESS' }
    });

    const github = new GitHubService(githubToken);
    const diff = await github.getPullRequestDiff(owner, repo, pull_number);

    const agentNames = Object.keys(AGENT_MAP);
    
    for (const agentName of agentNames) {
      await agentQueue.add(`agent-${reviewId}-${agentName}`, {
        reviewId,
        pullRequestId,
        agentName,
        diff
      });
    }

    return { status: 'spawned', agentCount: agentNames.length };
  }, { connection: redisConnection });
};

export const createAgentWorker = () => {
  return new Worker(QUEUE_NAMES.AGENT, async (job: Job) => {
    const { reviewId, pullRequestId, agentName, diff } = job.data;
    
    const AgentClass = AGENT_MAP[agentName];
    if (!AgentClass) throw new Error(`Unknown agent: ${agentName}`);

    const agent = new AgentClass();
    
    await publishReviewEvent(reviewId, { type: 'AGENT_START', agentName, reviewId });

    try {
      await agent.execute({
        reviewId,
        pullRequestId,
        diff
      });
      await publishReviewEvent(reviewId, { type: 'AGENT_SUCCESS', agentName, reviewId });
    } catch (error) {
      await publishReviewEvent(reviewId, { type: 'AGENT_FAILED', agentName, reviewId, error: error instanceof Error ? error.message : String(error) });
      throw error; // Re-throw for BullMQ to handle retry
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { agentResults: true }
    });

    if (review) {
      const allDone = review.agentResults.length === Object.keys(AGENT_MAP).length && 
                      review.agentResults.every(ar => ar.status === 'SUCCESS' || ar.status === 'ERROR');

      if (allDone && review.status !== 'COMPLETED') {
        const orchestrator = new OrchestratorService();
        await orchestrator.runOrchestration(reviewId);
      }
    }

    return { status: 'completed' };
  }, { connection: redisConnection });
};
