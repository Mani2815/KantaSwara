// =============================================================================
// POST /api/v1/demo/feedback — Submit feedback for a demo session
// =============================================================================
// Optional endpoint — visitors can rate their demo experience.
// Public endpoint — authenticated by session token.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  submitFeedback,
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

    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { code: 'INVALID_RATING', message: 'Rating must be between 1 and 5.' },
        { status: 400 }
      );
    }

    await submitFeedback(body.sessionToken, body.rating, body.feedback);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof DemoError) {
      return NextResponse.json(
        { code: error.code, message: error.message },
        { status: error.statusCode }
      );
    }

    console.error('[/api/v1/demo/feedback] Unexpected error:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to submit feedback.' },
      { status: 500 }
    );
  }
}
