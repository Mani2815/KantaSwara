// =============================================================================
// SSE (Server-Sent Events) Stream Helper
// =============================================================================
// Utilities for creating SSE responses from Next.js API Route Handlers.
// Provides a clean abstraction over ReadableStream for event streaming.
// =============================================================================

/**
 * Create an SSE-compatible ReadableStream and a controller for pushing events.
 *
 * Usage in a Next.js Route Handler:
 * ```ts
 * export async function GET() {
 *   const { stream, push, close } = createSSEStream();
 *
 *   // Push events asynchronously
 *   push('transcript', { speaker: 'agent', text: 'Hello!' });
 *   push('done', {});
 *   close();
 *
 *   return new Response(stream, {
 *     headers: sseHeaders(),
 *   });
 * }
 * ```
 */
export function createSSEStream() {
  const encoder = new TextEncoder();
  let controller: ReadableStreamDefaultController<Uint8Array> | null = null;
  let closed = false;

  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c;
    },
    cancel() {
      closed = true;
    },
  });

  /**
   * Push an event to the SSE stream.
   * @param eventType - The event type (e.g. 'transcript', 'audio', 'error')
   * @param data - The event data (will be JSON.stringified)
   */
  function push(eventType: string, data: unknown): void {
    if (closed || !controller) return;

    try {
      const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
      controller.enqueue(encoder.encode(payload));
    } catch {
      // Stream may have been closed by client
    }
  }

  /**
   * Send a heartbeat comment to keep the connection alive.
   */
  function heartbeat(): void {
    if (closed || !controller) return;
    try {
      controller.enqueue(encoder.encode(': heartbeat\n\n'));
    } catch {
      // Stream may have been closed
    }
  }

  /**
   * Close the SSE stream.
   */
  function close(): void {
    if (closed || !controller) return;
    closed = true;
    try {
      controller.close();
    } catch {
      // Already closed
    }
  }

  /**
   * Check if the stream is still open.
   */
  function isOpen(): boolean {
    return !closed;
  }

  return { stream, push, heartbeat, close, isOpen };
}

/**
 * Standard SSE response headers.
 */
export function sseHeaders(): HeadersInit {
  return {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable Nginx buffering
  };
}
