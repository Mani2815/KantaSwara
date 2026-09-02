// =============================================================================
// Custom Dev Server with WebSocket Support
// =============================================================================
// Next.js 16's dev server (Turbopack) does not support WebSocket upgrades.
// This local development server hosts the same WebSocket path as Railway.
//
// This custom server wraps Next.js and adds native WebSocket upgrade handling
// so the voice demo works identically in local development.
//
// Usage: tsx server/dev-server.ts
// =============================================================================

import { createServer } from 'node:http';
import type { IncomingMessage } from 'node:http';
import type { Duplex } from 'node:stream';
import next from 'next';
import { WebSocketServer, WebSocket } from 'ws';
import { ConversationOrchestrator } from './services/demo/conversation-orchestrator';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// ── HTTP Server ─────────────────────────────────────────────────────────────

async function startServer() {
  await app.prepare();

  const server = createServer((req, res) => {
    handle(req, res).catch((err: unknown) => {
      console.error('[dev-server] Request handler error:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    });
  });

  // ── WebSocket Server ────────────────────────────────────────────────────────
  // In Next.js 16, the internal dev server or proxy can abruptly drop WebSocket 
  // connections if we try to hijack the main port. We run the WS server on a 
  // dedicated port (3001) in development to bypass the Next.js proxy completely.

  const wsServer = createServer();
  const wss = new WebSocketServer({ noServer: true });

  wss.on('connection', (ws: WebSocket) => {
    console.log('[dev-server] WebSocket connected: /api/v1/demo/ws');

    const orchestrator = new ConversationOrchestrator(ws as unknown as import('ws').default);

    ws.on('message', (data: import('ws').RawData, isBinary: boolean) => {
      orchestrator.handleMessage(data, isBinary);
    });

    ws.on('close', (code, reason) => {
      console.log(`[dev-server] WebSocket disconnected (code: ${code}, reason: ${reason.toString()})`);
      orchestrator.handleDisconnect();
    });

    ws.on('error', (err: Error) => {
      console.error('[dev-server] WebSocket error:', err.message);
    });
  });

  wsServer.on('upgrade', (request: IncomingMessage, socket: Duplex, head: Buffer) => {
    const { pathname } = new URL(request.url || '/', `http://${request.headers.host}`);
    if (pathname === '/api/v1/demo/ws') {
      wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  const wsPort = 3001;
  wsServer.listen(wsPort, () => {
    console.log(`  ✓ WebSocket server ready on ws://${hostname}:${wsPort}`);
  });

  // ── Start Main Next.js Server ───────────────────────────────────────────────

  server.listen(port, () => {
    console.log(`\n  ▲ Dev server ready on http://${hostname}:${port}`);
    console.log(`  ✓ WebSocket endpoint: ws://${hostname}:${port}/api/v1/demo/ws`);
    console.log(`  ✓ Next.js ${dev ? 'development' : 'production'} mode\n`);
  });
}

startServer().catch(console.error);
