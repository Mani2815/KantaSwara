// =============================================================================
// POST /api/v1/agents/:id/publish — Publish agent version
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { publishAgent, DeploymentError } from '@server/services/agents/agent-deployment.service';

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { organizationId } = body;

    if (!organizationId) {
      return NextResponse.json(
        { code: 'MISSING_PARAMS', message: 'organizationId is required.' },
        { status: 400 }
      );
    }

    const result = await publishAgent(id, organizationId);

    return NextResponse.json(result, {
      status: result.success ? 200 : 422,
    });
  } catch (err) {
    if (err instanceof DeploymentError) {
      return NextResponse.json(
        { code: err.code, message: err.message },
        { status: err.statusCode }
      );
    }
    console.error('[API] POST /api/v1/agents/:id/publish error:', err);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to publish agent.' },
      { status: 500 }
    );
  }
}
