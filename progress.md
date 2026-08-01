# KantaSwara — Backend Development Progress

> **Branch:** `backend/slaven`  
> **Last Updated:** 2026-08-01  
> **Author:** Slaven

---

## 🎯 Final Aim & Context

### The Vision
KantaSwara is designed to be an **Enterprise AI Voice Operations Platform**. The core value proposition is enabling organizations to deploy, manage, and monitor custom AI voice agents for customer support, sales, appointment booking, and lead qualification without needing to build the underlying infrastructure. It is a managed service rather than a no-code builder.

### Primary Objective (Immediate)
Deliver a **production-ready public demo voice call** — the #1 priority feature to showcase KantaSwara's capabilities to prospective clients. 
A visitor lands on the website → clicks "Try Live Demo" → instantly talks to Rani (the demo AI agent) → experiences low-latency real-time voice AI → receives a call summary → sees a call-to-action to register. This acts as the ultimate lead magnet.

### Long-Term Objectives
1. **Reusable Voice Runtime:** A robust, scalable execution engine that handles thousands of concurrent voice sessions across multiple tenants (organizations).
2. **Knowledge Engine (RAG):** Enable agents to dynamically retrieve and answer questions based on organization-specific documents.
3. **Workflow Execution Engine:** Execute complex conversational flows (decision trees, API calls) defined via a visual builder.
4. **Provider Abstraction Registry:** Maintain true vendor independence by making STT, LLM, TTS, and Telephony providers dynamically swappable and resilient with failover mechanisms.
5. **Comprehensive Analytics:** Deliver deep insights into call performance, sentiment, and cost metrics for organizations.

---

## 🚦 Current Status

### ✅ Completed

#### Phase 0 — Project Analysis
- Full codebase audit (Prisma schema: 35+ models, API routes, middleware, auth, RBAC).
- Architecture assessment and identification of technical gaps.
- Backend Master Plan and Git workflow established.

#### Phase 1 — Technical Foundation
- Provider abstraction layer (`STTProvider`, `LLMProvider`, `TTSProvider` interfaces).
- Provider integrations: OpenAI LLM (gpt-4o-mini), Whisper STT, and TTS (nova voice).
- Demo configuration: Persona setup (Rani), system constraints, rate limits.
- Core utilities: Rate limiter, SSE stream helper.
- Prisma schema updates: `DemoSession` and `DemoMessage` models.

#### Phase 2 — Demo Voice Call Pipeline (Milestones 2.1–2.4)
- **Milestone 2.1:** Demo orchestrator, prompt assembly, and conversation services.
- **Milestone 2.2:** Full STT + TTS integration handling base64 audio in/out.
- **Milestone 2.3:** Real-time infrastructure with SSE for text streaming.
- **Milestone 2.4:** Frontend `useDemo` hook (MediaRecorder, AudioContext) and UI rewrite.

### 🔧 In Progress

| Item | Status | Notes |
|---|---|---|
| Milestone 2.5 — Polish & Hardening | In Progress | Rate limiting and concurrency controls are implemented. Requires latency profiling on production servers. |
| Streaming LLM Response | Pending Integration | SSE infrastructure is ready, but word-by-word streaming needs to be fully wired up to the frontend UI for live transcripts. |

---

## 🚀 Remaining Phases & Detailed Workflow

### Phase 3: Reusable Voice Runtime (Multi-tenant Orchestration)
Extract the single-tenant demo pipeline into a robust, multi-tenant execution engine.
- **`VoiceSession` Management:** Migrate from `DemoSession` to a generalized `Conversation` and `VoiceSession` model linking to specific organizations and agents.
- **Context & Token Budgeting:** Implement sliding window memory management that strictly adheres to token limits to control costs.
- **Connection Manager:** Handle WebSockets or WebRTC for robust, low-latency audio streaming (replacing the HTTP polling/base64 approach used in the demo).
- **Workflow:** An API gateway routes incoming telephony/web connections -> Connection Manager -> Voice Runtime -> Providers.

### Phase 4: Knowledge Engine (RAG Integration)
Enable agents to understand and query organizational data.
- **Document Pipeline:** Endpoints for uploading PDF/TXT/HTML files.
- **Vector DB Integration:** Chunking text and generating embeddings (using OpenAI text-embedding-3 or similar), storing them in Supabase pgvector or an external vector DB.
- **Retrieval Workflow:** During `PromptService` assembly, run a semantic search against the organization's Knowledge Base and inject context into the LLM system prompt dynamically.

### Phase 5: Agent ↔ Organization Binding
Connect the underlying runtime with the platform's RBAC and tenant architecture.
- **Configuration API:** Build out the CRUD endpoints for `AgentConfiguration`, `PromptConfiguration`, and `VoiceConfiguration` models.
- **Deployment Manager:** Logic to transition an agent from "Draft" -> "Testing" -> "Deployed", making it actively available for calls.
- **Security Check:** Ensure all API keys and billing constraints are checked before allowing an organization's agent to start a session.

### Phase 6: Provider Abstraction Registry & Failover
Make the system resilient against AI provider outages.
- **Dynamic Registry:** Load provider credentials dynamically from `OrgSettings` or platform defaults.
- **Failover Logic:** If OpenAI Whisper fails or times out (>2s), automatically fallback to Deepgram or Azure STT.
- **Cost Routing:** Allow routing inference requests based on cost constraints (e.g., use Claude 3 Haiku for basic queries, GPT-4o for complex reasoning).

### Phase 7: Workflow Execution Engine
Bring the visual builder to life.
- **Graph Execution:** Parse JSON-based workflow graphs (from `WorkflowConfiguration`).
- **State Machine:** Implement a state machine that transitions between states based on LLM intent classification (e.g., "User wants to book -> Transition to Booking Node").
- **External Webhooks:** Allow the agent to trigger API calls (e.g., POST to a CRM) mid-conversation and wait for the response before speaking.

### Phase 8: Analytics & Telemetry Pipeline
Expose insights to organizations.
- **Event Bus:** Emit structured events (`session_started`, `message_processed`, `tool_called`) to an internal queue.
- **Aggregation Cron:** Background jobs to roll up metrics into `Analytics` and `UsageReport` models (daily cost, average call duration, sentiment score).
- **Dashboard API:** REST endpoints serving aggregated time-series data for the frontend dashboard.

### Phase 9: Production Hardening
Prepare the platform for enterprise SLAs.
- **Queues:** Implement Redis-based job queues (BullMQ) for async tasks like document embedding and summary generation.
- **Monitoring & Alerts:** Set up DataDog/Sentry for backend error tracking and latency monitoring.
- **Billing Integration:** Hook up `VoiceUsage` to Stripe for automated invoicing based on minutes consumed.

---

## 🛠 Next Steps (Immediate Action Plan)

1. **Verify Environment:** Switch to Node 22, run `npm install`, and configure `OPENAI_API_KEY`.
2. **Database Sync:** Run Prisma migrations (`npx prisma migrate dev --name add-demo-sessions`).
3. **End-to-End Demo Test:** Validate the STT -> LLM -> TTS pipeline locally.
4. **Wire Streaming Transcript:** Connect the SSE chunks to the `useDemo` frontend for real-time text appearance.
5. **Commit & Deploy:** Push finalized demo to `backend/slaven` and prepare for staging deployment.

---
*This document outlines the complete roadmap. Refer to specific PRs and git history for atomic code changes.*
