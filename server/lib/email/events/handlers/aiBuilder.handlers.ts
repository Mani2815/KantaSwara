import { emailService } from '../../EmailService';
import type { EmailEventBus } from '../EventBus';
import type {
  AgentDraftSavedEvent,
  AgentValidationPassedEvent,
  AgentValidationFailedEvent,
  AgentPublishedEvent,
  DeploymentStartedEvent,
  RollbackCompletedEvent,
} from '../../types';

export function registerAiBuilderHandlers(bus: EmailEventBus): void {
  bus.on('AgentDraftSaved', async (payload: AgentDraftSavedEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.email, name: payload.name },
      subject: `Draft saved: ${payload.agentName}`,
      templateKey: 'builder-draft-saved',
      category: 'AI_BUILDER',
      triggeredByEvent: 'AgentDraftSaved',
      variables: {
        userName: payload.name,
        agentName: payload.agentName,
        projectName: payload.projectName,
        builderUrl: payload.builderUrl,
      },
    });
  });

  bus.on('AgentValidationPassed', async (payload: AgentValidationPassedEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.email, name: payload.name },
      subject: `Validation passed for ${payload.agentName}`,
      templateKey: 'builder-validation-passed',
      category: 'AI_BUILDER',
      triggeredByEvent: 'AgentValidationPassed',
      variables: {
        userName: payload.name,
        agentName: payload.agentName,
        projectName: payload.projectName,
        dashboardUrl: payload.dashboardUrl,
      },
    });
  });

  bus.on('AgentValidationFailed', async (payload: AgentValidationFailedEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.email, name: payload.name },
      subject: `Action required: Validation failed for ${payload.agentName}`,
      templateKey: 'builder-validation-failed',
      category: 'AI_BUILDER',
      priority: 'HIGH',
      triggeredByEvent: 'AgentValidationFailed',
      variables: {
        userName: payload.name,
        agentName: payload.agentName,
        projectName: payload.projectName,
        errors: payload.errors,
        builderUrl: payload.builderUrl,
      },
    });
  });

  bus.on('AgentPublished', async (payload: AgentPublishedEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.email, name: payload.name },
      subject: `Agent published: ${payload.agentName}`,
      templateKey: 'builder-agent-published',
      category: 'AI_BUILDER',
      triggeredByEvent: 'AgentPublished',
      variables: {
        userName: payload.name,
        agentName: payload.agentName,
        projectName: payload.projectName,
        dashboardUrl: payload.dashboardUrl,
      },
    });
  });

  bus.on('DeploymentStarted', async (payload: DeploymentStartedEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.email, name: payload.name },
      subject: `Deployment started for ${payload.agentName}`,
      templateKey: 'builder-deployment-started',
      category: 'AI_BUILDER',
      triggeredByEvent: 'DeploymentStarted',
      variables: {
        userName: payload.name,
        agentName: payload.agentName,
        environment: payload.environment,
        deploymentUrl: payload.deploymentUrl,
      },
    });
  });

  bus.on('RollbackCompleted', async (payload: RollbackCompletedEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.email, name: payload.name },
      subject: `Rollback completed for ${payload.agentName}`,
      templateKey: 'builder-rollback-completed',
      category: 'AI_BUILDER',
      triggeredByEvent: 'RollbackCompleted',
      variables: {
        userName: payload.name,
        agentName: payload.agentName,
        environment: payload.environment,
        version: payload.version,
        dashboardUrl: payload.dashboardUrl,
      },
    });
  });
}
