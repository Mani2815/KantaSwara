// =============================================================================
// Demo Voice WebSocket Route Handler
// =============================================================================
// Vercel native WebSocket upgrade for real-time streaming voice demo.
// Uses experimental_upgradeWebSocket from @vercel/functions.
//
// The connection is "pinned" to a specific Function instance for its duration.
// Reconnection/resume protocol handles function timeouts and network drops.
// =============================================================================

import { experimental_upgradeWebSocket } from '@vercel/functions';
import type { WebSocketData } from '@vercel/functions';
import { ConversationOrchestrator } from '@server/services/demo/conversation-orchestrator';

export async function GET() {
  return experimental_upgradeWebSocket((ws) => {
    const orchestrator = new ConversationOrchestrator(ws as unknown as import('ws').default);

    ws.on('message', (data: WebSocketData) => {
      const isBinary = data instanceof ArrayBuffer || data instanceof Uint8Array;
      orchestrator.handleMessage(
        isBinary ? Buffer.from(data as ArrayBuffer) : data,
        isBinary
      );
    });

    ws.on('close', () => {
      orchestrator.handleDisconnect();
    });
  });
}
