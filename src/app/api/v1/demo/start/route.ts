// =============================================================================
// POST /api/v1/demo/start — Start a new demo voice session
// =============================================================================
// Public endpoint — no authentication required.
// Rate-limited by IP address.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  startDemoSession,
  DemoError,
} from '@server/services/demo/demo.service';

export async function POST(request: NextRequest) {
  try {
    // Extract IP address from headers (supports proxied requests)
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded?.split(',')[0]?.trim() || 'unknown';
    const userAgent = request.headers.get('user-agent');

    const result = await startDemoSession(ipAddress, userAgent);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof DemoError) {
      return NextResponse.json(
        { code: error.code, message: error.message },
        { status: error.statusCode }
      );
    }

    console.error('[/api/v1/demo/start] Unexpected error:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to start demo session.' },
      { status: 500 }
    );
  }
}
