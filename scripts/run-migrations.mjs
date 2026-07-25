/**
 * run-migrations.mjs
 * Runs all Supabase migrations and seeds the org_admin profile.
 * Uses the Supabase Management API.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// ── Load env ────────────────────────────────────────────────────────────────
import { existsSync } from 'fs';
const envPath = resolve(process.cwd(), '.env.local');
if (!existsSync(envPath)) {
  console.error('❌ Error: .env.local file is missing.');
  console.error('👉 Please copy .env.local.example to .env.local and fill in your actual values.');
  process.exit(1);
}

const envFile = readFileSync(envPath, 'utf-8');
const env = Object.fromEntries(
  envFile
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => {
      const [k, ...rest] = l.split('=');
      return [k.trim(), rest.join('=').trim()];
    })
);

const PROJECT_REF = env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)\./)?.[1];
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const TARGET_EMAIL = env.ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'admin@kantaswara.local';

if (!PROJECT_REF || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

console.log('🔗 Project ref:', PROJECT_REF);

// ── Execute SQL via Management API ───────────────────────────────────────────
async function execSQL(sql, label) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    }
  );

  const text = await res.text();

  if (!res.ok) {
    // Try alternative endpoint
    return null;
  }

  console.log(`✅ ${label}`);
  return text;
}

// ── Execute SQL via direct REST (PostgREST rpc fallback) ─────────────────────
async function execSQLDirect(sql, label) {
  const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql }),
  });

  if (!res.ok) return null;
  console.log(`✅ ${label}`);
  return await res.text();
}

async function runSQL(sql, label) {
  let result = await execSQL(sql, label);
  if (result !== null) return result;
  result = await execSQLDirect(sql, label);
  if (result !== null) return result;
  return null;
}

// ── Read migration files ─────────────────────────────────────────────────────
const MIGRATIONS = [
  { file: 'supabase/migrations/001_initial_schema.sql', label: 'Migration 001: Initial schema' },
  { file: 'supabase/migrations/002_rls_policies.sql',   label: 'Migration 002: RLS policies' },
  { file: 'supabase/migrations/003_profile_trigger.sql',label: 'Migration 003: Profile trigger' },
  { file: 'supabase/migrations/004_storage_buckets.sql',label: 'Migration 004: Storage buckets' },
  { file: 'supabase/migrations/005_set_super_admin.sql',label: 'Migration 005: Set super admin' },
  { file: 'supabase/migrations/006_billing_schema.sql', label: 'Migration 006: Billing schema' },
  { file: 'supabase/migrations/007_fix_superadmin_trigger.sql', label: 'Migration 007: Fix super admin trigger' },
  { file: 'supabase/migrations/008_update_trigger_b2b.sql', label: 'Migration 008: Update trigger for B2B status' },
  { file: 'supabase/migrations/010_update_trigger_business_profile.sql', label: 'Migration 010: Update trigger with business profile' },
  { file: 'supabase/migrations/011_billing_plans_schema_alignment.sql', label: 'Migration 011: Align billing plans schema' },
  { file: 'supabase/migrations/012_employee_schema.sql', label: 'Migration 012: Employee console schema' },
  { file: 'supabase/migrations/20260720000000_super_admin_schema.sql', label: 'Migration 20260720_00: Super admin platform schema' },
  { file: 'supabase/migrations/20260721000000_ai_agent_builder.sql', label: 'Migration 20260721_00: AI agent builder schema' },
  { file: 'supabase/migrations/20260724000000_custom_jwt_claims.sql', label: 'Migration 20260724_00: Custom JWT claims hook' },
  { file: 'supabase/migrations/20260724000001_rls_policies.sql', label: 'Migration 20260724_01: RLS policies enablement' },
  { file: 'supabase/migrations/20260724000002_billing_enhancement.sql', label: 'Migration 20260724_02: Billing enhancement & sequences' },
  { file: 'supabase/migrations/013_sync_prisma_schema.sql',              label: 'Migration 013: Full Prisma schema sync (fixes has_sla drift)' },
];

async function main() {
  console.log('\n📦 Running migrations...\n');

  for (const { file, label } of MIGRATIONS) {
    const sql = readFileSync(resolve(process.cwd(), file), 'utf-8');
    const result = await runSQL(sql, label);
    if (result === null) {
      console.log(`⚠️  ${label} — Management API not available (auth issue).`);
      console.log('   The Management API requires a personal access token, not the service role key.');
      console.log('\n   → Get your token at: https://supabase.com/dashboard/account/tokens');
      console.log('   → Then set SUPABASE_ACCESS_TOKEN=<token> in .env.local and re-run.\n');
      await seedViaAdminClient();
      return;
    }
  }

  await seedViaAdminClient();
}

// ── Seed admin via Supabase JS ───────────────────────────────────────────────
async function seedViaAdminClient() {
  const { createClient } = await import('@supabase/supabase-js');

  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  console.log('\n🌱 Seeding org_admin...');

  // Get all auth users
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) { console.error('❌ Auth list failed:', listErr.message); return; }

  const authUser = users.find(u => u.email === TARGET_EMAIL);
  if (!authUser) {
    console.log(`❌ No auth user found for ${TARGET_EMAIL}`);
    console.log('   → Register first at http://localhost:3000/register');
    return;
  }
  console.log('✅ Auth user found:', authUser.id);

  // Check tables exist
  const { error: tableCheck } = await supabase.from('profiles').select('id').limit(1);
  if (tableCheck?.message?.includes('does not exist') || tableCheck?.message?.includes('schema cache')) {
    console.log('\n❌ Tables do not exist yet. You need to run the migrations manually.');
    console.log('\nPlease run these SQL files in Supabase → SQL Editor:');
    for (const { file } of MIGRATIONS) {
      console.log(`   → ${file}`);
    }
    return;
  }

  // Upsert org
  const { data: org, error: orgErr } = await supabase
    .from('organizations')
    .upsert({ name: 'KantaSwara HQ', slug: 'kantaswara-hq', is_active: true }, { onConflict: 'slug' })
    .select('id')
    .single();

  if (orgErr) { console.error('❌ Org upsert failed:', orgErr.message); return; }
  console.log('✅ Organization ready:', org.id);

  // Upsert profile
  const { error: profileErr } = await supabase
    .from('profiles')
    .upsert({
      id: authUser.id,
      organization_id: org.id,
      full_name: authUser.user_metadata?.full_name ?? 'Maniarasan',
      email: TARGET_EMAIL,
      role: 'super_admin',
    }, { onConflict: 'id' });

  if (profileErr) { console.error('❌ Profile upsert failed:', profileErr.message); return; }
  console.log('✅ Profile set to org_admin');
  console.log('\n🎉 Done! Open: http://localhost:3000/superadmin/dashboard\n');
}

main().catch(err => { console.error(err); process.exit(1); });
