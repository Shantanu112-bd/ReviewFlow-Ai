import { Progress } from "@/components/ui/progress";

export function ProgressTracker({ total, completed }: { total: number, completed: number }) {
  const percentage = Math.round((completed / total) * 100);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-mono text-neutral-400">
        <span>Progress</span>
        <span>{completed} / {total} Agents</span>
      </div>
      <Progress value={percentage} className="h-1 bg-neutral-800" />
    </div>
  );
}
