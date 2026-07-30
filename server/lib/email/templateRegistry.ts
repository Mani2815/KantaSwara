// =============================================================================
// KantaSwara — Template Registry
// =============================================================================
// Maps templateKey strings to React components and metadata.
// Add new templates here after creating the component.

import type { EmailCategory } from '@prisma/client';
import type { ComponentType } from 'react';

export interface TemplateRegistryEntry {
  key: string;
  name: string;
  description: string;
  category: EmailCategory;
  subject: string; // Supports {{variables}}
  isMandatory: boolean; // Cannot be disabled by user preferences
  component: () => Promise<{ default: ComponentType<Record<string, unknown>> }>;
}

// Template registry — lazy imports to avoid loading all React components at startup
export const TEMPLATE_REGISTRY: Record<string, TemplateRegistryEntry> = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  'auth-welcome': {
    key: 'auth-welcome',
    name: 'Welcome Email',
    description: 'Sent when a new user registers',
    category: 'AUTH',
    subject: 'Welcome to KantaSwara, {{userName}}!',
    isMandatory: true,
    component: () =>
      import('@/components/emails/auth/WelcomeEmail') as Promise<{
        default: ComponentType<Record<string, unknown>>;
      }>,
  },
  'auth-verify-email': {
    key: 'auth-verify-email',
    name: 'Verify Email',
    description: 'Email verification link',
    category: 'AUTH',
    subject: 'Verify your email address',
    isMandatory: true,
    component: () =>
      import('@/components/emails/auth/VerifyEmailEmail') as Promise<{
        default: ComponentType<Record<string, unknown>>;
      }>,
  },
  'auth-password-reset': {
    key: 'auth-password-reset',
    name: 'Password Reset',
    description: 'Password reset link',
    category: 'AUTH',
    subject: 'Reset your KantaSwara password',
    isMandatory: true,
    component: () =>
      import('@/components/emails/auth/PasswordResetEmail') as Promise<{
        default: ComponentType<Record<string, unknown>>;
      }>,
  },
  'auth-password-changed': {
    key: 'auth-password-changed',
    name: 'Password Changed',
    description: 'Confirms password was changed',
    category: 'AUTH',
    subject: 'Your password was changed',
    isMandatory: true,
    component: () =>
      import('@/components/emails/auth/PasswordChangedEmail') as Promise<{
        default: ComponentType<Record<string, unknown>>;
      }>,
  },
  'auth-login-alert': {
    key: 'auth-login-alert',
    name: 'Login Alert',
    description: 'Alert on new device/location login',
    category: 'AUTH',
    subject: 'New sign-in to your KantaSwara account',
    isMandatory: true,
    component: () =>
      import('@/components/emails/auth/LoginAlertEmail') as Promise<{
        default: ComponentType<Record<string, unknown>>;
      }>,
  },
  'auth-account-locked': {
    key: 'auth-account-locked',
    name: 'Account Locked',
    description: 'Account locked notification',
    category: 'AUTH',
    subject: 'Your KantaSwara account has been locked',
    isMandatory: true,
    component: () =>
      import('@/components/emails/auth/AccountLockedEmail') as Promise<{
        default: ComponentType<Record<string, unknown>>;
      }>,
  },

  // ── Organization ──────────────────────────────────────────────────────────
  'org-registration-submitted': {
    key: 'org-registration-submitted',
    name: 'Organization Registration Submitted',
    description: 'Confirms registration is under review',
    category: 'ORGANIZATION',
    subject: 'Your KantaSwara registration is under review',
    isMandatory: true,
    component: () =>
      import(
        '@/components/emails/organization/OrgRegistrationSubmittedEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },
  'org-approved': {
    key: 'org-approved',
    name: 'Organization Approved',
    description: 'Notifies the org admin of approval',
    category: 'ORGANIZATION',
    subject: '🎉 {{organizationName}} is approved — Welcome to KantaSwara!',
    isMandatory: true,
    component: () =>
      import(
        '@/components/emails/organization/OrgApprovedEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },
  'org-rejected': {
    key: 'org-rejected',
    name: 'Organization Rejected',
    description: 'Notifies the org admin of rejection',
    category: 'ORGANIZATION',
    subject: 'Update on your KantaSwara application',
    isMandatory: true,
    component: () =>
      import(
        '@/components/emails/organization/OrgRejectedEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },
  'org-suspended': {
    key: 'org-suspended',
    name: 'Organization Suspended',
    description: 'Notifies org admin of suspension',
    category: 'ORGANIZATION',
    subject: 'Your KantaSwara organization has been suspended',
    isMandatory: true,
    component: () =>
      import(
        '@/components/emails/organization/OrgSuspendedEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },

  // ── Employee ──────────────────────────────────────────────────────────────
  'employee-invitation': {
    key: 'employee-invitation',
    name: 'Employee Invitation',
    description: 'Invites a new internal employee',
    category: 'EMPLOYEE',
    subject: "You're invited to join KantaSwara",
    isMandatory: true,
    component: () =>
      import(
        '@/components/emails/employee/EmployeeInvitationEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },
  'employee-activated': {
    key: 'employee-activated',
    name: 'Employee Activated',
    description: 'Notifies employee their account is active',
    category: 'EMPLOYEE',
    subject: 'Your KantaSwara employee account is active',
    isMandatory: true,
    component: () =>
      import(
        '@/components/emails/employee/EmployeeActivatedEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },
  'employee-password-reset': {
    key: 'employee-password-reset',
    name: 'Employee Password Reset',
    description: 'Password reset link for employees',
    category: 'EMPLOYEE',
    subject: 'Reset your internal employee password',
    isMandatory: true,
    component: () =>
      import(
        '@/components/emails/employee/EmployeePasswordResetEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },
  'employee-role-changed': {
    key: 'employee-role-changed',
    name: 'Employee Role Changed',
    description: 'Notifies employee of a role change',
    category: 'EMPLOYEE',
    subject: 'Your employee role has been updated',
    isMandatory: true,
    component: () =>
      import(
        '@/components/emails/employee/EmployeeRoleChangedEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },

  // ── Billing ───────────────────────────────────────────────────────────────
  'billing-subscription-created': {
    key: 'billing-subscription-created',
    name: 'Subscription Created',
    description: 'Confirms a new subscription',
    category: 'BILLING',
    subject: 'Your KantaSwara {{planName}} subscription is active',
    isMandatory: false,
    component: () =>
      import(
        '@/components/emails/billing/SubscriptionCreatedEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },
  'billing-invoice-generated': {
    key: 'billing-invoice-generated',
    name: 'Invoice Generated',
    description: 'Notifies about new invoice',
    category: 'BILLING',
    subject: 'Invoice {{invoiceNumber}} from KantaSwara',
    isMandatory: false,
    component: () =>
      import(
        '@/components/emails/billing/InvoiceGeneratedEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },
  'billing-payment-successful': {
    key: 'billing-payment-successful',
    name: 'Payment Successful',
    description: 'Confirms successful payment',
    category: 'BILLING',
    subject: 'Payment confirmed for Invoice {{invoiceNumber}}',
    isMandatory: false,
    component: () =>
      import(
        '@/components/emails/billing/PaymentSuccessfulEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },
  'billing-payment-failed': {
    key: 'billing-payment-failed',
    name: 'Payment Failed',
    description: 'Notifies about failed payment',
    category: 'BILLING',
    subject: 'Action required: Payment failed for Invoice {{invoiceNumber}}',
    isMandatory: true,
    component: () =>
      import(
        '@/components/emails/billing/PaymentFailedEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },
  'billing-subscription-expiring': {
    key: 'billing-subscription-expiring',
    name: 'Subscription Expiring',
    description: 'Notifies of upcoming subscription end',
    category: 'BILLING',
    subject: 'Your KantaSwara subscription expires soon',
    isMandatory: false,
    component: () =>
      import(
        '@/components/emails/billing/SubscriptionExpiringEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },
  'billing-trial-ending': {
    key: 'billing-trial-ending',
    name: 'Trial Ending',
    description: 'Notifies of trial period ending',
    category: 'BILLING',
    subject: 'Your KantaSwara trial ends in {{daysRemaining}} days',
    isMandatory: false,
    component: () =>
      import(
        '@/components/emails/billing/TrialEndingEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },

  // ── Delivery ──────────────────────────────────────────────────────────────
  'delivery-project-assigned': {
    key: 'delivery-project-assigned',
    name: 'Project Assigned',
    description: 'Notifies AI engineer of new project',
    category: 'DELIVERY',
    subject: 'New project assigned: {{projectName}}',
    isMandatory: false,
    component: () =>
      import(
        '@/components/emails/delivery/ProjectAssignedEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },
  'delivery-deployment-successful': {
    key: 'delivery-deployment-successful',
    name: 'Deployment Successful',
    description: 'Notifies client of successful deployment',
    category: 'DELIVERY',
    subject: '🚀 {{agentName}} is live on {{deploymentEnv}}',
    isMandatory: false,
    component: () =>
      import(
        '@/components/emails/delivery/DeploymentSuccessfulEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },
  'delivery-deployment-failed': {
    key: 'delivery-deployment-failed',
    name: 'Deployment Failed',
    description: 'Notifies of failed deployment',
    category: 'DELIVERY',
    subject: '⚠️ Deployment failed for {{agentName}}',
    isMandatory: false,
    component: () =>
      import(
        '@/components/emails/delivery/DeploymentFailedEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },
  'delivery-qa-approved': {
    key: 'delivery-qa-approved',
    name: 'QA Approved',
    description: 'Notifies of QA approval',
    category: 'DELIVERY',
    subject: '✅ QA approved for {{agentName}}',
    isMandatory: false,
    component: () =>
      import(
        '@/components/emails/delivery/QAApprovedEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },

  // ── AI Builder ────────────────────────────────────────────────────────────
  'builder-draft-saved': {
    key: 'builder-draft-saved',
    name: 'Draft Saved',
    description: 'Notifies user that their draft is saved',
    category: 'AI_BUILDER' as EmailCategory,
    subject: 'Draft saved: {{agentName}}',
    isMandatory: false,
    component: () =>
      import(
        '@/components/emails/builder/DraftSavedEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },
  'builder-validation-passed': {
    key: 'builder-validation-passed',
    name: 'Validation Passed',
    description: 'Agent validation checks passed',
    category: 'AI_BUILDER' as EmailCategory,
    subject: 'Validation passed for {{agentName}}',
    isMandatory: false,
    component: () =>
      import(
        '@/components/emails/builder/ValidationPassedEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },
  'builder-validation-failed': {
    key: 'builder-validation-failed',
    name: 'Validation Failed',
    description: 'Agent validation checks failed',
    category: 'AI_BUILDER' as EmailCategory,
    subject: 'Action required: Validation failed for {{agentName}}',
    isMandatory: true,
    component: () =>
      import(
        '@/components/emails/builder/ValidationFailedEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },
  'builder-agent-published': {
    key: 'builder-agent-published',
    name: 'Agent Published',
    description: 'Agent published successfully',
    category: 'AI_BUILDER' as EmailCategory,
    subject: 'Agent published: {{agentName}}',
    isMandatory: false,
    component: () =>
      import(
        '@/components/emails/builder/AgentPublishedEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },
  'builder-deployment-started': {
    key: 'builder-deployment-started',
    name: 'Deployment Started',
    description: 'Agent deployment started',
    category: 'AI_BUILDER' as EmailCategory,
    subject: 'Deployment started for {{agentName}}',
    isMandatory: false,
    component: () =>
      import(
        '@/components/emails/builder/DeploymentStartedEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },
  'builder-rollback-completed': {
    key: 'builder-rollback-completed',
    name: 'Rollback Completed',
    description: 'Agent rollback completed',
    category: 'AI_BUILDER' as EmailCategory,
    subject: 'Rollback completed for {{agentName}}',
    isMandatory: false,
    component: () =>
      import(
        '@/components/emails/builder/RollbackCompletedEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },

  // ── Security ──────────────────────────────────────────────────────────────
  'security-suspicious-login': {
    key: 'security-suspicious-login',
    name: 'Suspicious Login Detected',
    description: 'Alerts user of suspicious login',
    category: 'SECURITY',
    subject: '⚠️ Suspicious sign-in detected on your account',
    isMandatory: true,
    component: () =>
      import(
        '@/components/emails/security/SuspiciousLoginEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },
  'security-api-key-created': {
    key: 'security-api-key-created',
    name: 'API Key Created',
    description: 'Confirms new API key creation',
    category: 'SECURITY',
    subject: 'New API key created: {{keyName}}',
    isMandatory: true,
    component: () =>
      import(
        '@/components/emails/security/APIKeyCreatedEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },
  'security-api-key-revoked': {
    key: 'security-api-key-revoked',
    name: 'API Key Revoked',
    description: 'Confirms API key revocation',
    category: 'SECURITY',
    subject: 'API Key revoked: {{keyName}}',
    isMandatory: true,
    component: () =>
      import(
        '@/components/emails/security/APIKeyRevokedEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },
  'security-mfa-enabled': {
    key: 'security-mfa-enabled',
    name: 'MFA Enabled',
    description: 'Confirms MFA was enabled',
    category: 'SECURITY',
    subject: 'Multi-Factor Authentication enabled',
    isMandatory: true,
    component: () =>
      import(
        '@/components/emails/security/MFAEnabledEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },
  'security-mfa-disabled': {
    key: 'security-mfa-disabled',
    name: 'MFA Disabled',
    description: 'Alerts user MFA was disabled',
    category: 'SECURITY',
    subject: '⚠️ Multi-Factor Authentication disabled',
    isMandatory: true,
    component: () =>
      import(
        '@/components/emails/security/MFADisabledEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },

  // ── Notifications ─────────────────────────────────────────────────────────
  'notification-announcement': {
    key: 'notification-announcement',
    name: 'Platform Announcement',
    description: 'General announcement to users',
    category: 'NOTIFICATION',
    subject: '{{title}}',
    isMandatory: false,
    component: () =>
      import(
        '@/components/emails/notifications/AnnouncementEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },
  'notification-maintenance': {
    key: 'notification-maintenance',
    name: 'Maintenance Notice',
    description: 'Scheduled maintenance notification',
    category: 'NOTIFICATION',
    subject: 'Scheduled Maintenance: {{title}}',
    isMandatory: false,
    component: () =>
      import(
        '@/components/emails/notifications/MaintenanceNoticeEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },

  // ── Support ───────────────────────────────────────────────────────────────
  'support-ticket-created': {
    key: 'support-ticket-created',
    name: 'Ticket Created',
    description: 'Confirms support ticket creation',
    category: 'SUPPORT' as EmailCategory,
    subject: 'Support Ticket Created: #{{ticketId}}',
    isMandatory: false,
    component: () =>
      import(
        '@/components/emails/support/TicketCreatedEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },
  'support-ticket-assigned': {
    key: 'support-ticket-assigned',
    name: 'Ticket Assigned',
    description: 'Notifies agent of assigned ticket',
    category: 'SUPPORT' as EmailCategory,
    subject: 'Ticket Assigned: #{{ticketId}}',
    isMandatory: false,
    component: () =>
      import(
        '@/components/emails/support/TicketAssignedEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },
  'support-ticket-updated': {
    key: 'support-ticket-updated',
    name: 'Ticket Updated',
    description: 'Notifies customer of ticket status update',
    category: 'SUPPORT' as EmailCategory,
    subject: 'Ticket Update: #{{ticketId}}',
    isMandatory: false,
    component: () =>
      import(
        '@/components/emails/support/TicketUpdatedEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },
  'support-ticket-closed': {
    key: 'support-ticket-closed',
    name: 'Ticket Closed',
    description: 'Notifies customer ticket is closed',
    category: 'SUPPORT' as EmailCategory,
    subject: 'Ticket Closed: #{{ticketId}}',
    isMandatory: false,
    component: () =>
      import(
        '@/components/emails/support/TicketClosedEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },
  'support-customer-reply': {
    key: 'support-customer-reply',
    name: 'Customer Reply',
    description: 'Notifies agent of customer reply',
    category: 'SUPPORT' as EmailCategory,
    subject: 'New Reply: #{{ticketId}}',
    isMandatory: false,
    component: () =>
      import(
        '@/components/emails/support/CustomerReplyEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },
  'support-internal-reply': {
    key: 'support-internal-reply',
    name: 'Internal Reply',
    description: 'Notifies customer of support reply',
    category: 'SUPPORT' as EmailCategory,
    subject: 'Support Reply: #{{ticketId}}',
    isMandatory: false,
    component: () =>
      import(
        '@/components/emails/support/InternalReplyEmail'
      ) as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },

  // ── Demo ──────────────────────────────────────────────────────────────────
  'demo-summary': {
    key: 'demo-summary',
    name: 'Demo Completed Summary',
    description: 'Summary of the demo',
    category: 'DEMO' as EmailCategory,
    subject: 'Your KantaSwara Demo Summary',
    isMandatory: false,
    component: () =>
      import(
        '@/components/emails/demo/DemoCompletedSummaryEmail'
      ) as unknown as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },
  'demo-contact-sales': {
    key: 'demo-contact-sales',
    name: 'Contact Sales',
    description: 'Sales contact confirmation',
    category: 'DEMO' as EmailCategory,
    subject: "We've received your request",
    isMandatory: false,
    component: () =>
      import(
        '@/components/emails/demo/ContactSalesFollowupEmail'
      ) as unknown as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },
  'demo-meeting-confirmation': {
    key: 'demo-meeting-confirmation',
    name: 'Demo Meeting Confirmed',
    description: 'Confirms demo meeting time',
    category: 'DEMO' as EmailCategory,
    subject: 'Demo Meeting Confirmed',
    isMandatory: false,
    component: () =>
      import(
        '@/components/emails/demo/DemoMeetingConfirmationEmail'
      ) as unknown as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },
  'demo-trial-invitation': {
    key: 'demo-trial-invitation',
    name: 'Trial Invitation',
    description: 'Invites user to trial after demo',
    category: 'DEMO' as EmailCategory,
    subject: 'Exclusive Trial Invitation 🎁',
    isMandatory: false,
    component: () =>
      import(
        '@/components/emails/demo/TrialInvitationEmail'
      ) as unknown as Promise<{ default: ComponentType<Record<string, unknown>> }>,
  },
};

export function getTemplateEntry(
  key: string
): TemplateRegistryEntry | undefined {
  return TEMPLATE_REGISTRY[key];
}

export function getAllTemplateKeys(): string[] {
  return Object.keys(TEMPLATE_REGISTRY);
}

export function getTemplatesByCategory(
  category: EmailCategory
): TemplateRegistryEntry[] {
  return Object.values(TEMPLATE_REGISTRY).filter(
    (t) => t.category === category
  );
}
