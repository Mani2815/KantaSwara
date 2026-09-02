// =============================================================================
// Standalone WebSocket Server (for Railway/External Deployment)
// =============================================================================
// This server runs entirely independently from Next.js.
// It is designed to be hosted on a platform like Railway to provide a stable,
// long-lived WebSocket connection that bypasses Vercel's serverless timeouts.
//
// Usage: tsx server/standalone-ws.ts
// =============================================================================

import { createServer } from 'node:http';
import type { IncomingMessage } from 'node:http';
import type { Duplex } from 'node:stream';
import { WebSocketServer, WebSocket } from 'ws';
import { ConversationOrchestrator } from './services/demo/conversation-orchestrator';

// Fallback to 8080 if PORT isn't provided (Railway usually sets PORT)
const port = parseInt(process.env.PORT || '8080', 10);
const hostname = process.env.HOSTNAME || '0.0.0.0'; // Bind to all interfaces for Docker/Railway

// ── HTTP & WebSocket Server ──────────────────────────────────────────────────

const server = createServer((req, res) => {
  // Simple health check endpoint for Railway
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('KantaSwara WebSocket Server is running.');
    return;
  }
  
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws: WebSocket) => {
  console.log('[standalone-ws] Client connected');

  const orchestrator = new ConversationOrchestrator(ws as unknown as import('ws').default);

  ws.on('message', (data: import('ws').RawData, isBinary: boolean) => {
    orchestrator.handleMessage(data, isBinary);
  });

  ws.on('close', (code, reason) => {
    console.log(`[standalone-ws] Client disconnected (code: ${code}, reason: ${reason.toString()})`);
    orchestrator.handleDisconnect();
  });

  ws.on('error', (err: Error) => {
    console.error('[standalone-ws] WebSocket error:', err.message);
  });
});

server.on('upgrade', (request: IncomingMessage, socket: Duplex, head: Buffer) => {
  const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
  
  // Accept connections on the specific API route (or allow all if preferred)
  if (url.pathname === '/api/v1/demo/ws') {
    wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// ── Start Server ─────────────────────────────────────────────────────────────

server.listen(port, hostname, () => {
  console.log(`\n  🚀 Standalone WS Server ready on ws://${hostname}:${port}/api/v1/demo/ws\n`);
});

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('\nGracefully shutting down...');
  wss.close(() => {
    server.close(() => {
      process.exit(0);
    });
  });
});

process.on('SIGTERM', () => {
  console.log('\nGracefully shutting down...');
  wss.close(() => {
    server.close(() => {
      process.exit(0);
    });
  });
});
