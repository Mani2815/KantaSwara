// =============================================================================
// POST /api/v1/runtime/session — Create a new voice runtime session
// =============================================================================
// Authenticated endpoint — requires organization context.
// Loads agent configuration, validates deployment, creates session.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { loadAgentRuntime, AgentLoaderError } from '@server/services/runtime/agent-runtime-loader.service';
import { createSession, SessionError } from '@server/services/runtime/session-manager.service';
import { addMessage } from '@server/services/runtime/conversation-manager.service';
import { getTTSProvider } from '@server/services/runtime/provider-registry.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { agentId, organizationId, callerIdentifier } = body;

    if (!agentId || !organizationId) {
      return NextResponse.json(
        { code: 'MISSING_PARAMS', message: 'agentId and organizationId are required.' },
        { status: 400 }
      );
    }

    // Load and validate agent runtime context
    const context = await loadAgentRuntime(agentId, organizationId);

    // Create session
    const session = await createSession(context, callerIdentifier);

    // Store greeting as first agent message
    await addMessage(session.id, 'agent', context.agent.greeting);

    // Generate greeting audio (optional, non-fatal)
    let greetingAudio: string | undefined;
    try {
      const ttsProvider = getTTSProvider(context.providers.tts.provider);
      const ttsResult = await ttsProvider.synthesize(context.agent.greeting, {
        voice: context.agent.voiceConfig.voice,
        speed: context.agent.voiceConfig.speed,
        format: context.agent.voiceConfig.format,
      });
      greetingAudio = ttsResult.audio.toString('base64');
    } catch (err) {
      console.error('[/api/v1/runtime/session] Greeting TTS failed:', err);
    }

    return NextResponse.json(
      {
        sessionId: session.id,
        sessionToken: session.sessionToken,
        greeting: context.agent.greeting,
        greetingAudio,
        agentName: context.agent.name,
        maxDurationSec: context.usageLimits.maxSessionDurationSec,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AgentLoaderError) {
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

    console.error('[/api/v1/runtime/session] Unexpected error:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to create session.' },
      { status: 500 }
    );
  }
}
