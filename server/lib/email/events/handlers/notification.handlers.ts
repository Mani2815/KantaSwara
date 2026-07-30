// =============================================================================
// KantaSwara — Notification Email Handlers
// =============================================================================

import { emailService } from '../../EmailService';
import type { EmailEventBus } from '../EventBus';
import type {
  AnnouncementPublishedEvent,
  MaintenanceScheduledEvent,
} from '../../types';

export function registerNotificationHandlers(bus: EmailEventBus): void {
  bus.on('AnnouncementPublished', async (payload: AnnouncementPublishedEvent) => {
    // Send to all recipients
    for (const email of payload.recipientEmails) {
      await emailService.sendTemplate({
        to: email,
        subject: payload.title,
        templateKey: 'notification-announcement',
        category: 'NOTIFICATION',
        priority: 'NORMAL',
        triggeredByEvent: 'AnnouncementPublished',
        variables: {
          title: payload.title,
          body: payload.body,
          ctaUrl: payload.ctaUrl,
          ctaLabel: payload.ctaLabel ?? 'View Details',
        },
      });
    }
  });

  bus.on('MaintenanceScheduled', async (payload: MaintenanceScheduledEvent) => {
    for (const email of payload.recipientEmails) {
      await emailService.sendTemplate({
        to: email,
        subject: `Scheduled Maintenance: ${payload.title}`,
        templateKey: 'notification-maintenance',
        category: 'NOTIFICATION',
        priority: 'HIGH',
        triggeredByEvent: 'MaintenanceScheduled',
        variables: {
          title: payload.title,
          startTime: payload.startTime,
          endTime: payload.endTime,
          affectedServices: payload.affectedServices.join(', '),
        },
      });
    }
  });
}
