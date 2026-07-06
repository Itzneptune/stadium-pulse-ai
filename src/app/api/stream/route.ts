import { NextRequest } from 'next/server';
import { simEngine } from '@/lib/simulation/engine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send initial state immediately
      const initialState = simEngine.getState();
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'INITIAL', state: initialState })}\n\n`));

      const unsubscribe = simEngine.subscribe((state, event) => {
        const payload = { type: event?.type || 'UPDATE', state, event };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      });

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        unsubscribe();
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
