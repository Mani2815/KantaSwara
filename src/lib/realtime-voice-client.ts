// =============================================================================
// Real-time voice transport
// =============================================================================
// This module is intentionally browser-only and has no dependency on Next.js
// routes. In development it targets the local standalone server; production
// callers must provide the Railway WebSocket URL at build time.

import { ReconnectWS, type ReconnectWSCallbacks } from './ws-reconnect';

export const LOCAL_VOICE_WS_URL = 'ws://localhost:3001/api/v1/demo/ws';

export function getRealtimeVoiceUrl(): string | undefined {
  return process.env.NODE_ENV === 'development'
    ? LOCAL_VOICE_WS_URL
    : process.env.NEXT_PUBLIC_WS_URL;
}

export class RealtimeVoiceClient extends ReconnectWS {
  constructor(callbacks: ReconnectWSCallbacks) {
    const url = getRealtimeVoiceUrl();
    if (!url) throw new Error('Real-Time Voice is temporarily unavailable.');
    super(
      { url, maxRetries: 3, initialBackoffMs: 300, maxBackoffMs: 2_000 },
      callbacks
    );
  }
}
