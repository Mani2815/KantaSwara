// =============================================================================
// Demo Voice WebSocket Route Handler
// =============================================================================
// Voice streaming is intentionally not hosted by Vercel. The browser connects
// directly to the Railway standalone server using NEXT_PUBLIC_WS_URL.
//
// This route remains as a discoverable API response for callers still using the
// old path; it must never upgrade a WebSocket or instantiate an orchestrator.
// =============================================================================

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export function GET() {
  return NextResponse.json(
    {
      code: 'VOICE_BACKEND_EXTERNAL',
      message: 'Real-time Voice is served by the configured Railway WebSocket backend.',
    },
    { status: 426 }
  );
}
