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
