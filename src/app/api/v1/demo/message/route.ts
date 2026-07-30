// =============================================================================
// POST /api/v1/demo/message — Send a message in a demo session
// =============================================================================
// Accepts text or audio input. Returns AI text + audio response.
// Public endpoint — authenticated by session token.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  processDemoMessage,
  DemoError,
} from '@server/services/demo/demo.service';
import type { DemoMessageRequest } from '@server/services/demo/demo.types';

export async function POST(request: NextRequest) {
  try {
    const body: DemoMessageRequest = await request.json();

    if (!body.sessionToken) {
      return NextResponse.json(
        { code: 'MISSING_TOKEN', message: 'Session token is required.' },
        { status: 400 }
      );
    }

    if (!body.text && !body.audio) {
      return NextResponse.json(
        { code: 'MISSING_INPUT', message: 'Text or audio input is required.' },
        { status: 400 }
      );
    }

    const result = await processDemoMessage(body.sessionToken, {
      text: body.text,
      audio: body.audio,
      audioMimeType: body.audioMimeType,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof DemoError) {
      return NextResponse.json(
        { code: error.code, message: error.message },
        { status: error.statusCode }
      );
    }

    console.error('[/api/v1/demo/message] Unexpected error:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to process message.' },
      { status: 500 }
    );
  }
}
