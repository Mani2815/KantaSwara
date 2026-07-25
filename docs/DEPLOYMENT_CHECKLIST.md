# KantaSwara — Production Deployment Checklist

## Pre-Deployment

### Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` — set to production project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` — production anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — production service role key (backend only, not in Next.js env)
- [ ] `SUPABASE_JWT_SECRET` — production JWT secret (NestJS backend)
- [ ] `DATABASE_URL` — production pooled connection (port 6543, `?pgbouncer=true`)
- [ ] `DIRECT_URL` — production direct connection (port 5432, migrations only)
- [ ] `NEXT_PUBLIC_APP_URL` — production domain (e.g., `https://app.kantaswara.io`)
- [ ] `NEXT_PUBLIC_API_URL` — production NestJS API URL

### Supabase Configuration
- [ ] Site URL set to production domain
- [ ] Redirect URLs include `https://your-domain.com/auth/callback`
- [ ] All 4 SQL migrations have been run in production
- [ ] Supabase RLS is enabled on all tables (verify in Table Editor)
- [ ] Storage buckets created with correct MIME types and size limits

### Database
- [ ] Verify `handle_new_user()` trigger is active on `auth.users`
- [ ] Verify `set_updated_at()` triggers are on all tables
- [ ] Verify all indexes are present
- [ ] Test RLS: log in as a regular user and confirm you cannot see other orgs' data

---

## Security Checklist

### Authentication
- [ ] Email confirmation is ENABLED (not optional)
- [ ] Password minimum requirements enforced (8 chars, uppercase, number, symbol)
- [ ] JWT expiry is set appropriately (Supabase default: 1 hour access, 7 day refresh)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is NOT exposed to the browser (server-only)
- [ ] Refresh token rotation is enabled in Supabase Auth settings
- [ ] "Leaked password protection" enabled in Supabase Auth

### Cookies & Sessions
- [ ] `@supabase/ssr` is handling httpOnly cookies (not localStorage)
- [ ] HTTPS is enforced in production (cookies require Secure flag)
- [ ] Session persistence is working correctly after page refresh

### API Security (NestJS)
- [ ] `SupabaseAuthGuard` applied to all protected routes
- [ ] `TenantMiddleware` applied globally (except public auth routes)
- [ ] Rate limiting configured (e.g., via NestJS `@nestjs/throttler`)
- [ ] CORS configured to allow only your frontend domain
- [ ] Helmet.js headers applied
- [ ] Request body size limits set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` stored as secret env var, not committed

### RLS Verification
- [ ] Test that User A cannot access User B's organization data
- [ ] Test that a viewer cannot create/update resources
- [ ] Test that org admin cannot access data from other organizations
- [ ] Test that super admin can access all data

---

## Storage Checklist

- [ ] `avatars` bucket is set to **public** (for CDN delivery)
- [ ] `knowledge-base`, `recordings`, `documents` are set to **private**
- [ ] Storage policies verified: users can only access their org's files
- [ ] File size limits are appropriate for your plan
- [ ] MIME type restrictions are in place
- [ ] CDN/Transform URLs configured (if using Supabase Image Transformation)
- [ ] Signed URL expiry is set appropriately (recordings: 1hr, documents: 15min)

---

## Performance Checklist

- [ ] Connection pooling enabled (`?pgbouncer=true` in DATABASE_URL)
- [ ] Prisma using Transaction mode for serverless/edge functions
- [ ] Supabase RLS helper functions are STABLE (cached per transaction)
- [ ] Indexes verified in `pg_indexes` view
- [ ] `analytics` table has partition strategy for large datasets (optional)
- [ ] Supabase compute tier matches expected call volume

---

## Monitoring

- [ ] Supabase Dashboard → Logs configured
- [ ] Error tracking (e.g., Sentry) integrated in Next.js and NestJS
- [ ] `audit_logs` table populated on critical actions
- [ ] Alert thresholds set for DB connections, API latency

---

## Post-Deployment Verification

1. Register a new user → verify email received
2. Click verification link → redirected to dashboard
3. Log in with credentials → session persists on refresh
4. Forgot password → email received → link works → password updated
5. Log out → redirected to /login → protected routes inaccessible
6. API: `GET /auth/me` with valid Bearer token → returns profile
7. API: Unauthorized request → 401 returned
8. API: Cross-tenant request → 403 returned
9. Upload an avatar → displays correctly
10. Upload a knowledge document → accessible only to same org
