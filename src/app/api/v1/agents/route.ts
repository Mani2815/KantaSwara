// =============================================================================
// GET /api/v1/agents — List agents for organization
// POST /api/v1/agents — Create a new agent
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  listAgents,
  createAgent,
  AgentConfigError,
} from '@server/services/agents/agent-config.service';

// =============================================================================
// GET — List Agents
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json(
        { code: 'MISSING_PARAMS', message: 'organizationId is required.' },
        { status: 400 }
      );
    }

    const result = await listAgents(organizationId, {
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: Math.min(parseInt(searchParams.get('limit') || '20', 10), 100),
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('[API] GET /api/v1/agents error:', err);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to list agents.' },
      { status: 500 }
    );
  }
}

// =============================================================================
// POST — Create Agent
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, name, description, systemPrompt, greeting, voiceConfig, knowledgeBaseIds, workflowId, runtimeConfig } = body;

    if (!organizationId) {
      return NextResponse.json(
        { code: 'MISSING_PARAMS', message: 'organizationId is required.' },
        { status: 400 }
      );
    }

    if (!name || !systemPrompt || !greeting) {
      return NextResponse.json(
        { code: 'MISSING_PARAMS', message: 'name, systemPrompt, and greeting are required.' },
        { status: 400 }
      );
    }

    if (!voiceConfig || !voiceConfig.voice) {
      return NextResponse.json(
        { code: 'MISSING_PARAMS', message: 'voiceConfig with voice is required.' },
        { status: 400 }
      );
    }

    const agent = await createAgent(organizationId, {
      name,
      description,
      systemPrompt,
      greeting,
      voiceConfig: {
        voice: voiceConfig.voice,
        speed: voiceConfig.speed || 1.0,
        format: voiceConfig.format || 'mp3',
        language: voiceConfig.language || 'en',
        model: voiceConfig.model,
      },
      knowledgeBaseIds,
      workflowId,
      runtimeConfig,
    });

    return NextResponse.json(agent, { status: 201 });
  } catch (err) {
    if (err instanceof AgentConfigError) {
      return NextResponse.json(
        { code: err.code, message: err.message },
        { status: err.statusCode }
      );
    }
    console.error('[API] POST /api/v1/agents error:', err);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to create agent.' },
      { status: 500 }
    );
  }
}
