# KantaSwara 2.0 — Project Status Document

> **Last Updated:** 2026-07-28 | **Branch:** `mani` (pulled from `Mani2815/KantaSwara`)

---

## 🧭 What Is This?

KantaSwara is an **enterprise voice operations platform** — workflow-controlled AI voice agents, multi-tenant isolation, real-time analytics, and automated database provisioning. Think of it as a SaaS platform where organizations deploy and manage intelligent voice agents for business operations.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 16.2.9** (App Router) |
| Runtime | **React 19** |
| Language | **TypeScript 5** |
| Styling | **Tailwind CSS 3.4** |
| Auth | **Supabase Auth** (`@supabase/ssr`) |
| Database ORM | **Prisma 7.8** (`@prisma/adapter-pg`) |
| Database | **PostgreSQL** (via Supabase) |
| State Management | **Zustand 5** |
| Animations | **Framer Motion 12** |
| 3D / Graphics | **Three.js 0.185** |
| Forms | **React Hook Form 7 + Zod 4** |
| UI Primitives | **Radix UI Slot**, **Lucide React** |
| Toast Notifications | **Sonner 2** |
| Node Version | **22.x** (enforced via `.nvmrc`) |

---

## 📁 Project Root Structure

```
kanta-swara-2.0/
├── src/                   ← All application source code
├── prisma/                ← Database schema & migrations config
├── supabase/              ← Supabase migrations
├── scripts/               ← DB setup, seeding, validation scripts
├── server/                ← Server-side lib helpers
├── public/                ← Static assets
├── docs/                  ← Local documentation files
├── .env.local             ← Active environment config (gitignored)
├── .env.local.example     ← Template for env setup
├── next.config.ts         ← Next.js config
├── tailwind.config.ts     ← Tailwind config
├── prisma.config.ts       ← Prisma config
├── tsconfig.json          ← TypeScript config
├── eslint.config.mjs      ← ESLint config
├── AGENTS.md              ← Rules for AI coding agents
├── CLAUDE.md              ← Claude-specific instructions
├── README.md              ← Setup & developer guide
└── agent.md               ← This file
```

---

## 📂 Source Code (`src/`)

### `src/app/` — Next.js App Router Pages

#### Route Groups & Portals

| Route Group | URL Pattern | Purpose |
|---|---|---|
| `(auth)/` | `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`, `/invite`, `/callback` | Public auth flows |
| `(marketing)/` | `/` (landing), `/contact`, `/privacy`, `/terms` | Public marketing site |
| `(platform)/` | `/dashboard`, `/agents`, `/calls`, `/analytics`, `/knowledge`, `/leads`, `/requests`, `/settings`, `/support`, `/organization` | Authenticated org user platform |
| `console/` | `/console/login`, `/console/super-admin`, `/console/solutions-admin`, `/console/support`, `/console/activate-account`, `/console/forgot-password`, `/console/reset-password` | Internal admin console login portal |
| `delivery-console/` | `/delivery-console/*` | AI delivery team's working console — projects, builder, deployments, QA, testing, library, knowledge, reports, assignments, requests, maintenance |
| `superadmin/` | `/superadmin/dashboard`, `/superadmin/organizations`, `/superadmin/users`, `/superadmin/admins`, `/superadmin/subscriptions`, `/superadmin/invoices`, `/superadmin/quotations`, `/superadmin/billing`, `/superadmin/announcements`, `/superadmin/requests`, `/superadmin/security`, `/superadmin/settings`, `/superadmin/support`, `/superadmin/infrastructure` | Super-admin management portal |
| `docs/` | `/docs/*` | Public documentation site |
| `demo/` | `/demo` | Live product demo page |
| `pending-approval/` | `/pending-approval` | Holding page for unapproved orgs |

---

#### Platform Routes (`(platform)/`) — Org User Dashboard

| Route | What's There |
|---|---|
| `/dashboard` | Main org dashboard |
| `/agents` | AI voice agents management |
| `/calls` | Call logs & management |
| `/analytics` | Analytics & reporting |
| `/knowledge` | Knowledge base management |
| `/leads` | Leads management |
| `/requests` | Agent requests |
| `/settings` | Org settings |
| `/support` | Support tickets |
| `/organization` | Organization profile & members |

---

#### Delivery Console (`delivery-console/`) — Internal AI Team Portal

| Route | What's There |
|---|---|
| `/delivery-console` | Dashboard overview |
| `/delivery-console/projects` | Project management |
| `/delivery-console/builder` | Agent builder tool |
| `/delivery-console/deployments` | Deployment management |
| `/delivery-console/assignments` | Task assignments |
| `/delivery-console/qa` | QA management |
| `/delivery-console/testing` | Testing workflows |
| `/delivery-console/library` | Asset/template library |
| `/delivery-console/knowledge` | Knowledge management |
| `/delivery-console/reports` | Reports |
| `/delivery-console/requests` | Incoming requests |
| `/delivery-console/maintenance` | Maintenance tasks |
| `/delivery-console/support` | Support |

---

#### Super Admin Routes (`superadmin/`) — Platform-Level Management

| Route | What's There |
|---|---|
| `/superadmin/dashboard` | Platform-level stats |
| `/superadmin/organizations` | All org management |
| `/superadmin/users` | All user management |
| `/superadmin/admins` | Admin user management + row actions |
| `/superadmin/subscriptions` | Subscription management |
| `/superadmin/invoices` | Invoice management |
| `/superadmin/quotations` | Quotations |
| `/superadmin/requests` | Incoming requests |
| `/superadmin/announcements` | Platform announcements |
| `/superadmin/security` | Security settings |
| `/superadmin/infrastructure` | Infrastructure management |
| `/superadmin/settings` | Super admin settings |
| `/superadmin/support` | Support management |

---

#### API Routes (`src/app/api/`)

| Path | Purpose |
|---|---|
| `/api/v1/organizations` | Org CRUD |
| `/api/v1/plans` | Billing plans |
| `/api/v1/add-ons` | Add-on plans |
| `/api/v1/usage` | Usage tracking |
| `/api/v1/admin` | Admin operations |
| `/api/v1/delivery` | Delivery operations |
| `/api/builder` | Agent builder API |
| `/api/console` | Console-specific API |

---

#### Docs Routes (`docs/`)

| Section | Pages |
|---|---|
| Getting Started | Overview, Features, How It Works, Platform Overview |
| Onboarding | Onboarding, Roles, Approval |
| Agent Lifecycle | Lifecycle, Development, Deployment |
| Dashboard | Dashboard, AI Solutions, Super Admin |
| API Reference | Main, Calls, Organizations, Agent Requests, Analytics, Billing, Knowledge Base |
| Calls & Analytics | Calls Analytics |
| Knowledge Base | Knowledge Base |
| Integrations | Integrations |
| Platform | Billing, Security |
| Release Notes | Release Notes |
| Support | Support |

---

### `src/components/` — Reusable Components

| Folder | Contents |
|---|---|
| `common/Logo/` | App logo component |
| `layout/AppShell/` | Main app shell wrapper |
| `layout/TubelightNavbar/` | Animated navbar |
| `layout/header/` | Page headers |
| `layout/platform/` | Platform layout components |
| `layout/sidebar/` | Sidebar navigation |
| `docs/DocsHeader.tsx` | Docs page header |
| `docs/DocsSidebar.tsx` | Docs navigation sidebar |
| `docs/DocsSearch.tsx` | Docs search component (new) |
| `ui/` | Shared UI primitives |

---

### `src/lib/` — Core Library Utilities

| Path | Purpose |
|---|---|
| `lib/prisma.ts` | Prisma client singleton |
| `lib/supabase/client.ts` | Supabase browser client |
| `lib/supabase/server.ts` | Supabase server client |
| `lib/supabase/middleware.ts` | Supabase middleware helper |
| `lib/billing/` | Billing utilities |
| `lib/console/` | Console utilities |
| `lib/store/` | Zustand store definitions |
| `lib/utils/` | General utility functions |

---

### `src/features/` — Feature Modules

| Feature | Contents |
|---|---|
| `auth/` | Auth-related logic |
| `rbac/` | Role-Based Access Control |
| `superadmin/` | Super admin feature logic |
| `delivery-console/` | Delivery console feature logic |
| `landing/` | Landing page feature logic |

---

### `src/types/` — TypeScript Type Definitions

| File | Types |
|---|---|
| `auth.ts` | Auth-related types |
| `agent.ts` | AI agent types |
| `call.ts` | Call types |
| `knowledge.ts` | Knowledge base types |
| `lead.ts` | Lead types |
| `workflow.ts` | Workflow types |
| `api.ts` | API response types |
| `supabase.ts` | Supabase DB types (auto-generated, 33KB) |

---

### `src/middleware.ts` — Route Middleware

Controls route access for all portals. Handles:
- Auth session checks
- Role-based redirects (org user vs. super admin vs. delivery console)
- Pending approval gating

---

### `src/services/api.ts` — API Service

Centralized API call wrapper for the client.

---

## 🗄 Database (`prisma/`)

| File | Purpose |
|---|---|
| `schema.prisma` | Full Prisma schema (44KB — large, multi-model) |
| `prisma.config.ts` | Prisma config with adapter |

The schema covers: organizations, users, roles, agents, calls, knowledge bases, billing plans, subscriptions, invoices, leads, workflows, requests, and more.

---

## 🔧 Scripts (`scripts/`)

| Script | Purpose |
|---|---|
| `validate-env.mjs` | Checks `.env.local` for required keys at startup |
| `validate-db.mjs` | Validates DB connection at dev startup |
| `run-migrations.mjs` | Applies Supabase/Prisma migrations |
| `seed-billing.mjs` | Seeds billing plans, subscriptions, invoices |
| `seed-admin.mjs` | Promotes user to super admin |
| `reseed-superadmin.mjs` | Re-seeds super admin user |

---

## 🔐 Environment Variables (`.env.local`)

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Admin bypass key |
| `SUPABASE_JWT_SECRET` | Server only | JWT verification |
| `DATABASE_URL` | Server only | Prisma pooling connection (port 6543) |
| `DIRECT_URL` | Server only | Prisma migration connection (port 5432) |
| `NEXT_PUBLIC_APP_URL` | Client + Server | App base URL |
| `NEXT_PUBLIC_API_URL` | Client + Server | API base URL |

---

## 🚦 Current State

- ✅ Pulled latest from `mani` branch (2026-07-28)
- ✅ 35 files updated in latest pull (+2018 lines)
- ✅ Docs section fully expanded with search, sidebar, new pages
- ✅ Super admin admins panel now has row actions (`AdminRowActions.tsx`)
- ⚠️ `package-lock.json` is modified locally (unstaged)
- ⚠️ Server is **not currently running** — run `npm run dev` to start

---

## 🚀 How to Start Developing

```bash
# 1. Ensure correct Node version
nvm use   # uses .nvmrc → Node 22.x

# 2. Install dependencies (if needed)
npm install

# 3. Start dev server
npm run dev
# Runs at: http://localhost:3000
```

---

## 👥 User Roles in the System

| Role | Portal | Access Level |
|---|---|---|
| Organization User | `/dashboard`, `/agents`, `/calls`, etc. | Org-scoped |
| Organization Admin | Same + org management | Org-scoped + admin |
| Delivery Team | `/delivery-console/*` | Internal AI team |
| Solutions Admin | `/console/solutions-admin` | Multi-org solutions |
| Super Admin | `/superadmin/*` | Full platform access |
