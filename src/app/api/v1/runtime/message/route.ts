// =============================================================================
// POST /api/v1/runtime/message — Send a message in a voice runtime session
// =============================================================================
// Authenticated endpoint. Processes text/audio through the full voice pipeline.
// Uses the non-streaming path — see /runtime/stream for SSE streaming.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { loadAgentRuntime, AgentLoaderError } from '@server/services/runtime/agent-runtime-loader.service';
import { getSessionByToken, SessionError } from '@server/services/runtime/session-manager.service';
import { processMessage, RuntimeError } from '@server/services/runtime/voice-runtime.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { sessionToken, text, audio, audioMimeType } = body;

    if (!sessionToken) {
      return NextResponse.json(
        { code: 'MISSING_TOKEN', message: 'Session token is required.' },
        { status: 400 }
      );
    }

    if (!text && !audio) {
      return NextResponse.json(
        { code: 'MISSING_INPUT', message: 'Text or audio input is required.' },
        { status: 400 }
      );
    }

    // Look up the session
    const session = await getSessionByToken(sessionToken);
    if (!session) {
      return NextResponse.json(
        { code: 'SESSION_NOT_FOUND', message: 'Invalid session token.' },
        { status: 404 }
      );
    }

    // Load the runtime context for this session's agent/org
    const context = await loadAgentRuntime(session.agentId, session.organizationId);

    // Process through the full pipeline
    const result = await processMessage(
      session.id,
      { text, audio, audioMimeType },
      context
    );

    return NextResponse.json({
      messageId: result.messageId,
      text: result.agentText,
      userText: result.userText,
      audio: result.audio,
      audioMimeType: result.audioMimeType,
      processingMs: result.metrics.totalLatencyMs,
      turnCount: result.turnCount,
      shouldEnd: result.shouldEnd,
      endReason: result.endReason,
    });
  } catch (error) {
    if (error instanceof RuntimeError) {
      return NextResponse.json(
        { code: error.code, message: error.message },
        { status: error.statusCode }
      );
    }
    if (error instanceof SessionError) {
      return NextResponse.json(
        { code: error.code, message: error.message },
        { status: error.statusCode }
      );
    }
    if (error instanceof AgentLoaderError) {
      return NextResponse.json(
        { code: error.code, message: error.message },
        { status: error.statusCode }
      );
    }

    console.error('[/api/v1/runtime/message] Unexpected error:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to process message.' },
      { status: 500 }
    );
  }
}
