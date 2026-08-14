// =============================================================================
// GET /api/v1/agents/:id — Get agent details
// PUT /api/v1/agents/:id — Update agent configuration
// DELETE /api/v1/agents/:id — Soft-delete agent
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  getAgent,
  updateAgent,
  deleteAgent,
  AgentConfigError,
} from '@server/services/agents/agent-config.service';

type RouteParams = { params: Promise<{ id: string }> };

// =============================================================================
// GET — Get Agent Detail
// =============================================================================

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json(
        { code: 'MISSING_PARAMS', message: 'organizationId is required.' },
        { status: 400 }
      );
    }

    const agent = await getAgent(id, organizationId);

    if (!agent) {
      return NextResponse.json(
        { code: 'AGENT_NOT_FOUND', message: 'Agent not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(agent);
  } catch (err) {
    console.error('[API] GET /api/v1/agents/:id error:', err);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to get agent.' },
      { status: 500 }
    );
  }
}

// =============================================================================
// PUT — Update Agent
// =============================================================================

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { organizationId, ...updateData } = body;

    if (!organizationId) {
      return NextResponse.json(
        { code: 'MISSING_PARAMS', message: 'organizationId is required.' },
        { status: 400 }
      );
    }

    const agent = await updateAgent(id, organizationId, updateData);
    return NextResponse.json(agent);
  } catch (err) {
    if (err instanceof AgentConfigError) {
      return NextResponse.json(
        { code: err.code, message: err.message },
        { status: err.statusCode }
      );
    }
    console.error('[API] PUT /api/v1/agents/:id error:', err);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to update agent.' },
      { status: 500 }
    );
  }
}

// =============================================================================
// DELETE — Soft-Delete Agent
// =============================================================================

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json(
        { code: 'MISSING_PARAMS', message: 'organizationId is required.' },
        { status: 400 }
      );
    }

    await deleteAgent(id, organizationId);
    return NextResponse.json({ success: true, message: 'Agent deleted.' });
  } catch (err) {
    if (err instanceof AgentConfigError) {
      return NextResponse.json(
        { code: err.code, message: err.message },
        { status: err.statusCode }
      );
    }
    console.error('[API] DELETE /api/v1/agents/:id error:', err);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to delete agent.' },
      { status: 500 }
    );
  }
}
