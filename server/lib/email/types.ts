// =============================================================================
// KantaSwara — Email System Types
// =============================================================================

import type { EmailCategory, EmailPriority, EmailStatus } from '@prisma/client';

// Re-export Prisma enums for convenience
export type { EmailCategory, EmailPriority, EmailStatus };

// ─── Recipient ───────────────────────────────────────────────────────────────

export interface EmailRecipient {
  email: string;
  name?: string;
}

// ─── Attachment ───────────────────────────────────────────────────────────────

export interface EmailAttachment {
  filename: string;
  content: string | Buffer; // Base64 string or Buffer
  contentType?: string;
}

// ─── Core Payload ────────────────────────────────────────────────────────────

export interface EmailPayload {
  to: EmailRecipient | EmailRecipient[];
  from?: string;       // Defaults to emailConfig.fromEmail
  replyTo?: string;    // Defaults to emailConfig.replyTo
  subject: string;
  html: string;
  text?: string;
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  attachments?: EmailAttachment[];
  headers?: Record<string, string>;
  tags?: Record<string, string>;
}

// ─── Send Options (high-level, before rendering) ─────────────────────────────

export interface SendEmailOptions {
  to: string | EmailRecipient;
  subject: string;
  templateKey: string;
  variables?: Record<string, unknown>;
  category?: EmailCategory;
  priority?: EmailPriority;
  organizationId?: string;
  triggeredBy?: string;
  triggeredByEvent?: string;
  attachments?: EmailAttachment[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  /** Skip user preference check (use for mandatory emails) */
  bypassPreferences?: boolean;
}

export interface BulkEmailOptions {
  emails: SendEmailOptions[];
  /** Delay (ms) between sends to avoid rate limits */
  delayMs?: number;
}

export interface ScheduledEmailOptions extends SendEmailOptions {
  sendAt: Date;
}

// ─── Provider Response ───────────────────────────────────────────────────────

export interface EmailProviderResponse {
  success: boolean;
  providerId?: string;
  providerResponse?: Record<string, unknown>;
  error?: string;
}

// ─── Send Result (after full pipeline) ───────────────────────────────────────

export interface EmailSendResult {
  success: boolean;
  emailLogId: string;
  providerId?: string;
  status: EmailStatus;
  error?: string;
  skipped?: boolean;
  skipReason?: string;
}

// ─── Rendered Template ───────────────────────────────────────────────────────

export interface RenderedEmail {
  html: string;
  text: string;
  subject: string;
}

// ─── Events ──────────────────────────────────────────────────────────────────

// Auth Events
export type UserRegisteredEvent = {
  userId: string;
  email: string;
  name: string;
  verificationLink?: string;
};
export type PasswordResetRequestedEvent = {
  email: string;
  name: string;
  resetLink: string;
  expiresIn?: string;
};
export type EmailVerificationRequestedEvent = {
  email: string;
  name: string;
  verificationLink: string;
};
export type PasswordChangedEvent = {
  email: string;
  name: string;
  ipAddress?: string;
  userAgent?: string;
};
export type LoginAlertEvent = {
  email: string;
  name: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  timestamp: string;
};
export type AccountLockedEvent = {
  email: string;
  name: string;
  reason: string;
  supportEmail: string;
};
export type EmployeeInvitedEvent = {
  email: string;
  name: string;
  role: string;
  department: string;
  invitationLink: string;
  invitedByName: string;
  expiresAt: string;
};
export type EmployeeActivatedEvent = {
  email: string;
  name: string;
  role: string;
  dashboardUrl: string;
};
export type EmployeePasswordResetEvent = {
  email: string;
  name: string;
  resetLink: string;
  expiresIn: string;
};
export type EmployeeRoleChangedEvent = {
  email: string;
  name: string;
  newRole: string;
  dashboardUrl: string;
};

// Organization Events
export type OrganizationRegisteredEvent = {
  organizationId: string;
  organizationName: string;
  adminEmail: string;
  adminName: string;
};
export type OrganizationApprovedEvent = {
  organizationId: string;
  organizationName: string;
  adminEmail: string;
  adminName: string;
  dashboardUrl: string;
};
export type OrganizationRejectedEvent = {
  organizationId: string;
  organizationName: string;
  adminEmail: string;
  adminName: string;
  reason: string;
};
export type OrganizationSuspendedEvent = {
  organizationId: string;
  organizationName: string;
  adminEmail: string;
  adminName: string;
  reason: string;
};

// Billing Events
export type SubscriptionCreatedEvent = {
  organizationId: string;
  organizationName: string;
  adminEmail: string;
  adminName: string;
  planName: string;
  amount: string;
  billingCycle: string;
  startDate: string;
};
export type InvoiceGeneratedEvent = {
  organizationId: string;
  organizationName: string;
  adminEmail: string;
  adminName: string;
  invoiceNumber: string;
  amount: string;
  dueDate: string;
  invoiceUrl: string;
};
export type PaymentFailedEvent = {
  organizationId: string;
  organizationName: string;
  adminEmail: string;
  adminName: string;
  invoiceNumber: string;
  amount: string;
  dueDate: string;
};
export type PaymentSuccessfulEvent = {
  organizationId: string;
  organizationName: string;
  adminEmail: string;
  adminName: string;
  invoiceNumber: string;
  amount: string;
  paidDate: string;
};
export type SubscriptionExpiringEvent = {
  organizationId: string;
  organizationName: string;
  adminEmail: string;
  adminName: string;
  planName: string;
  expiryDate: string;
  renewalUrl: string;
};
export type TrialEndingEvent = {
  organizationId: string;
  organizationName: string;
  adminEmail: string;
  adminName: string;
  daysRemaining: number;
  upgradeUrl: string;
};

// AI Builder Events
export type AgentDraftSavedEvent = {
  email: string;
  name: string;
  agentName: string;
  projectName: string;
  builderUrl: string;
};
export type AgentValidationPassedEvent = {
  email: string;
  name: string;
  agentName: string;
  projectName: string;
  dashboardUrl: string;
};
export type AgentValidationFailedEvent = {
  email: string;
  name: string;
  agentName: string;
  projectName: string;
  errors: string[];
  builderUrl: string;
};
export type AgentPublishedEvent = {
  email: string;
  name: string;
  agentName: string;
  projectName: string;
  dashboardUrl: string;
};
export type DeploymentStartedEvent = {
  email: string;
  name: string;
  agentName: string;
  environment: string;
  deploymentUrl: string;
};
export type RollbackCompletedEvent = {
  email: string;
  name: string;
  agentName: string;
  environment: string;
  version: string;
  dashboardUrl: string;
};

// Delivery Events
export type ProjectAssignedEvent = {
  projectId: string;
  organizationName: string;
  assigneeEmail: string;
  assigneeName: string;
  projectName: string;
  priority: string;
};
export type DeploymentCompletedEvent = {
  projectId: string;
  organizationId: string;
  organizationName: string;
  adminEmail: string;
  adminName: string;
  agentName: string;
  environment: string;
  version: string;
  dashboardUrl: string;
};
export type DeploymentFailedEvent = {
  projectId: string;
  organizationId: string;
  organizationName: string;
  adminEmail: string;
  adminName: string;
  agentName: string;
  environment: string;
  errorMessage: string;
};
export type QAApprovedEvent = {
  projectId: string;
  organizationId: string;
  organizationName: string;
  adminEmail: string;
  adminName: string;
  agentName: string;
  reviewerName: string;
};

// Support Events
export type TicketCreatedEvent = {
  email: string;
  name: string;
  ticketId: string;
  subject: string;
  ticketUrl: string;
};
export type TicketAssignedEvent = {
  email: string;
  assigneeName: string;
  ticketId: string;
  subject: string;
  priority: string;
  ticketUrl: string;
};
export type TicketUpdatedEvent = {
  email: string;
  name: string;
  ticketId: string;
  subject: string;
  status: string;
  ticketUrl: string;
};
export type TicketClosedEvent = {
  email: string;
  name: string;
  ticketId: string;
  subject: string;
  ticketUrl: string;
};
export type CustomerReplyEvent = {
  email: string;
  assigneeName: string;
  ticketId: string;
  subject: string;
  replySnippet: string;
  ticketUrl: string;
};
export type InternalReplyEvent = {
  email: string;
  name: string;
  ticketId: string;
  subject: string;
  replySnippet: string;
  ticketUrl: string;
};

// Demo Events
export type DemoCompletedEvent = {
  email: string;
  name: string;
  summary: string;
};
export type ContactSalesEvent = {
  email: string;
  name: string;
  salesEmail: string;
};
export type DemoMeetingConfirmedEvent = {
  email: string;
  name: string;
  meetingTime: string;
  meetingLink: string;
  hostName: string;
};
export type TrialInvitationEvent = {
  email: string;
  name: string;
  trialLink: string;
  days: number;
};

// Security Events
export type SuspiciousLoginEvent = {
  email: string;
  name: string;
  ipAddress: string;
  location?: string;
  userAgent: string;
  timestamp: string;
  securityUrl: string;
};
export type APIKeyCreatedEvent = {
  email: string;
  name: string;
  keyName: string;
  createdAt: string;
  ipAddress?: string;
};
export type APIKeyRevokedEvent = {
  email: string;
  name: string;
  keyName: string;
  revokedAt: string;
};
export type MFAEnabledEvent = { email: string; name: string; settingsUrl: string; };
export type MFADisabledEvent = { email: string; name: string; settingsUrl: string; };

// Notification Events
export type AnnouncementPublishedEvent = {
  title: string;
  body: string;
  ctaUrl?: string;
  ctaLabel?: string;
  recipientEmails: string[];
};
export type MaintenanceScheduledEvent = {
  title: string;
  startTime: string;
  endTime: string;
  affectedServices: string[];
  recipientEmails: string[];
};

// ─── Event Map ────────────────────────────────────────────────────────────────

export interface EmailEventMap {
  // Auth
  UserRegistered: UserRegisteredEvent;
  PasswordResetRequested: PasswordResetRequestedEvent;
  EmailVerificationRequested: EmailVerificationRequestedEvent;
  PasswordChanged: PasswordChangedEvent;
  LoginAlert: LoginAlertEvent;
  AccountLocked: AccountLockedEvent;
  EmployeeInvited: EmployeeInvitedEvent;
  EmployeeActivated: EmployeeActivatedEvent;
  EmployeePasswordReset: EmployeePasswordResetEvent;
  EmployeeRoleChanged: EmployeeRoleChangedEvent;
  // Organization
  OrganizationRegistered: OrganizationRegisteredEvent;
  OrganizationApproved: OrganizationApprovedEvent;
  OrganizationRejected: OrganizationRejectedEvent;
  OrganizationSuspended: OrganizationSuspendedEvent;
  // Billing
  SubscriptionCreated: SubscriptionCreatedEvent;
  InvoiceGenerated: InvoiceGeneratedEvent;
  PaymentFailed: PaymentFailedEvent;
  PaymentSuccessful: PaymentSuccessfulEvent;
  SubscriptionExpiring: SubscriptionExpiringEvent;
  TrialEnding: TrialEndingEvent;
  // Delivery
  ProjectAssigned: ProjectAssignedEvent;
  DeploymentCompleted: DeploymentCompletedEvent;
  DeploymentFailed: DeploymentFailedEvent;
  QAApproved: QAApprovedEvent;
  // Builder
  AgentDraftSaved: AgentDraftSavedEvent;
  AgentValidationPassed: AgentValidationPassedEvent;
  AgentValidationFailed: AgentValidationFailedEvent;
  AgentPublished: AgentPublishedEvent;
  DeploymentStarted: DeploymentStartedEvent;
  RollbackCompleted: RollbackCompletedEvent;
  // Support
  TicketCreated: TicketCreatedEvent;
  TicketAssigned: TicketAssignedEvent;
  TicketUpdated: TicketUpdatedEvent;
  TicketClosed: TicketClosedEvent;
  CustomerReply: CustomerReplyEvent;
  InternalReply: InternalReplyEvent;
  // Demo
  DemoCompleted: DemoCompletedEvent;
  ContactSales: ContactSalesEvent;
  DemoMeetingConfirmed: DemoMeetingConfirmedEvent;
  TrialInvitation: TrialInvitationEvent;
  // Security
  SuspiciousLogin: SuspiciousLoginEvent;
  APIKeyCreated: APIKeyCreatedEvent;
  APIKeyRevoked: APIKeyRevokedEvent;
  MFAEnabled: MFAEnabledEvent;
  MFADisabled: MFADisabledEvent;
  // Notification
  AnnouncementPublished: AnnouncementPublishedEvent;
  MaintenanceScheduled: MaintenanceScheduledEvent;
}

export type EmailEventName = keyof EmailEventMap;
export type EmailEventPayload<T extends EmailEventName> = EmailEventMap[T];
