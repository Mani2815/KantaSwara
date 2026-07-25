# KantaSwara — Supabase Setup Guide

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account
- Supabase CLI (optional, for local dev)

---

## Step 1 — Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Choose an organization, region closest to your users, and a strong database password
3. Wait ~2 minutes for the project to provision

---

## Step 2 — Collect Environment Variables

From **Project Settings → API**:

| Variable | Location |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / public key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role secret key |
| `SUPABASE_JWT_SECRET` | JWT Secret (under "JWT Settings") |

From **Project Settings → Database → Connection String → URI** (Session mode, port 5432):

| Variable | Value |
|---|---|
| `DIRECT_URL` | Full connection string (for Prisma Migrate) |

From **Project Settings → Database → Connection Pooling** (Transaction mode, port 6543):

| Variable | Value |
|---|---|
| `DATABASE_URL` | Connection pooling URL (add `?pgbouncer=true`) |

```bash
# Copy and fill in your values
cp .env.local.example .env.local
```

---

## Step 3 — Run SQL Migrations

In **Supabase Dashboard → SQL Editor**, run the following files **in order**:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls_policies.sql
supabase/migrations/003_profile_trigger.sql
supabase/migrations/004_storage_buckets.sql
```

> ⚠️ **Order matters.** Run them sequentially. Each depends on the previous.

---

## Step 4 — Configure Auth Settings

In **Authentication → Settings**:

1. **Site URL**: Set to `http://localhost:3000` (dev) / your production domain
2. **Redirect URLs**: Add `http://localhost:3000/auth/callback`
3. **Email Templates**: Customize the verification and reset emails
4. **Email Confirmation**: Enable "Confirm email" for security

---

## Step 5 — Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install --save-dev prisma @prisma/client
```

---

## Step 6 — Prisma Setup (NestJS Backend)

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (uses DIRECT_URL, not pooled)
npx prisma migrate dev --name initial_schema

# Validate schema
npx prisma validate
```

> **Note**: Prisma migrations and the SQL migrations in Step 3 are **separate concerns**.
> - SQL migrations = Supabase-specific features (RLS, triggers, storage)
> - Prisma migrations = Schema management for the NestJS backend
>
> If you run Prisma migrate, it may conflict with the manually-created tables.
> **Recommended approach**: Keep RLS/triggers in SQL, and use `prisma db push` (without migrations) in development.

---

## Step 7 — Generate TypeScript Types (after SQL is applied)

```bash
# Install Supabase CLI
npm install --save-dev supabase

# Login and link project
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF

# Generate types (replaces the hand-authored src/lib/supabase/types.ts)
npx supabase gen types typescript --project-id YOUR_PROJECT_REF \
  --schema public > src/lib/supabase/types.ts
```

---

## Step 8 — Local Development

```bash
# Start the Next.js dev server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Recommended: Supabase Local Dev

```bash
# Start local Supabase stack (Docker required)
npx supabase start

# Push your migrations to local
npx supabase db reset
```

---

## Step 9 — Verify Everything Works

1. **Register** a new account at `/register`
2. Check **Supabase Dashboard → Authentication → Users** — user should appear
3. Check **Table Editor → profiles** — profile row should auto-create
4. Check **Table Editor → organizations** — org row should auto-create
5. **Login** at `/login` — should redirect to `/dashboard`
6. **Forgot password** at `/forgot-password` — check your email

---

## Architecture Overview

```
Browser
  ↓ supabase.auth.signInWithPassword()
Supabase Auth (manages JWT cookies via @supabase/ssr)
  ↓ JWT in Authorization header
Next.js Middleware (refreshes session, protects routes)
  ↓ Server Components use server client
Platform pages (server-side auth check in layout)

API Calls:
Browser → fetch() with Bearer token → NestJS
NestJS → SupabaseAuthGuard (verify JWT) → TenantMiddleware (load org) → Controller
```

---

## Storage Usage (Frontend)

```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// Upload avatar (path: avatars/{userId}/{filename})
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/${filename}`, file, {
    cacheControl: '3600',
    upsert: true,
  });

// Get signed URL for private file (recordings, knowledge-base)
const { data: signedUrl } = await supabase.storage
  .from('recordings')
  .createSignedUrl(`${orgId}/${filename}`, 3600); // 1 hour expiry

// Get public URL for avatars
const { data: { publicUrl } } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}/${filename}`);
```
