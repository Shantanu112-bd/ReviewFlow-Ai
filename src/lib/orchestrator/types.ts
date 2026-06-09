import { z } from "zod";

export const deduplicatedFindingSchema = z.object({
  filePath: z.string(),
  line: z.number().nullable().optional(),
  severity: z.enum(["INFO", "WARNING", "CRITICAL"]),
  message: z.string().describe("A comprehensive message combining overlapping insights"),
  originalFindingIds: z.array(z.string()).describe("IDs of the raw findings this merged finding replaces"),
});

export const unifiedReportSchema = z.object({
  executiveSummary: z.string().describe("A high-level technical summary of the PR quality"),
  score: z.number().min(0).max(100).describe("Overall PR health score out of 100"),
  recommendation: z.enum(["APPROVE", "REQUEST_CHANGES", "COMMENT"]),
  deduplicatedFindings: z.array(deduplicatedFindingSchema),
});

export type UnifiedReport = z.infer<typeof unifiedReportSchema>;
