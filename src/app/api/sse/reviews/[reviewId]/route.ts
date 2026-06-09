import { NextRequest } from "next/server";
import { redisSubscriber } from "@/lib/pubsub";

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  const { reviewId } = await params;

  const stream = new ReadableStream({
    async start(controller) {
      const channel = `review:${reviewId}`;
      
      const sub = redisSubscriber.duplicate();
      
      await sub.subscribe(channel);
      
      sub.on('message', (chan, message) => {
        if (chan === channel) {
          controller.enqueue(`data: ${message}\n\n`);
        }
      });

      const interval = setInterval(() => {
        controller.enqueue(`: ping\n\n`);
      }, 15000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        sub.unsubscribe(channel);
        sub.quit();
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
