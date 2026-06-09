import { useState, useEffect } from 'react';
import { ReviewEvent } from '@/lib/pubsub';

export function useReviewStream(reviewId: string) {
  const [events, setEvents] = useState<ReviewEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!reviewId) return;

    const eventSource = new EventSource(`/api/sse/reviews/${reviewId}`);

    eventSource.onopen = () => setIsConnected(true);
    
    eventSource.onmessage = (event) => {
      try {
        const parsed: ReviewEvent = JSON.parse(event.data);
        setEvents((prev) => [...prev, parsed]);
      } catch (err) {
        console.error("Failed to parse SSE message", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE Error:", err);
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [reviewId]);

  return { events, isConnected };
}
