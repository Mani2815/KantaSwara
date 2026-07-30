# KantaSwara — Backend Development Progress

> **Branch:** `backend/slaven`  
> **Last Updated:** 2026-07-30  
> **Author:** Slaven

---

## Current Status

### ✅ Completed

#### Phase 0 — Project Analysis
- Full codebase audit completed (35+ Prisma models, 30+ API routes, middleware, auth, RBAC)
- Architecture assessment documented
- Strengths, weaknesses, and gaps identified
- Backend Master Plan created and approved

#### Phase 1 — Technical Foundation
- Provider abstraction layer (`STTProvider`, `LLMProvider`, `TTSProvider` interfaces)
- OpenAI LLM provider (gpt-4o-mini, streaming + non-streaming)
- OpenAI Whisper STT provider (audio-to-text transcription)
- OpenAI TTS provider (text-to-speech, buffered + streaming)
- Provider barrel exports
- Demo agent configuration (Rani persona, system prompt, constraints)
- Demo type definitions (session, message, API request/response, SSE events)
- Rate limiter utility (IP-based sliding window, self-cleaning)
- SSE stream helper (ReadableStream-based, Next.js compatible)
- Prisma schema extended with `DemoSession` and `DemoMessage` models

#### Phase 2 — Demo Voice Call (Milestones 2.1–2.4)
- **Milestone 2.1 (Text Pipeline):** DemoService orchestrator, PromptService, ConversationService, all 4 demo API routes
- **Milestone 2.2 (Audio):** STT + TTS integrated into message pipeline, audio in/out via base64
- **Milestone 2.3 (Streaming):** SSE endpoint with heartbeat, auto-close, event types
- **Milestone 2.4 (Frontend):** `useDemo` hook (mic capture, audio playback, state management), demo page fully rewritten with text/voice modes, live transcript, feedback, summary, registration CTA

---

### 🔧 In Progress

| Item | Status | Notes |
|---|---|---|
| Milestone 2.5 — Polish & Hardening | Partially done | Rate limiting + session limits + Try Demo button implemented. Latency optimization requires production testing |
| Streaming LLM (word-by-word) | SSE infra ready | Wire-up to push LLM stream chunks over SSE pending |

---

### ❌ Not Started

| Phase | Description |
|---|---|
| Phase 3 | Reusable Voice Runtime (extract demo pipeline into multi-tenant service) |
| Phase 4 | Knowledge Engine (document upload, chunking, embedding, vector search, RAG) |
| Phase 5 | AI Agent Integration (connect runtime to org-assigned agents) |
| Phase 6 | Provider Abstraction Registry (dynamic provider switching, failover) |
| Phase 7 | Workflow Engine (execute WorkflowContract graph, decision nodes, API calls) |
| Phase 8 | Analytics Pipeline (daily aggregation, sentiment, call metrics) |
| Phase 9 | Production Hardening (email notifications, job queue, caching, monitoring) |

---

## Aim

### Primary Objective
Deliver a **production-ready public demo voice call** — the #1 priority feature for KantaSwara.

A visitor lands on the website → clicks "Try Live Demo" → immediately talks to Rani (AI voice agent) → experiences real-time AI conversation → gets a summary → option to register.

**No login. No registration. Instant experience.**

### Secondary Objectives
1. Build a **reusable voice runtime** that powers all production AI agents
2. Implement **knowledge retrieval (RAG)** so agents answer from org-specific documents
3. Connect runtime to **organization-assigned agents** through the existing dashboard
4. Create a **provider abstraction** so STT/LLM/TTS/telephony vendors are swappable
5. Build the **workflow execution engine** to run the visual builder's conversation flows
6. Wire **real analytics** into the existing analytics dashboard
7. Harden for **production** (notifications, queues, monitoring, rate limiting)

---

## Pending Work

### Immediate (Before Demo Goes Live)

| # | Task | Priority | Blocked By |
|---|---|---|---|
| 1 | Switch to Node 22 (`nvm use 22`) | 🔴 Critical | Local environment |
| 2 | Run `npm install` | 🔴 Critical | Node 22 |
| 3 | Add `OPENAI_API_KEY` to `.env.local` | 🔴 Critical | API key procurement |
| 4 | Run Prisma migration (`npx prisma migrate dev --name add-demo-sessions`) | 🔴 Critical | npm install |
| 5 | Test demo flow end-to-end | 🔴 Critical | Steps 1–4 |
| 6 | Wire streaming LLM chunks to SSE for real-time transcript | 🟠 High | — |
| 7 | Latency profiling and optimization | 🟡 Medium | Production testing |

### Next Phase (Phase 3 — Voice Runtime)

| # | Task | Priority |
|---|---|---|
| 1 | Extract `VoiceRuntimeService` from DemoService | 🟠 High |
| 2 | Multi-tenant session management | 🟠 High |
| 3 | `VoiceSession` Prisma model + migration | 🟠 High |
| 4 | Context/memory manager with token budgeting | 🟡 Medium |
| 5 | Provider retry/failover logic | 🟡 Medium |
| 6 | Connection manager with reconnection support | 🟡 Medium |

### Future Phases

| Phase | Key Deliverable | Est. Time |
|---|---|---|
| Phase 4 | Knowledge Engine + RAG | 5–7 days |
| Phase 5 | Agent ↔ Organization binding | 4–5 days |
| Phase 6 | Provider registry + failover | 3–4 days |
| Phase 7 | Workflow execution engine | 6–8 days |
| Phase 8 | Analytics aggregation pipeline | 3–4 days |
| Phase 9 | Production hardening | 5–7 days |

---

## Approach

### Architecture Principles
1. **Additive only** — No existing models, UI, or architecture is modified or replaced
2. **Reuse everything** — Auth, RBAC, middleware, Prisma, API client, multi-tenancy are all reused as-is
3. **Modular services** — Each backend module is a standalone service with clear interfaces
4. **Provider abstraction** — All AI vendors (STT/LLM/TTS/telephony) are behind interfaces, swappable without code changes
5. **Progressive build** — Each phase compiles, runs, and is independently testable

### Technology Choices
| Component | Choice | Rationale |
|---|---|---|
| LLM | OpenAI gpt-4o-mini | Fast, cheap, good enough for demo |
| STT | OpenAI Whisper | Single API key, solid accuracy |
| TTS | OpenAI tts-1 (nova voice) | Low latency, natural sounding |
| Real-time | SSE + HTTP POST | Native Next.js support, no custom server needed |
| Rate limiting | In-memory sliding window | Simple, no Redis dependency for MVP |
| Conversation cache | In-memory Map + Prisma | Fast reads, durable writes |

### Demo Flow
```
Landing Page → /demo → Start Session (rate-limited)
                          ↓
              Text/Voice Input → STT (if audio)
                          ↓
              Prompt Assembly (system + history + user message)
                          ↓
              LLM Response (gpt-4o-mini)
                          ↓
              TTS Synthesis (optional)
                          ↓
              Response (text + audio) → Live Transcript
                          ↓
              Continue until end/timeout/max-turns
                          ↓
              End → LLM Summary → Feedback → Register CTA
```

### File Organization
```
server/
├── services/
│   ├── demo/           ← Demo session orchestration
│   ├── voice/          ← Reusable voice services (prompt, conversation)
│   └── providers/      ← AI provider abstraction layer
│       ├── llm/
│       ├── stt/
│       └── tts/
├── utils/              ← Rate limiter, SSE helper
└── lib/                ← Existing (Prisma, audit, supabase)

src/app/api/v1/demo/    ← Demo API routes
src/hooks/useDemo.ts    ← Client-side demo controller
src/app/demo/page.tsx   ← Demo UI (rewritten, not redesigned)
```

### Git Workflow
- **Push to:** `backend/slaven` (never to main or other branches)
- **Pull from:** `main` only
- **Commit strategy:** Logical, phase-aligned commits

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| OpenAI API latency > 3s | Medium | High | Use gpt-4o-mini, streaming, precomputed greeting |
| API cost runaway from anonymous demos | High | Medium | 3 demos/IP/hour, 5min cap, 10 concurrent max |
| Node 22 not available locally | Low | Blocking | Use nvm or container-based dev |
| Browser mic API inconsistency | Low | Medium | Text fallback mode always available |
| Supabase pgvector unavailable (Phase 4) | Low | Medium | Use external vector DB as fallback |

---

*This document is updated as work progresses. Check git log for latest changes.*
