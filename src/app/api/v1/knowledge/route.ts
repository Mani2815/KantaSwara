// =============================================================================
// Knowledge Base Routes
// GET  /api/v1/knowledge — List knowledge bases for an organization
// POST /api/v1/knowledge — Create a knowledge base
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

    const bases = await prisma.knowledgeBase.findMany({
      where: { organizationId, deletedAt: null },
      include: {
        _count: { select: { documents: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      knowledgeBases: bases.map((kb) => ({
        id: kb.id,
        name: kb.name,
        description: kb.description,
        documentCount: kb.documentCount,
        totalSizeBytes: Number(kb.totalSizeBytes),
        actualDocuments: kb._count.documents,
        createdAt: kb.createdAt,
        updatedAt: kb.updatedAt,
      })),
    });
  } catch (err) {
    console.error('[API] GET /knowledge error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, name, description } = body;

    if (!organizationId || !name) {
      return NextResponse.json(
        { error: 'organizationId and name are required' },
        { status: 400 }
      );
    }

    const kb = await prisma.knowledgeBase.create({
      data: {
        organizationId,
        name,
        description: description || '',
      },
    });

    return NextResponse.json({ knowledgeBase: kb }, { status: 201 });
  } catch (err) {
    console.error('[API] POST /knowledge error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
