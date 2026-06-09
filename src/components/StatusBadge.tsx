import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  let colorClass = "bg-neutral-800 text-neutral-400";
  
  if (status === "RUNNING" || status === "IN_PROGRESS") {
    colorClass = "bg-blue-900/50 text-blue-400 border-blue-800/50";
  } else if (status === "SUCCESS" || status === "COMPLETED" || status === "APPROVE") {
    colorClass = "bg-green-900/50 text-green-400 border-green-800/50";
  } else if (status === "ERROR" || status === "FAILED" || status === "REQUEST_CHANGES") {
    colorClass = "bg-red-900/50 text-red-400 border-red-800/50";
  } else if (status === "WARNING" || status === "COMMENT") {
    colorClass = "bg-yellow-900/50 text-yellow-400 border-yellow-800/50";
  }

  return (
    <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-wider ${colorClass}`}>
      {status}
    </Badge>
  );
}
