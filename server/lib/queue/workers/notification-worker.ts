// =============================================================================
// Notification Worker
// =============================================================================
// Processes notification jobs: email delivery, in-app notifications,
// and usage warning alerts.
// =============================================================================

import { createWorker, QUEUE_NAMES } from '../queue';

/**
 * Start the notification worker.
 */
export function startNotificationWorker() {
  const worker = createWorker(
    QUEUE_NAMES.NOTIFICATIONS,
    async (job) => {
      const { type, organizationId, userId, payload } = job.data as {
        type: string;
        organizationId: string;
        userId?: string;
        payload: Record<string, unknown>;
      };

      console.log(
        `[NotificationWorker] Processing "${type}" for org ${organizationId}`
      );

      switch (type) {
        case 'email': {
          const to = payload.to as string;
          const subject = payload.subject as string;
          const body = payload.body as string;

          if (to && subject && body) {
            // Dynamic import to avoid circular deps
            const { EmailService } = await import('@server/lib/email/EmailService');
            const emailService = new EmailService();
            await emailService.sendTemplate({
              to,
              subject,
              templateKey: 'generic',
              variables: { content: body },
            });
            console.log(`[NotificationWorker] Email sent to ${to}`);
          }
          return { type, status: 'sent', to };
        }

        case 'in-app': {
          // In-app notifications — logged for now.
          // Future: create Notification model in Prisma schema.
          const title = (payload.title as string) || 'Notification';
          const message = (payload.message as string) || '';
          console.log(
            `[NotificationWorker] In-app notification for org ${organizationId}: "${title}" — ${message}`
          );
          return { type, status: 'logged', title };
        }

        case 'usage-warning': {
          const usagePercent = (payload.usagePercent as number) || 0;
          const limit = (payload.limit as string) || 'unknown';
          console.warn(
            `[NotificationWorker] Usage warning: Org ${organizationId} at ${usagePercent}% of ${limit} limit`
          );
          // Future: send email + in-app notification
          return { type, status: 'warned', usagePercent, limit };
        }

        default:
          console.warn(`[NotificationWorker] Unknown notification type: ${type}`);
          return { type, status: 'unknown' };
      }
    },
    { concurrency: 5 }
  );

  console.log('[NotificationWorker] Started');
  return worker;
}
