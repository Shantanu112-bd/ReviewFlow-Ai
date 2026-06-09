import { z } from "zod";

export const findingSchema = z.object({
  filePath: z.string(),
  line: z.number().nullable().optional(),
  severity: z.enum(["INFO", "WARNING", "CRITICAL"]),
  message: z.string(),
  codeSnippet: z.string().nullable().optional(),
});

export type FindingResult = z.infer<typeof findingSchema>;

export interface AgentContext {
  reviewId: string;
  pullRequestId: string;
  diff: string;
}

export interface AgentInterface {
  name: string;
  systemPrompt: string;
  execute(context: AgentContext): Promise<void>;
}
