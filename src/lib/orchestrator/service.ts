import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import prisma from '@/lib/db';
import { unifiedReportSchema } from './types';
import { publishReviewEvent } from '@/lib/pubsub';

export class OrchestratorService {
  async runOrchestration(reviewId: string) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        agentResults: {
          include: { findings: true }
        }
      }
    });

    if (!review) throw new Error("Review not found");

    const pendingAgents = review.agentResults.filter(ar => ar.status === "RUNNING");
    if (pendingAgents.length > 0) {
      throw new Error("Agents are still running");
    }

    const allFindings = review.agentResults.flatMap(ar => ar.findings);

    const promptContext = `
      You are the Master Orchestrator for an AI-powered code review system.
      Below are the raw findings from specialized AI agents (Security, Performance, Code Quality, Architecture, Test Coverage).
      
      Your tasks:
      1. Deduplicate findings that point to the exact same issue on the same line/file. Merge their descriptions.
      2. Calculate a strict Score (0-100). Base 100. Deduct 20 for CRITICAL, 10 for WARNING, 2 for INFO. Floor at 0.
      3. Generate a concise Executive Summary for the developer.
      4. Make a recommendation (APPROVE if score >= 80 and no CRITICAL, REQUEST_CHANGES if CRITICAL exists or score < 60, otherwise COMMENT).

      Raw Findings:
      ${JSON.stringify(allFindings, null, 2)}
    `;

    const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
    const { object: report } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: unifiedReportSchema,
      system: "You are an expert tech lead integrating feedback from junior agent models.",
      prompt: promptContext,
    });

    await prisma.review.update({
      where: { id: reviewId },
      data: {
        score: report.score,
        summary: report.executiveSummary,
        recommendation: report.recommendation,
        status: "COMPLETED"
      }
    });

    await publishReviewEvent(reviewId, { type: 'REVIEW_COMPLETED', reviewId, score: report.score });

    // Note: In a full implementation, you would also use report.deduplicatedFindings 
    // to flag which original Finding rows to keep or delete in the DB.

    return report;
  }
}
