# KantaSwara hybrid deployment

```text
                         ┌─────────────────────────────┐
Browser ── Text Mode ───▶│ Vercel: Next.js             │
                         │ /api/v1/demo/start          │
                         │ /api/v1/demo/message ──────▶ LLM / database
                         │ /api/v1/demo/end            │
                         └─────────────────────────────┘

Browser ── Voice Mode ──▶ Railway: /api/v1/demo/ws
                         standalone-ws → orchestrator
                         → Deepgram Live STT → LLM → Flux TTS
                         → VAD, audio streaming, barge-in
```

## Routing and failover

- Text mode creates a session with `POST /api/v1/demo/start` and sends every
  message to `POST /api/v1/demo/message`. It never constructs a WebSocket.
- Voice mode is selectable only when `NEXT_PUBLIC_WS_URL` is defined. It opens
  that URL directly, which must be `wss://<railway-domain>/api/v1/demo/ws`.
- A missing URL or a failed WebSocket connection disables voice and reports
  `Real-time Voice is currently unavailable.` Text mode remains available.

## Deployment configuration

Vercel requires `NEXT_PUBLIC_WS_URL=wss://<railway-domain>/api/v1/demo/ws` to
enable the voice option. It continues to host Next.js, REST APIs, auth,
Prisma/Supabase access, dashboard, transcripts, and text sessions.

Railway uses `npm run start:ws` (configured in `railway.json`) and requires:
`PORT`, `DATABASE_URL`, `DIRECT_URL`, `REDIS_URL` (optional),
`DEEPGRAM_API_KEY`, `GROQ_API_KEY`, `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, and `NEXT_PUBLIC_SUPABASE_URL`.

Railway serves no Next.js pages or React assets; it only runs the persistent
WebSocket, conversation orchestrator, streaming providers, VAD/audio pipeline,
and optional Redis/queue infrastructure.
