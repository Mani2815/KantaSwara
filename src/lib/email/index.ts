/**
 * Email System Proxy
 * Exports the email service and event bus from @server/lib/email/
 * to ensure compatibility with imports pointing to @/lib/email.
 *
 * Usage in application code:
 *   import { emailService, emailEventBus } from '@/lib/email'
 */

export { emailService, EmailService } from '@server/lib/email/EmailService';
export { emailEventBus } from '@server/lib/email/events';
export { EmailPreferenceManager } from '@server/lib/email/preferences';
export { getAllTemplateKeys, getTemplatesByCategory, TEMPLATE_REGISTRY } from '@server/lib/email/templateRegistry';
export type {
  SendEmailOptions,
  BulkEmailOptions,
  EmailSendResult,
  EmailPayload,
  EmailRecipient,
  EmailAttachment,
  RenderedEmail,
  EmailEventName,
  EmailEventMap,
} from '@server/lib/email/types';
