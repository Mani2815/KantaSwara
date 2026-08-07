// =============================================================================
// KantaSwara — Email Logger
// =============================================================================

import { prisma } from '@server/lib/prisma';
import type {
  EmailCategory,
  EmailPriority,
  EmailStatus,
} from '@prisma/client';

interface CreateLogParams {
  recipient: string;
  recipientName?: string;
  subject: string;
  templateKey?: string;
  category?: EmailCategory;
  priority?: EmailPriority;
  organizationId?: string;
  triggeredBy?: string;
  triggeredByEvent?: string;
  variables?: Record<string, unknown>;
}

interface UpdateLogParams {
  status: EmailStatus;
  providerId?: string;
  providerResponse?: Record<string, unknown>;
  errorMessage?: string;
  sentAt?: Date;
  failedAt?: Date;
  retryCount?: number;
}

export class EmailLogger {
  /**
   * Creates an initial QUEUED log entry and returns the log ID.
   */
  static async createLog(params: CreateLogParams): Promise<string> {
    try {
      const log = await prisma.emailLog.create({
        data: {
          recipient: params.recipient,
          recipientName: params.recipientName,
          subject: params.subject,
          templateKey: params.templateKey,
          category: params.category ?? 'NOTIFICATION',
          priority: params.priority ?? 'NORMAL',
          organizationId: params.organizationId,
          triggeredBy: params.triggeredBy ?? 'system',
          triggeredByEvent: params.triggeredByEvent,
          variables: params.variables
            ? JSON.parse(JSON.stringify(params.variables))
            : {},
          status: 'QUEUED',
        },
      });
      return log.id;
    } catch (error) {
      return EmailLogger._handleLogError('createLog', error, params.recipient);
    }
  }

  /**
   * Updates an existing log entry with the send result.
   */
  static async updateLog(id: string, params: UpdateLogParams): Promise<void> {
    if (id.startsWith('fallback-log-')) return;
    try {
      await prisma.emailLog.update({
        where: { id },
        data: {
          status: params.status,
          providerId: params.providerId,
          providerResponse: params.providerResponse
            ? JSON.parse(JSON.stringify(params.providerResponse))
            : undefined,
          errorMessage: params.errorMessage,
          sentAt: params.sentAt,
          failedAt: params.failedAt,
          retryCount: params.retryCount,
        },
      });
    } catch (error) {
      EmailLogger._handleLogError('updateLog', error, id);
    }
  }

  /**
   * Mark as SENT.
   */
  static async markSent(
    id: string,
    providerId?: string,
    providerResponse?: Record<string, unknown>
  ): Promise<void> {
    await EmailLogger.updateLog(id, {
      status: 'SENT',
      providerId,
      providerResponse,
      sentAt: new Date(),
    });
  }

  /**
   * Mark as FAILED.
   */
  static async markFailed(
    id: string,
    errorMessage: string,
    retryCount?: number
  ): Promise<void> {
    await EmailLogger.updateLog(id, {
      status: 'FAILED',
      errorMessage,
      failedAt: new Date(),
      retryCount,
    });
  }

  /**
   * Mark as SKIPPED (user opted out).
   */
  static async markSkipped(id: string, reason: string): Promise<void> {
    await EmailLogger.updateLog(id, {
      status: 'SKIPPED',
      errorMessage: reason,
    });
  }

  /**
   * Retrieve paginated logs with optional filters.
   */
  static async getLogs(params: {
    organizationId?: string;
    status?: EmailStatus;
    templateKey?: string;
    recipient?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where = {
      ...(params.organizationId && { organizationId: params.organizationId }),
      ...(params.status && { status: params.status }),
      ...(params.templateKey && { templateKey: params.templateKey }),
      ...(params.recipient && {
        recipient: { contains: params.recipient, mode: 'insensitive' as const },
      }),
    };

    const [logs, total] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.emailLog.count({ where }),
    ]);

    return { logs, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  // ─── Internal error handler ─────────────────────────────────────────────────

  /**
   * Centralised Prisma error handler for all email logging operations.
   *
   * Code mapping:
   *   P2021 — Table does not exist (schema drift — migration not applied)
   *   P1001 — Cannot reach DB server (transient connection failure)
   *   P1002 — DB server timed out (transient)
   *   P2025 — Record not found (acceptable on fallback IDs)
   *   other — Unexpected error
   *
   * Always returns a fallback ID so the email pipeline does not crash.
   */
  private static _handleLogError(
    operation: string,
    error: unknown,
    context: string
  ): string {
    const err = error as { code?: string; message?: string };
    const code = err?.code;
    const message = err?.message ?? String(error);

    if (code === 'P2021') {
      console.error(
        `[EmailLogger] ❌ SCHEMA DRIFT — ${operation} (context: ${context})\n` +
        `  The email_logs table does not exist in PostgreSQL.\n` +
        `  ► Apply the migration:\n` +
        `      npx prisma db execute --file supabase/migrations/20260801000000_email_system_schema.sql\n` +
        `  Raw: ${message}`
      );
    } else if (code === 'P1001' || code === 'P1002') {
      console.error(
        `[EmailLogger] ⚠ DB CONNECTION ERROR — ${operation} (context: ${context})\n` +
        `  Prisma ${code}: Cannot reach the database server.\n` +
        `  This is a transient error. Email was NOT logged. Delivery may still have occurred.\n` +
        `  Raw: ${message}`
      );
    } else if (code === 'P2025') {
      // Expected when updating a fallback-log- ID that never existed in DB
      console.warn(
        `[EmailLogger] ⚠ Record not found — ${operation} (context: ${context}). ` +
        `This is expected for fallback log IDs.`
      );
    } else {
      console.error(
        `[EmailLogger] ✖ Unexpected DB error — ${operation} (context: ${context})\n` +
        `  Code: ${code ?? 'unknown'}  Message: ${message}\n` +
        `  Email was NOT logged. Delivery may still have succeeded.`
      );
    }

    return `fallback-log-${Date.now()}`;
  }
}
