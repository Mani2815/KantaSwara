// =============================================================================
// KantaSwara — Email Retry Manager
// =============================================================================

import { prisma } from '@server/lib/prisma';
import { EMAIL_RETRY_DEFAULTS } from './config';

export class RetryManager {
  /**
   * Create a queue entry for an email log.
   */
  static async schedule(emailLogId: string, scheduledAt?: Date): Promise<void> {
    await prisma.emailQueue.create({
      data: {
        emailLogId,
        status: 'QUEUED',
        scheduledAt: scheduledAt ?? new Date(),
        maxRetries: EMAIL_RETRY_DEFAULTS.maxRetries,
        currentRetry: 0,
      },
    });
  }

  /**
   * Calculate when to attempt the next retry using exponential backoff.
   */
  static getNextRetryAt(attempt: number): Date {
    const delays = EMAIL_RETRY_DEFAULTS.backoffMs;
    const delayMs = delays[Math.min(attempt, delays.length - 1)];
    return new Date(Date.now() + delayMs);
  }

  /**
   * Mark a queue entry as failed and schedule next retry if retries remain.
   * Returns true if retry was scheduled, false if max retries exhausted.
   */
  static async handleFailure(
    emailLogId: string,
    errorMessage: string
  ): Promise<boolean> {
    const entry = await prisma.emailQueue.findUnique({
      where: { emailLogId },
    });

    if (!entry) return false;

    const nextRetry = entry.currentRetry + 1;

    if (nextRetry > entry.maxRetries) {
      // Exhausted — mark as permanently failed
      await prisma.emailQueue.update({
        where: { emailLogId },
        data: {
          status: 'FAILED',
          errorMessage,
          processedAt: new Date(),
        },
      });
      return false;
    }

    // Schedule next retry
    await prisma.emailQueue.update({
      where: { emailLogId },
      data: {
        status: 'QUEUED',
        currentRetry: nextRetry,
        nextRetryAt: RetryManager.getNextRetryAt(nextRetry),
        errorMessage,
      },
    });
    return true;
  }

  /**
   * Mark a queue entry as successfully processed.
   */
  static async markDone(emailLogId: string): Promise<void> {
    await prisma.emailQueue.upsert({
      where: { emailLogId },
      create: {
        emailLogId,
        status: 'SENT',
        processedAt: new Date(),
      },
      update: {
        status: 'SENT',
        processedAt: new Date(),
      },
    });
  }

  /**
   * Get queue entries that are ready for retry.
   */
  static async getPendingRetries() {
    return prisma.emailQueue.findMany({
      where: {
        status: 'QUEUED',
        OR: [
          { nextRetryAt: null },
          { nextRetryAt: { lte: new Date() } },
        ],
        currentRetry: { gt: 0 },
      },
      include: { emailLog: true },
      orderBy: { nextRetryAt: 'asc' },
      take: 50,
    });
  }
}
