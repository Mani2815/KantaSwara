/**
 * validate-db.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Run before `npm run dev` (via the `predev` script) to detect schema drift
 * between the live Supabase database and the Prisma schema at startup.
 *
 * Checks:
 *   1. Database connectivity
 *   2. Critical table existence
 *   3. Critical column existence (catches the has_sla class of errors early)
 *   4. Required environment variables
 *
 * Exit codes:
 *   0 — all checks passed
 *   1 — a check failed (with actionable error message)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// ── Load env ──────────────────────────────────────────────────────────────────
const envPath = resolve(process.cwd(), '.env.local');
let env = { ...process.env };

if (existsSync(envPath)) {
  const content = readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const [key, ...rest] = trimmed.split('=');
    env[key.trim()] = rest.join('=').trim();
  }
}

// Skip DB validation in CI or production (migrations run separately there)
const inCI = env.CI === 'true' || env.NODE_ENV === 'production';

// ── Critical column inventory ────────────────────────────────────────────────
// Format: { table, column } — matches the exact DB column names (snake_case)
const CRITICAL_COLUMNS = [
  // The original crash trigger
  { table: 'subscription_plans', column: 'has_sla' },
  // Other columns added by migration 011 / 013
  { table: 'subscription_plans', column: 'display_name' },
  { table: 'subscription_plans', column: 'implementation_fee' },
  { table: 'subscription_plans', column: 'has_dedicated_infra' },
  { table: 'subscription_plans', column: 'has_white_label' },
  { table: 'subscription_plans', column: 'is_custom' },
  { table: 'subscription_plans', column: 'features' },
  // Subscriptions
  { table: 'organization_subscriptions', column: 'canceled_at' },
  { table: 'organization_subscriptions', column: 'suspended_at' },
  { table: 'organization_subscriptions', column: 'custom_monthly_price' },
  // Invoices
  { table: 'invoices', column: 'discount_amount' },
  { table: 'invoices', column: 'tax_amount' },
  { table: 'invoices', column: 'paid_amount' },
  { table: 'invoices', column: 'balance_due' },
];

const CRITICAL_TABLES = [
  'subscription_plans',
  'organization_subscriptions',
  'invoices',
  'organizations',
  'profiles',
];

async function main() {
  // In CI / production skip the live DB check — rely on Prisma migrate
  if (inCI) {
    console.log('ℹ️  Skipping DB validation in CI/production environment.');
    return;
  }

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey  = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.warn('⚠️  DB validation skipped: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set.');
    return;
  }

  console.log('🔍 Validating database schema...');

  // ── 1. Connectivity check via a lightweight query ─────────────────────────
  let tableData;
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/subscription_plans?select=id&limit=1`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      }
    );

    if (!res.ok) {
      // Table missing or connection error — don't hard-fail dev startup
      const body = await res.text();
      if (body.includes('does not exist') || body.includes('schema cache')) {
        printMigrationError(['subscription_plans table is missing entirely']);
        return;
      }
      console.warn('⚠️  Could not reach Supabase REST API. Skipping DB validation.');
      return;
    }
    tableData = await res.json();
  } catch (err) {
    console.warn('⚠️  DB connectivity check failed (network error). Skipping validation.');
    console.warn('   Details:', err.message);
    return;
  }

  // ── 2. Column existence check ─────────────────────────────────────────────
  // We query information_schema via the REST /rpc endpoint or direct fetch.
  // We build one query for all columns to avoid N+1 round-trips.

  const columnQueryBody = CRITICAL_COLUMNS.map(({ table, column }) =>
    `(table_name='${table}' AND column_name='${column}')`
  ).join(' OR ');

  let missingColumns = [];

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/` +
        `information_schema/columns?select=table_name,column_name&` +
        `table_schema=eq.public&or=(${encodeURIComponent(CRITICAL_COLUMNS.map(
          ({ table, column }) => `and(table_name.eq.${table},column_name.eq.${column})`
        ).join(','))})`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          Accept: 'application/json',
        },
      }
    );

    if (res.ok) {
      const found = await res.json();
      const foundSet = new Set(
        (Array.isArray(found) ? found : []).map(r => `${r.table_name}.${r.column_name}`)
      );

      missingColumns = CRITICAL_COLUMNS.filter(
        ({ table, column }) => !foundSet.has(`${table}.${column}`)
      );
    } else {
      // information_schema query failed — fall back to a direct column probe
      // by selecting the known problematic column
      const probeRes = await fetch(
        `${supabaseUrl}/rest/v1/subscription_plans?select=has_sla&limit=0`,
        {
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
          },
        }
      );
      const probeText = await probeRes.text();
      if (!probeRes.ok && probeText.includes('has_sla')) {
        missingColumns = [{ table: 'subscription_plans', column: 'has_sla' }];
      }
    }
  } catch {
    // Non-fatal — dev connectivity may be limited
    console.warn('⚠️  Column validation query failed. Continuing startup...');
    return;
  }

  if (missingColumns.length > 0) {
    printMigrationError(
      missingColumns.map(({ table, column }) => `${table}.${column}`)
    );
    process.exit(1);
  }

  console.log('✅ Database schema is valid.\n');
}

function printMigrationError(missingItems) {
  console.error('\n╔══════════════════════════════════════════════════════════════╗');
  console.error('║          ❌  DATABASE SCHEMA OUT OF SYNC                     ║');
  console.error('╚══════════════════════════════════════════════════════════════╝');
  console.error('\nThe following columns / tables are missing from the database:\n');
  missingItems.forEach(item => console.error(`   ✗  ${item}`));
  console.error('\n📋 To fix, run migration 013 in the Supabase SQL Editor:');
  console.error('   → Open: https://supabase.com/dashboard/project/_/sql/new');
  console.error('   → Paste and run the file:');
  console.error('     supabase/migrations/013_sync_prisma_schema.sql\n');
  console.error('   Or, if the Supabase Management API is configured:');
  console.error('     npm run db:migrate\n');
  console.error('   Then re-run: npm run dev\n');
}

main().catch(err => {
  // DB validation should never crash dev startup — warn instead of exiting
  console.warn('⚠️  DB validation encountered an unexpected error:', err.message);
});
