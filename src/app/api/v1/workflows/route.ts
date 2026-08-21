// =============================================================================
// Workflow Routes
// GET  /api/v1/workflows — List workflows
// POST /api/v1/workflows — Create workflow
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@server/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 });
    }

    const workflows = await prisma.workflow.findMany({
      where: { organizationId, deletedAt: null },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        version: true,
        lastPublishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ workflows });
  } catch (err) {
    console.error('[API] GET /workflows error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, name, description, contract } = body;

    if (!organizationId || !name) {
      return NextResponse.json(
        { error: 'organizationId and name are required' },
        { status: 400 }
      );
    }

    const workflow = await prisma.workflow.create({
      data: {
        organizationId,
        name,
        description: description || '',
        contract: contract || { nodes: [], edges: [] },
        status: 'draft',
        version: 1,
      },
    });

    return NextResponse.json({ workflow }, { status: 201 });
  } catch (err) {
    console.error('[API] POST /workflows error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
