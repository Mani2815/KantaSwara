// =============================================================================
// KantaSwara — Organization Email Handlers
// =============================================================================

import { emailService } from '../../EmailService';
import type { EmailEventBus } from '../EventBus';
import type {
  OrganizationRegisteredEvent,
  OrganizationApprovedEvent,
  OrganizationRejectedEvent,
  OrganizationSuspendedEvent,
} from '../../types';

export function registerOrganizationHandlers(bus: EmailEventBus): void {
  bus.on('OrganizationRegistered', async (payload: OrganizationRegisteredEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.adminEmail, name: payload.adminName },
      subject: 'Your KantaSwara registration is under review',
      templateKey: 'org-registration-submitted',
      category: 'ORGANIZATION',
      priority: 'HIGH',
      organizationId: payload.organizationId,
      bypassPreferences: true,
      triggeredByEvent: 'OrganizationRegistered',
      variables: {
        userName: payload.adminName,
        organizationName: payload.organizationName,
        supportEmail: process.env.RESEND_REPLY_TO ?? 'support@kantaswara.com',
      },
    });
  });

  bus.on('OrganizationApproved', async (payload: OrganizationApprovedEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.adminEmail, name: payload.adminName },
      subject: `🎉 ${payload.organizationName} is approved — Welcome to KantaSwara!`,
      templateKey: 'org-approved',
      category: 'ORGANIZATION',
      priority: 'HIGH',
      organizationId: payload.organizationId,
      bypassPreferences: true,
      triggeredByEvent: 'OrganizationApproved',
      variables: {
        userName: payload.adminName,
        organizationName: payload.organizationName,
        dashboardUrl: payload.dashboardUrl,
      },
    });
  });

  bus.on('OrganizationRejected', async (payload: OrganizationRejectedEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.adminEmail, name: payload.adminName },
      subject: 'Update on your KantaSwara application',
      templateKey: 'org-rejected',
      category: 'ORGANIZATION',
      priority: 'HIGH',
      organizationId: payload.organizationId,
      bypassPreferences: true,
      triggeredByEvent: 'OrganizationRejected',
      variables: {
        userName: payload.adminName,
        organizationName: payload.organizationName,
        reason: payload.reason,
        supportEmail: process.env.RESEND_REPLY_TO ?? 'support@kantaswara.com',
      },
    });
  });

  bus.on('OrganizationSuspended', async (payload: OrganizationSuspendedEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.adminEmail, name: payload.adminName },
      subject: 'Your KantaSwara organization has been suspended',
      templateKey: 'org-suspended',
      category: 'ORGANIZATION',
      priority: 'CRITICAL',
      organizationId: payload.organizationId,
      bypassPreferences: true,
      triggeredByEvent: 'OrganizationSuspended',
      variables: {
        userName: payload.adminName,
        organizationName: payload.organizationName,
        reason: payload.reason,
        supportEmail: process.env.RESEND_REPLY_TO ?? 'support@kantaswara.com',
      },
    });
  });
}
