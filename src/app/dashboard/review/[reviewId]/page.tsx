"use client";

import { useReviewStream } from "@/hooks/useReviewStream";
import { AgentCard } from "@/components/AgentCard";
import { StreamingOutput } from "@/components/StreamingOutput";
import { ProgressTracker } from "@/components/ProgressTracker";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FindingsTable } from "@/components/FindingsTable";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { generateGitHubComment } from "@/lib/formatters/github";
import { use, useState, useTransition } from "react";
import { publishComment } from "@/app/actions/github";

const AGENT_NAMES = [
  "Security Sentinel",
  "Performance Hawk",
  "Code Quality Judge",
  "Architecture Auditor",
  "Test Coverage Analyst"
];

export default function LiveReviewDashboard({ params }: { params: Promise<{ reviewId: string }> }) {
  const { reviewId } = use(params);
  const { events, isConnected } = useReviewStream(reviewId);
  const [isPublishing, startTransition] = useTransition();
  const [publishStatus, setPublishStatus] = useState<string | null>(null);

  const handlePublish = () => {
    startTransition(async () => {
      const res = await publishComment(reviewId, githubCommentMd);
      if (res.success) {
        setPublishStatus("Published!");
      } else {
        setPublishStatus("Failed: " + res.error);
      }
    });
  };

  const agentStates: Record<string, any> = {};
  AGENT_NAMES.forEach(name => agentStates[name] = "PENDING");

  events.forEach(evt => {
    if (evt.type === 'AGENT_START') agentStates[evt.agentName] = "RUNNING";
    if (evt.type === 'AGENT_SUCCESS') agentStates[evt.agentName] = "SUCCESS";
    if (evt.type === 'AGENT_FAILED') agentStates[evt.agentName] = "ERROR";
  });

  const completedAgents = Object.values(agentStates).filter(s => s === "SUCCESS" || s === "ERROR").length;
  
  const finalEvent = events.find(e => e.type === 'REVIEW_COMPLETED') as any;

  // Mocking the deduplicated findings for UI demo since it's not currently streamed in full
  const mockReportData = {
    executiveSummary: "The pull request implements critical architectural changes. However, there are a few security vulnerabilities and N+1 query performance issues that must be addressed before merging.",
    score: 65,
    recommendation: "REQUEST_CHANGES" as any,
    deduplicatedFindings: [
      { severity: "CRITICAL" as any, filePath: "src/lib/db.ts", line: 42, message: "Potential SQL injection vulnerability in raw query.", originalFindingIds: [] },
      { severity: "WARNING" as any, filePath: "src/components/List.tsx", line: 15, message: "N+1 query detected inside the render loop. Fetch data eagerly instead.", originalFindingIds: [] }
    ]
  };

  const githubCommentMd = generateGitHubComment(finalEvent ? { ...mockReportData, score: finalEvent.score } : mockReportData);

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8 min-h-screen bg-black text-white">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Review Dashboard</h1>
          <p className="text-neutral-400">Live multi-agent analysis for Review ID: <span className="font-mono text-xs">{reviewId}</span></p>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-neutral-500">SSE Connection:</span>
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
        </div>
      </div>

      {!finalEvent ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <ProgressTracker total={5} completed={completedAgents} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {AGENT_NAMES.map(name => (
                <AgentCard key={name} name={name} status={agentStates[name]} />
              ))}
            </div>
          </div>
          <div className="md:col-span-1">
            <StreamingOutput events={events} />
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="bg-neutral-900 border-neutral-700 h-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl text-white">Executive Summary</CardTitle>
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl font-bold text-white">Score: {finalEvent.score}/100</span>
                    <StatusBadge status="COMPLETED" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-300 leading-relaxed">
                    {mockReportData.executiveSummary}
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-1">
              <Card className="bg-neutral-950 border-neutral-800 h-full">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Publish to GitHub</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-neutral-400">Review the generated markdown before posting the automated comment to the Pull Request.</p>
                  <Button 
                    onClick={handlePublish} 
                    disabled={isPublishing || publishStatus === "Published!"} 
                    className="w-full bg-white text-black hover:bg-neutral-200"
                  >
                    {isPublishing ? "Publishing..." : publishStatus || "Post Comment"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-neutral-900 border border-neutral-800">
              <TabsTrigger value="overview">Overview (Deduplicated)</TabsTrigger>
              {AGENT_NAMES.map(name => (
                <TabsTrigger key={name} value={name}>{name}</TabsTrigger>
              ))}
              <TabsTrigger value="markdown">Markdown Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-4">
              <FindingsTable findings={mockReportData.deduplicatedFindings} />
            </TabsContent>

            {AGENT_NAMES.map(name => (
              <TabsContent key={name} value={name} className="mt-4">
                <FindingsTable findings={[]} />
              </TabsContent>
            ))}

            <TabsContent value="markdown" className="mt-4">
              <Textarea 
                readOnly 
                className="font-mono text-sm h-[400px] bg-neutral-950 border-neutral-800 text-neutral-300 focus-visible:ring-0" 
                value={githubCommentMd} 
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
