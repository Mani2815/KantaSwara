// =============================================================================
// KantaSwara — Email Service (Central Orchestrator)
// =============================================================================
// This is the ONLY file that application code should import for sending emails.
// Never call providers or templates directly from business modules.

import { getEmailProvider } from './providers';
import { renderTemplate, TemplateNotFoundError } from './renderer';
import { EmailLogger } from './logger';
import { EmailRateLimiter } from './rateLimit';
import { EmailPreferenceManager } from './preferences';
import { AttachmentManager } from './attachments';
import { RetryManager } from './retry';
import { validateEmail, sanitizeSubject, sanitizeVariables } from './sanitizer';
import { getTemplateEntry } from './templateRegistry';
import type {
  SendEmailOptions,
  BulkEmailOptions,
  EmailSendResult,
  EmailPayload,
  RenderedEmail,
} from './types';

export class EmailService {
  /**
   * Send a single template-based email through the full pipeline:
   * validate → check preferences → render → rate-limit → send → log
   */
  async sendTemplate(options: SendEmailOptions): Promise<EmailSendResult> {
    const toEmail =
      typeof options.to === 'string' ? options.to : options.to.email;
    const toName =
      typeof options.to === 'string' ? undefined : options.to.name;

    // 1. Validate email address
    try {
      validateEmail(toEmail);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const logId = await EmailLogger.createLog({
        recipient: toEmail,
        recipientName: toName,
        subject: options.subject,
        templateKey: options.templateKey,
        category: options.category,
        priority: options.priority,
        organizationId: options.organizationId,
        triggeredBy: options.triggeredBy,
        triggeredByEvent: options.triggeredByEvent,
        variables: options.variables,
      });
      await EmailLogger.markFailed(logId, `Invalid email: ${msg}`);
      return { success: false, emailLogId: logId, status: 'FAILED', error: msg };
    }

    // 2. Check user email preferences (if userId is in variables)
    const templateEntry = getTemplateEntry(options.templateKey);
    const isMandatory =
      options.bypassPreferences ?? templateEntry?.isMandatory ?? false;

    if (!isMandatory && options.triggeredBy && options.triggeredBy !== 'system') {
      const { allowed, reason } = await EmailPreferenceManager.canSend(
        options.triggeredBy,
        options.category ?? 'NOTIFICATION',
        false
      );
      if (!allowed) {
        const logId = await EmailLogger.createLog({
          recipient: toEmail,
          subject: options.subject,
          templateKey: options.templateKey,
          category: options.category,
          organizationId: options.organizationId,
          triggeredBy: options.triggeredBy,
          triggeredByEvent: options.triggeredByEvent,
          variables: options.variables,
        });
        await EmailLogger.markSkipped(logId, reason ?? 'User preference');
        return {
          success: false,
          emailLogId: logId,
          status: 'SKIPPED',
          skipped: true,
          skipReason: reason,
        };
      }
    }

    // 3. Check rate limits
    const rateCheck = EmailRateLimiter.check(toEmail, options.organizationId);
    if (!rateCheck.allowed) {
      const logId = await EmailLogger.createLog({
        recipient: toEmail,
        subject: options.subject,
        templateKey: options.templateKey,
        category: options.category,
        organizationId: options.organizationId,
        triggeredBy: options.triggeredBy,
        triggeredByEvent: options.triggeredByEvent,
        variables: options.variables,
      });
      await EmailLogger.markFailed(logId, rateCheck.reason ?? 'Rate limited');
      return {
        success: false,
        emailLogId: logId,
        status: 'FAILED',
        error: rateCheck.reason,
      };
    }

    // 4. Render the template
    let rendered: RenderedEmail;
    const sanitizedVars = sanitizeVariables(options.variables ?? {});
    try {
      rendered = await renderTemplate(options.templateKey, sanitizedVars);
    } catch (err: unknown) {
      const msg =
        err instanceof TemplateNotFoundError
          ? err.message
          : `Template render error: ${err instanceof Error ? err.message : String(err)}`;
      const logId = await EmailLogger.createLog({
        recipient: toEmail,
        subject: options.subject,
        templateKey: options.templateKey,
        category: options.category,
        organizationId: options.organizationId,
        triggeredBy: options.triggeredBy,
        triggeredByEvent: options.triggeredByEvent,
        variables: sanitizedVars,
      });
      await EmailLogger.markFailed(logId, msg);
      return { success: false, emailLogId: logId, status: 'FAILED', error: msg };
    }

    // 5. Validate and sanitize subject
    const finalSubject = sanitizeSubject(rendered.subject || options.subject);

    // 6. Create log entry
    const logId = await EmailLogger.createLog({
      recipient: toEmail,
      recipientName: toName,
      subject: finalSubject,
      templateKey: options.templateKey,
      category: options.category ?? templateEntry?.category ?? 'NOTIFICATION',
      priority: options.priority,
      organizationId: options.organizationId,
      triggeredBy: options.triggeredBy,
      triggeredByEvent: options.triggeredByEvent,
      variables: sanitizedVars,
    });

    // 7. Validate attachments (if any)
    if (options.attachments?.length) {
      try {
        AttachmentManager.validate(options.attachments);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        await EmailLogger.markFailed(logId, msg);
        return { success: false, emailLogId: logId, status: 'FAILED', error: msg };
      }
    }

    // 8. Build payload and send
    const payload: EmailPayload = {
      to: { email: toEmail, name: toName },
      subject: finalSubject,
      html: rendered.html,
      text: rendered.text,
      cc: options.cc,
      bcc: options.bcc,
      attachments: options.attachments,
      tags: {
        templateKey: options.templateKey,
        organizationId: options.organizationId ?? 'platform',
        category: options.category ?? 'NOTIFICATION',
      },
    };

    const provider = getEmailProvider();
    const result = await provider.send(payload);

    // 9. Update log with result
    if (result.success) {
      await EmailLogger.markSent(logId, result.providerId, result.providerResponse);
      return {
        success: true,
        emailLogId: logId,
        providerId: result.providerId,
        status: 'SENT',
      };
    } else {
      await EmailLogger.markFailed(logId, result.error ?? 'Unknown provider error');
      // Schedule retry
      await RetryManager.schedule(logId);
      return {
        success: false,
        emailLogId: logId,
        status: 'FAILED',
        error: result.error,
      };
    }
  }

  /**
   * Send a raw email (HTML provided directly — use only for system/admin purposes).
   */
  async sendRaw(options: {
    to: string;
    toName?: string;
    subject: string;
    html: string;
    text?: string;
    organizationId?: string;
    triggeredBy?: string;
    category?: SendEmailOptions['category'];
  }): Promise<EmailSendResult> {
    validateEmail(options.to);
    const finalSubject = sanitizeSubject(options.subject);

    const logId = await EmailLogger.createLog({
      recipient: options.to,
      recipientName: options.toName,
      subject: finalSubject,
      category: options.category ?? 'NOTIFICATION',
      organizationId: options.organizationId,
      triggeredBy: options.triggeredBy,
    });

    const provider = getEmailProvider();
    const result = await provider.send({
      to: { email: options.to, name: options.toName },
      subject: finalSubject,
      html: options.html,
      text: options.text,
    });

    if (result.success) {
      await EmailLogger.markSent(logId, result.providerId, result.providerResponse);
      return {
        success: true,
        emailLogId: logId,
        providerId: result.providerId,
        status: 'SENT',
      };
    } else {
      await EmailLogger.markFailed(logId, result.error ?? 'Unknown error');
      return {
        success: false,
        emailLogId: logId,
        status: 'FAILED',
        error: result.error,
      };
    }
  }

  /**
   * Send bulk emails. Processes sequentially with optional delay.
   */
  async sendBulk(options: BulkEmailOptions): Promise<EmailSendResult[]> {
    const results: EmailSendResult[] = [];
    for (const email of options.emails) {
      const result = await this.sendTemplate(email);
      results.push(result);
      if (options.delayMs && options.delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, options.delayMs));
      }
    }
    return results;
  }

  /**
   * Preview a template without sending — returns { html, text, subject }.
   */
  async previewTemplate(
    templateKey: string,
    variables: Record<string, unknown> = {}
  ) {
    const sanitized = sanitizeVariables(variables);
    return renderTemplate(templateKey, sanitized);
  }

  /**
   * Retry a previously failed email by log ID.
   */
  async retryFailed(emailLogId: string): Promise<EmailSendResult> {
    const { prisma } = await import('@server/lib/prisma');
    const log = await prisma.emailLog.findUnique({ where: { id: emailLogId } });

    if (!log) {
      return {
        success: false,
        emailLogId,
        status: 'FAILED',
        error: 'Email log not found',
      };
    }

    if (!log.templateKey) {
      return {
        success: false,
        emailLogId,
        status: 'FAILED',
        error: 'Cannot retry — no template key on log',
      };
    }

    // Re-send using stored variables
    const variables =
      typeof log.variables === 'object' && log.variables !== null
        ? (log.variables as Record<string, unknown>)
        : {};

    const provider = getEmailProvider();
    const rendered = await renderTemplate(log.templateKey, variables);
    const finalSubject = sanitizeSubject(rendered.subject);

    // Update retry count first
    await prisma.emailLog.update({
      where: { id: emailLogId },
      data: { status: 'SENDING', retryCount: log.retryCount + 1 },
    });

    const result = await provider.send({
      to: { email: log.recipient, name: log.recipientName ?? undefined },
      subject: finalSubject,
      html: rendered.html,
      text: rendered.text,
    });

    if (result.success) {
      await EmailLogger.markSent(emailLogId, result.providerId, result.providerResponse);
      await RetryManager.markDone(emailLogId);
      return {
        success: true,
        emailLogId,
        providerId: result.providerId,
        status: 'SENT',
      };
    } else {
      await EmailLogger.markFailed(emailLogId, result.error ?? 'Retry failed');
      return {
        success: false,
        emailLogId,
        status: 'FAILED',
        error: result.error,
      };
    }
  }
}

// Singleton export — import this everywhere
export const emailService = new EmailService();
