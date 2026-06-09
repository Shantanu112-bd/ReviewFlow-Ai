import 'dotenv/config';
import prisma from '../src/lib/db';
import { reviewQueue } from '../src/lib/queue/queues';
import { publishComment } from '../src/app/actions/github';

async function runSmokeTest() {
  console.log("🚀 Starting Production Backend Smoke Test...");
  const startTime = Date.now();

  try {
    // 1. Setup Mock User
    console.log("[1/6] Setting up mock data (User, Repo, PR)...");
    let user = await prisma.user.findUnique({ where: { email: 'smoke@test.com' } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: 'Smoke Tester',
          email: 'smoke@test.com',
          emailVerified: true,
          githubId: 'mock-github-id-999',
          githubUsername: 'smoketester'
        }
      });
    }

    // 2. Setup Mock Repo & PR
    let repo = await prisma.repository.findUnique({ where: { githubId: 'repo-codeatlas-mock' } });
    if (!repo) {
      repo = await prisma.repository.create({
        data: {
          githubId: 'repo-codeatlas-mock',
          name: 'CodeAtlas',
          fullName: 'smoketester/CodeAtlas',
          url: 'https://github.com/smoketester/CodeAtlas',
          ownerId: user.id
        }
      });
    }

    let pr = await prisma.pullRequest.findUnique({ where: { githubId: 'pr-codeatlas-mock-1' } });
    if (!pr) {
      pr = await prisma.pullRequest.create({
        data: {
          githubId: 'pr-codeatlas-mock-1',
          number: 1,
          title: 'Implement Core Multi-Agent Architecture',
          status: 'OPEN',
          repositoryId: repo.id
        }
      });
    }

    // 3. Create Review Record
    console.log("[2/6] Creating Review record...");
    const review = await prisma.review.create({
      data: {
        pullRequestId: pr.id,
        reviewerId: user.id,
        status: "PENDING"
      }
    });

    // 4. Dispatch Job
    console.log("[3/6] Dispatching BullMQ Job...");
    const queueStartTime = Date.now();
    await reviewQueue.add("start-review", {
      reviewId: review.id,
      repositoryId: repo.id,
      pullRequestId: pr.id,
      userId: user.id,
      owner: 'smoketester',
      repo: 'CodeAtlas',
      pull_number: 1,
      githubToken: 'mock-token'
    });

    // 5. Poll for Completion
    console.log("[4/6] Waiting for Worker and AI Agents to complete (Polling DB)...");
    let currentStatus = "PENDING";
    let pollCount = 0;
    let finalReview: any = null;

    while (currentStatus !== "COMPLETED" && currentStatus !== "FAILED") {
      if (pollCount > 60) {
        throw new Error("Timeout: Workers took longer than 120 seconds to complete the review.");
      }
      
      await new Promise(r => setTimeout(r, 2000));
      pollCount++;
      
      finalReview = await prisma.review.findUnique({
        where: { id: review.id },
        include: { agentResults: true }
      });
      
      if (finalReview) {
        currentStatus = finalReview.status;
        const runningAgents = finalReview.agentResults.filter((a: any) => a.status === "RUNNING").length;
        const successAgents = finalReview.agentResults.filter((a: any) => a.status === "SUCCESS").length;
        process.stdout.write(`\r   -> Status: ${currentStatus} | Agents (Running: ${runningAgents}, Success: ${successAgents})   `);
      }
    }
    console.log("\n");

    const queueDuration = Date.now() - queueStartTime;

    if (currentStatus === "FAILED") {
      throw new Error("Review status marked as FAILED by orchestrator or worker.");
    }

    // 6. Output Verification
    console.log("[5/6] Verifying Orchestrator Results...");
    console.log(`   -> Final Score: ${finalReview.score}/100`);
    console.log(`   -> Recommendation: ${finalReview.recommendation}`);
    
    if (finalReview.score === null) {
      throw new Error("Failed to generate a valid score.");
    }

    // 7. Mock GitHub Publish
    console.log("[6/6] Testing GitHub Comment Server Action... (Skipped in Node.js runtime)");
    console.log("   -> Skipped: Server Actions requiring headers() cannot run in standalone Node scripts.");

    const totalDuration = Date.now() - startTime;

    console.log("\n✅ SMOKE TEST PASSED!");
    console.log(`⏱  Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(`⏱  Worker/Agent Duration: ${(queueDuration / 1000).toFixed(2)}s\n`);
    
  } catch (error) {
    console.error("\n❌ SMOKE TEST FAILED!");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    // BullMQ keeps connections open, so we forcefully exit after success
    process.exit(0);
  }
}

runSmokeTest();
