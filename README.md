# KantaSwara — The Voice of Intelligent Business

KantaSwara is an enterprise platform for intelligent voice operations: workflow-controlled conversations, multi-tenant isolation, real-time analytics, and automatic database provisioning.

This repository is optimized for deterministic, cross-environment reproducibility. Every developer gets the exact same UI, state, and runtime behavior out-of-the-box.

---

## 🛠️ Prerequisites

* **Node.js**: `v20.x` or `v22.x` (LTS recommended)
* **Package Manager**: `npm` (default)
* **Database**: PostgreSQL (Supabase recommended)
* **Supabase Account**: Required for OAuth features, storage buckets, and user authentication hooks.

---

## 🚀 Quick Start Guide

### 1. Clone the Repository
```bash
git clone <repository-url> kantaswara
cd kantaswara
```

### 2. Enforce Node Environment
We enforce a strict Node version to ensure reproducibility.
```bash
nvm use # requires Node 22.x
```

### 3. Initialize the Project
The `setup` script will automatically install npm dependencies (strictly enforced by engines), prompt you to configure your environment, and apply migrations/seeds.
```bash
npm run setup
```
*(If the `.env.local` is missing, the script will create it from `.env.example`. You will need to edit it with your Supabase credentials before running `npm run db:setup` manually if it fails the first time).*

> [!IMPORTANT]
> Make sure `DATABASE_URL` uses transaction pooling (port 6543) and `DIRECT_URL` points to direct connections (port 5432) for running migrations.

### 5. Promote a User to Admin
After registering an account on the client (`http://localhost:3000/register`), promote them to organization admin:
```bash
# Promotes the user specified in your .env.local under ADMIN_EMAIL
npm run db:seed-admin
```

### 6. Start the Development Server
```bash
npm run dev
```

---

## 📋 Environment Variable Validation

The project employs boot-time validation checks for dev and build runs. If `.env.local` is missing, or keys contain default placeholders (like `[project-ref]`, `[password]`), the startup process halts with instructions.

| Key | Description | Scope |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase endpoint | Client & Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client-side anon key | Client & Server |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin bypass key | Server Only |
| `SUPABASE_JWT_SECRET` | Custom token signature verify | Server Only |
| `DATABASE_URL` | Prisma pooling connection (port 6543) | Server Only |
| `DIRECT_URL` | Prisma migration direct connection (port 5432) | Server Only |
| `NEXT_PUBLIC_APP_URL` | Local deployment base url | Client & Server |
| `NEXT_PUBLIC_API_URL` | Local API endpoint | Client & Server |

---

## 🔧 Useful Scripts

* `npm run dev`: Runs Next.js dev server (with boot environment validation).
* `npm run build`: Builds Next.js production bundles (with environment validation).
* `npm run lint`: Analyzes code syntax using ESLint.
* `npm run db:generate`: Regenerates local Prisma Client assets manually.
* `npm run db:migrate`: Deploys Supabase schema migrations.
* `npm run db:seed`: Populates initial billing plans, subscriptions, and invoices.
* `npm run db:seed-admin`: Promotes the registered `ADMIN_EMAIL` to super admin status.

---

## 🧪 CI/CD Checks

Pull Requests are validated with automated checks that enforce consistency:
1. **Linting**: Checks syntax rules (`npm run lint`).
2. **Type-Safety**: Compiles the typescript tree to check annotations (`npx tsc --noEmit`).
3. **Environment Checks**: Bootstraps test environment configuration checks.
4. **Build Verification**: Pre-builds production artifacts (`npm run build`) to ensure successful bundler compilation.
