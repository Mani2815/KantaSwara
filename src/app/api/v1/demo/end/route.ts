// =============================================================================
// POST /api/v1/demo/end — End a demo session and get summary
// =============================================================================
// Returns conversation summary, full transcript, and session metrics.
// Public endpoint — authenticated by session token.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  endDemoSession,
  DemoError,
} from '@server/services/demo/demo.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.sessionToken) {
      return NextResponse.json(
        { code: 'MISSING_TOKEN', message: 'Session token is required.' },
        { status: 400 }
      );
    }

    const result = await endDemoSession(body.sessionToken);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof DemoError) {
      return NextResponse.json(
        { code: error.code, message: error.message },
        { status: error.statusCode }
      );
    }

    console.error('[/api/v1/demo/end] Unexpected error:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to end demo session.' },
      { status: 500 }
    );
  }
}
