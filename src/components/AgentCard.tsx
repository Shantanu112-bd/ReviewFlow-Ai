import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";

export function AgentCard({ name, status }: { name: string, status: "PENDING" | "RUNNING" | "SUCCESS" | "ERROR" }) {
  const isRunning = status === "RUNNING";
  
  return (
    <Card className={`bg-neutral-950 border-neutral-800 transition-all ${isRunning ? 'ring-1 ring-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-neutral-200">{name}</CardTitle>
        <StatusBadge status={status} />
      </CardHeader>
      <CardContent>
        {isRunning ? (
          <div className="flex items-center space-x-2 text-xs text-neutral-400">
            <span className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>Analyzing code...</span>
          </div>
        ) : status === "SUCCESS" ? (
          <div className="text-xs text-green-500">Analysis complete</div>
        ) : status === "ERROR" ? (
          <div className="text-xs text-red-500">Failed</div>
        ) : (
          <div className="text-xs text-neutral-600">Waiting...</div>
        )}
      </CardContent>
    </Card>
  );
}
