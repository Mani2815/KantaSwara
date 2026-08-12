// =============================================================================
// GET /api/v1/runtime/stream/[sessionId] — SSE stream for voice session
// =============================================================================
// Server-Sent Events endpoint for real-time streaming.
// Streams LLM tokens as partial transcript events, then audio.
// Accepts message input via query params or initial POST body.
// =============================================================================

import { NextRequest } from 'next/server';
import { loadAgentRuntime, AgentLoaderError } from '@server/services/runtime/agent-runtime-loader.service';
import { getSession, SessionError } from '@server/services/runtime/session-manager.service';
import { processMessageStreaming, RuntimeError } from '@server/services/runtime/voice-runtime.service';
import { createSSEStream, sseHeaders } from '@server/utils/stream';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  try {
    // Look up the session
    const session = await getSession(sessionId);
    if (!session) {
      return new Response(
        JSON.stringify({ code: 'SESSION_NOT_FOUND', message: 'Session not found.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Load runtime context
    const context = await loadAgentRuntime(session.agentId, session.organizationId);

    // Get message input from query params
    const text = request.nextUrl.searchParams.get('text') || undefined;
    const audio = request.nextUrl.searchParams.get('audio') || undefined;
    const audioMimeType =
      request.nextUrl.searchParams.get('audioMimeType') || undefined;

    if (!text && !audio) {
      return new Response(
        JSON.stringify({
          code: 'MISSING_INPUT',
          message: 'Provide text or audio via query params.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create SSE stream
    const { stream, push, close, isOpen, heartbeat } = createSSEStream();

    // Start heartbeat
    const heartbeatInterval = setInterval(() => {
      if (isOpen()) {
        heartbeat();
      } else {
        clearInterval(heartbeatInterval);
      }
    }, 15000);

    // Process message in background (non-blocking)
    processMessageStreaming(
      session.id,
      { text, audio, audioMimeType },
      context,
      { push, isOpen }
    )
      .catch((err) => {
        console.error('[/api/v1/runtime/stream] Pipeline error:', err);
        if (isOpen()) {
          push('error', {
            code: 'PIPELINE_ERROR',
            message: err instanceof Error ? err.message : 'Unexpected error',
          });
        }
      })
      .finally(() => {
        clearInterval(heartbeatInterval);
        // Give client time to process final events before closing
        setTimeout(() => close(), 500);
      });

    return new Response(stream, { headers: sseHeaders() });
  } catch (error) {
    const statusCode =
      error instanceof AgentLoaderError || error instanceof SessionError
        ? (error as AgentLoaderError).statusCode
        : error instanceof RuntimeError
          ? error.statusCode
          : 500;

    const code =
      error instanceof AgentLoaderError || error instanceof SessionError || error instanceof RuntimeError
        ? (error as AgentLoaderError).code
        : 'INTERNAL_ERROR';

    return new Response(
      JSON.stringify({
        code,
        message: error instanceof Error ? error.message : 'Failed to start stream.',
      }),
      { status: statusCode, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
