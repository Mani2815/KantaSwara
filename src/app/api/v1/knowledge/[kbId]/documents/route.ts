// =============================================================================
// Knowledge Document Upload Route
// POST /api/v1/knowledge/[kbId]/documents — Upload a document
// GET  /api/v1/knowledge/[kbId]/documents — List documents
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@server/lib/prisma';
import { enqueueEmbeddingJob } from '@server/lib/queue/queue';

type RouteContext = { params: Promise<{ kbId: string }> };

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { kbId } = await context.params;

    const documents = await prisma.knowledgeDocument.findMany({
      where: { knowledgeBaseId: kbId, deletedAt: null },
      select: {
        id: true,
        name: true,
        mimeType: true,
        sizeBytes: true,
        status: true,
        storageKey: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      documents: documents.map((d) => ({
        ...d,
        sizeBytes: Number(d.sizeBytes),
      })),
    });
  } catch (err) {
    console.error('[API] GET /knowledge/[kbId]/documents error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { kbId } = await context.params;
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 });
    }

    // Verify knowledge base exists
    const kb = await prisma.knowledgeBase.findFirst({
      where: { id: kbId, organizationId, deletedAt: null },
    });

    if (!kb) {
      return NextResponse.json({ error: 'Knowledge base not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 });
    }

    // Create document record
    const doc = await prisma.knowledgeDocument.create({
      data: {
        knowledgeBaseId: kbId,
        organizationId,
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        storageKey: `documents/${organizationId}/${kbId}/${Date.now()}_${file.name}`,
        status: 'pending',
      },
    });

    // Enqueue for background processing
    await enqueueEmbeddingJob({
      documentId: doc.id,
      organizationId,
      knowledgeBaseId: kbId,
      fileName: file.name,
    });

    return NextResponse.json(
      {
        document: {
          id: doc.id,
          name: doc.name,
          status: 'pending',
        },
        message: 'Document uploaded. Processing will happen in the background.',
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[API] POST /knowledge/[kbId]/documents error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
