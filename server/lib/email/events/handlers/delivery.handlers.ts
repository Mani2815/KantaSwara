// =============================================================================
// KantaSwara — Delivery Console Email Handlers
// =============================================================================

import { emailService } from '../../EmailService';
import type { EmailEventBus } from '../EventBus';
import type {
  ProjectAssignedEvent,
  DeploymentCompletedEvent,
  DeploymentFailedEvent,
  QAApprovedEvent,
} from '../../types';

export function registerDeliveryHandlers(bus: EmailEventBus): void {
  bus.on('ProjectAssigned', async (payload: ProjectAssignedEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.assigneeEmail, name: payload.assigneeName },
      subject: `New project assigned: ${payload.projectName}`,
      templateKey: 'delivery-project-assigned',
      category: 'DELIVERY',
      priority: 'HIGH',
      triggeredByEvent: 'ProjectAssigned',
      variables: {
        userName: payload.assigneeName,
        projectName: payload.projectName,
        organizationName: payload.organizationName,
        priority: payload.priority,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/delivery-console`,
      },
    });
  });

  bus.on('DeploymentCompleted', async (payload: DeploymentCompletedEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.adminEmail, name: payload.adminName },
      subject: `🚀 ${payload.agentName} is live on ${payload.environment}`,
      templateKey: 'delivery-deployment-successful',
      category: 'DELIVERY',
      priority: 'HIGH',
      organizationId: payload.organizationId,
      triggeredByEvent: 'DeploymentCompleted',
      variables: {
        userName: payload.adminName,
        organizationName: payload.organizationName,
        agentName: payload.agentName,
        deploymentEnv: payload.environment,
        version: payload.version,
        dashboardUrl: payload.dashboardUrl,
      },
    });
  });

  bus.on('DeploymentFailed', async (payload: DeploymentFailedEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.adminEmail, name: payload.adminName },
      subject: `⚠️ Deployment failed for ${payload.agentName}`,
      templateKey: 'delivery-deployment-failed',
      category: 'DELIVERY',
      priority: 'CRITICAL',
      organizationId: payload.organizationId,
      triggeredByEvent: 'DeploymentFailed',
      variables: {
        userName: payload.adminName,
        organizationName: payload.organizationName,
        agentName: payload.agentName,
        deploymentEnv: payload.environment,
        errorMessage: payload.errorMessage,
        supportEmail: process.env.RESEND_REPLY_TO ?? 'support@kantaswara.com',
      },
    });
  });

  bus.on('QAApproved', async (payload: QAApprovedEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.adminEmail, name: payload.adminName },
      subject: `✅ QA approved for ${payload.agentName}`,
      templateKey: 'delivery-qa-approved',
      category: 'DELIVERY',
      priority: 'NORMAL',
      organizationId: payload.organizationId,
      triggeredByEvent: 'QAApproved',
      variables: {
        userName: payload.adminName,
        organizationName: payload.organizationName,
        agentName: payload.agentName,
        reviewerName: payload.reviewerName,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/delivery-console`,
      },
    });
  });
}
