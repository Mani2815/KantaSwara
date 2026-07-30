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
  }

  /**
   * Updates an existing log entry with the send result.
   */
  static async updateLog(id: string, params: UpdateLogParams): Promise<void> {
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
}
