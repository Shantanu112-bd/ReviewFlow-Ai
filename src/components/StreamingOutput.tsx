import { useEffect, useRef } from 'react';
import { ReviewEvent } from '@/lib/pubsub';

export function StreamingOutput({ events }: { events: ReviewEvent[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  return (
    <div className="bg-black border border-neutral-800 rounded-md p-4 font-mono text-xs text-neutral-300 h-64 overflow-y-auto">
      <div className="mb-4 text-neutral-500">// Real-time Orchestrator Logs</div>
      {events.map((evt, idx) => (
        <div key={idx} className="mb-1">
          <span className="text-neutral-500">[{new Date().toLocaleTimeString()}]</span>
          {" "}
          {evt.type === 'AGENT_START' && <span className="text-blue-400">Spawned agent: {evt.agentName}</span>}
          {evt.type === 'AGENT_SUCCESS' && <span className="text-green-400">Agent finished: {evt.agentName}</span>}
          {evt.type === 'AGENT_FAILED' && <span className="text-red-400">Agent error: {evt.agentName} - {evt.error}</span>}
          {evt.type === 'REVIEW_COMPLETED' && <span className="text-purple-400">Orchestrator finished. Final Score: {evt.score}</span>}
          {evt.type === 'REVIEW_FAILED' && <span className="text-red-500">Review failed: {evt.error}</span>}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
