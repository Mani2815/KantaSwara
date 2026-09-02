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

// CRITICAL FIX: Always bind to 0.0.0.0 on Railway. Do NOT use process.env.HOSTNAME.
// Railway injects HOSTNAME with an internal container string which prevents the public IPv4 proxy from routing traffic.
const hostname = '0.0.0.0'; 

// ── HTTP & WebSocket Server ──────────────────────────────────────────────────

console.log('[standalone-ws] Initializing HTTP server...');

const server = createServer((req, res) => {
  // CORS Headers for API accessibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 1. Root Endpoint
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      service: "KantaSwara Voice Backend",
      status: "running"
    }));
    return;
  }
  
  // 2. Health Endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: "ok"
    }));
    return;
  }
  
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: "Not Found" }));
});

const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws: WebSocket) => {
  console.log('[standalone-ws] Client connected');

  try {
    const orchestrator = new ConversationOrchestrator(ws as unknown as import('ws').default);

    ws.on('message', (data: import('ws').RawData, isBinary: boolean) => {
      try {
        orchestrator.handleMessage(data, isBinary);
      } catch (err: any) {
        console.error('[standalone-ws] Error handling message:', err.message, err.stack);
      }
    });

    ws.on('close', (code, reason) => {
      console.log(`[standalone-ws] Client disconnected (code: ${code}, reason: ${reason.toString()})`);
      try {
        orchestrator.handleDisconnect();
      } catch (err: any) {
        console.error('[standalone-ws] Error during orchestrator disconnect cleanup:', err.message);
      }
    });
  } catch (err: any) {
    console.error('[standalone-ws] Fatal error initializing ConversationOrchestrator:', err.message, err.stack);
    ws.close(1011, 'Internal Server Error');
  }

  ws.on('error', (err: Error) => {
    console.error('[standalone-ws] WebSocket connection error:', err.message, err.stack);
  });
});

server.on('upgrade', (request: IncomingMessage, socket: Duplex, head: Buffer) => {
  const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
  
  // Accept connections on the specific API route
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
  console.log('\n======================================================');
  console.log('✅ KantaSwara Voice Backend Started Successfully');
  console.log('======================================================');
  console.log(`🌍 Environment:      ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Host Bound:       ${hostname}`);
  console.log(`🔌 Port Bound:       ${port}`);
  console.log(`🔗 Root HTTP:        http://${hostname}:${port}/`);
  console.log(`🏥 Health Endpoint:  http://${hostname}:${port}/health`);
  console.log(`🎙️  WebSocket Route:  ws://${hostname}:${port}/api/v1/demo/ws`);
  console.log('======================================================\n');
});

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('\n[standalone-ws] Received SIGINT. Gracefully shutting down...');
  wss.close(() => {
    server.close(() => {
      console.log('[standalone-ws] Server closed.');
      process.exit(0);
    });
  });
});

process.on('SIGTERM', () => {
  console.log('\n[standalone-ws] Received SIGTERM (Railway Stop). Gracefully shutting down...');
  wss.close(() => {
    server.close(() => {
      console.log('[standalone-ws] Server closed.');
      process.exit(0);
    });
  });
});

process.on('uncaughtException', (err) => {
  console.error('[standalone-ws] UNCAUGHT EXCEPTION:', err.message, err.stack);
  // Do not exit immediately, allow logging to flush
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[standalone-ws] UNHANDLED PROMISE REJECTION:', reason);
});
