// =============================================================================
// GET /api/v1/demo/stream/[sessionId] — SSE stream for live demo updates
// =============================================================================
// Server-Sent Events endpoint for real-time transcript and audio streaming.
// Client opens this connection after starting a session.
//
// Event types:
//   - transcript: { speaker, text, partial, timestamp }
//   - audio: { audio (base64), mimeType, final }
//   - thinking: { status: 'processing' | 'generating' | 'synthesizing' }
//   - error: { code, message }
//   - done: { reason }
//   - heartbeat (comment)
// =============================================================================

import { NextRequest } from 'next/server';
import { createSSEStream, sseHeaders } from '@server/utils/stream';
import { prisma } from '@server/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    // Validate session exists and is active
    const session = await prisma.demoSession.findUnique({
      where: { id: sessionId },
      select: { id: true, status: true, sessionToken: true },
    });

    if (!session) {
      return new Response(
        JSON.stringify({ code: 'SESSION_NOT_FOUND', message: 'Invalid session.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate session token from query params
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    if (token !== session.sessionToken) {
      return new Response(
        JSON.stringify({ code: 'INVALID_TOKEN', message: 'Invalid session token.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { stream, push, heartbeat, close, isOpen } = createSSEStream();

    // Send initial connection confirmation
    push('connected', { sessionId, status: session.status });

    // Heartbeat to keep connection alive (every 15s)
    const heartbeatInterval = setInterval(() => {
      if (!isOpen()) {
        clearInterval(heartbeatInterval);
        return;
      }
      heartbeat();
    }, 15000);

    // Auto-close after max session duration (5 min + buffer)
    const autoCloseTimeout = setTimeout(() => {
      if (isOpen()) {
        push('done', { reason: 'session_timeout' });
        close();
      }
      clearInterval(heartbeatInterval);
    }, 330000); // 5.5 minutes

    // Clean up on client disconnect
    request.signal.addEventListener('abort', () => {
      clearInterval(heartbeatInterval);
      clearTimeout(autoCloseTimeout);
      close();
    });

    return new Response(stream, {
      headers: sseHeaders(),
    });
  } catch (error) {
    console.error('[API] GET /demo/stream error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
