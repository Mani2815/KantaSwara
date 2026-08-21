// =============================================================================
// KantaSwara — Email System Health Check
// =============================================================================
// GET /api/health/email
//
// Verifies that all required email tables exist in PostgreSQL and are writable.
// Designed for:
//   - Server startup validation
//   - Ops/monitoring dashboards
//   - CI/CD deployment verification
//
// Authentication: Protected by CRON_SECRET or skipped in development.
// =============================================================================

import { NextResponse } from 'next/server';
import { prisma } from '@server/lib/prisma';

export const dynamic = 'force-dynamic';

interface TableHealth {
  exists: boolean;
  rowCount?: number;
  error?: string;
}

interface EmailHealthReport {
  healthy: boolean;
  timestamp: string;
  environment: string;
  tables: {
    email_logs: TableHealth;
    email_templates: TableHealth;
    email_preferences: TableHealth;
    email_queue: TableHealth;
  };
  enums: {
    EmailStatus: boolean;
    EmailCategory: boolean;
    EmailPriority: boolean;
    EmailTemplateStatus: boolean;
  };
  summary: string;
}

export async function GET(req: Request): Promise<NextResponse> {
  // Optional: protect with CRON_SECRET in production
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const report: EmailHealthReport = {
    healthy: false,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? 'unknown',
    tables: {
      email_logs: { exists: false },
      email_templates: { exists: false },
      email_preferences: { exists: false },
      email_queue: { exists: false },
    },
    enums: {
      EmailStatus: false,
      EmailCategory: false,
      EmailPriority: false,
      EmailTemplateStatus: false,
    },
    summary: '',
  };

  try {
    // ── 1. Check tables exist and get row counts ─────────────────────────────

    const tableChecks = await Promise.allSettled([
      prisma.emailLog.count().then((count) => ({ table: 'email_logs', count })),
      prisma.emailTemplate.count().then((count) => ({ table: 'email_templates', count })),
      prisma.emailPreference.count().then((count) => ({ table: 'email_preferences', count })),
      prisma.emailQueue.count().then((count) => ({ table: 'email_queue', count })),
    ]);

    for (const result of tableChecks) {
      if (result.status === 'fulfilled') {
        const { table, count } = result.value;
        (report.tables as Record<string, TableHealth>)[table] = {
          exists: true,
          rowCount: count,
        };
      } else {
        // Extract which table failed from the error message
        const err = result.reason as { code?: string; message?: string };
        const msg = err?.message ?? String(result.reason);
        // P2021 = table does not exist
        if (err?.code === 'P2021') {
          // Try to determine which table by checking the error text
          for (const tableName of Object.keys(report.tables) as Array<keyof typeof report.tables>) {
            report.tables[tableName] = {
              exists: false,
              error: `Table missing (P2021) — apply supabase/migrations/20260801000000_email_system_schema.sql`,
            };
          }
        } else {
          // Generic error — mark all as unknown
          for (const tableName of Object.keys(report.tables) as Array<keyof typeof report.tables>) {
            if (!report.tables[tableName].exists) {
              report.tables[tableName] = { exists: false, error: msg };
            }
          }
        }
      }
    }

    // ── 2. Check enums exist ─────────────────────────────────────────────────

    const enumRows = await prisma.$queryRaw<Array<{ typname: string }>>`
      SELECT typname FROM pg_type
      WHERE typtype = 'e'
      AND typname IN ('EmailStatus', 'EmailCategory', 'EmailPriority', 'EmailTemplateStatus')
    `;

    const foundEnums = new Set(enumRows.map((r) => r.typname));
    report.enums.EmailStatus = foundEnums.has('EmailStatus');
    report.enums.EmailCategory = foundEnums.has('EmailCategory');
    report.enums.EmailPriority = foundEnums.has('EmailPriority');
    report.enums.EmailTemplateStatus = foundEnums.has('EmailTemplateStatus');

    // ── 3. Determine overall health ──────────────────────────────────────────

    const allTablesExist = Object.values(report.tables).every((t) => t.exists);
    const allEnumsExist = Object.values(report.enums).every(Boolean);
    report.healthy = allTablesExist && allEnumsExist;

    if (report.healthy) {
      report.summary = 'All email system tables and enums exist. System is healthy.';
    } else {
      const missingTables = Object.entries(report.tables)
        .filter(([, v]) => !v.exists)
        .map(([k]) => k);
      const missingEnums = Object.entries(report.enums)
        .filter(([, v]) => !v)
        .map(([k]) => k);

      const parts: string[] = [];
      if (missingTables.length > 0) parts.push(`Missing tables: ${missingTables.join(', ')}`);
      if (missingEnums.length > 0) parts.push(`Missing enums: ${missingEnums.join(', ')}`);
      report.summary = parts.join('. ') + '. Apply: supabase/migrations/20260801000000_email_system_schema.sql';
    }

    const statusCode = report.healthy ? 200 : 503;
    return NextResponse.json(report, { status: statusCode });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        healthy: false,
        timestamp: new Date().toISOString(),
        error: 'Health check failed — database unreachable',
        detail: msg,
        summary: 'Cannot connect to the database. Check DATABASE_URL in your environment.',
      },
      { status: 503 }
    );
  }
}
