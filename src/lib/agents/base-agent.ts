import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import prisma from '@/lib/db';
import { AgentContext, findingSchema, AgentInterface } from './types';
import { z } from 'zod';

export abstract class AIReviewAgent implements AgentInterface {
  abstract name: string;
  abstract systemPrompt: string;

  async execute(context: AgentContext): Promise<void> {
    const agentResult = await prisma.agentResult.create({
      data: {
        reviewId: context.reviewId,
        agentName: this.name,
        status: "RUNNING",
      }
    });

    try {
      const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
      const { object } = await generateObject({
        model: google('gemini-2.5-flash'),
        schema: z.object({
          findings: z.array(findingSchema)
        }),
        system: this.systemPrompt,
        prompt: `Analyze the following PR diff:\n\n${context.diff}`,
      });

      for (const finding of object.findings) {
        await prisma.finding.create({
          data: {
            agentResultId: agentResult.id,
            filePath: finding.filePath,
            line: finding.line,
            severity: finding.severity,
            message: finding.message,
            codeSnippet: finding.codeSnippet
          }
        });
      }

      await prisma.agentResult.update({
        where: { id: agentResult.id },
        data: { status: "SUCCESS" }
      });
    } catch (error) {
      await prisma.agentResult.update({
        where: { id: agentResult.id },
        data: { 
          status: "ERROR", 
          rawOutput: error instanceof Error ? error.message : "Unknown error during AI generation" 
        }
      });
    }
  }
}
