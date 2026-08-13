// =============================================================================
// POST /api/v1/demo/start — Start a new demo voice session
// =============================================================================
// Public endpoint — no authentication required.
// Rate-limited by IP address.
// Accepts { domain: 'healthcare' | 'education' | 'banking' } in request body.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  startDemoSession,
  DemoError,
} from '@server/services/demo/demo.service';
import { AVAILABLE_DOMAINS } from '@server/services/demo/domain-personas.config';
import type { DemoDomain } from '@server/services/demo/domain-personas.config';

export async function POST(request: NextRequest) {
  try {
    // Extract IP address from headers (supports proxied requests)
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded?.split(',')[0]?.trim() || 'unknown';
    const userAgent = request.headers.get('user-agent');

    // Parse domain from request body
    let domain: DemoDomain = 'healthcare';
    try {
      const body = await request.json();
      if (body.domain && AVAILABLE_DOMAINS.includes(body.domain)) {
        domain = body.domain;
      } else if (body.domain) {
        return NextResponse.json(
          {
            code: 'INVALID_DOMAIN',
            message: `Invalid domain "${body.domain}". Available: ${AVAILABLE_DOMAINS.join(', ')}`,
          },
          { status: 400 }
        );
      }
    } catch {
      // No body or invalid JSON — use default domain
    }

    const result = await startDemoSession(ipAddress, userAgent, domain);

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
