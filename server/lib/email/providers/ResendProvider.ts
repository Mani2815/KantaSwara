// =============================================================================
// KantaSwara — Resend Email Provider
// =============================================================================

import { Resend } from 'resend';
import { getEmailConfig } from '../config';
import type { IEmailProvider } from './EmailProvider';
import type { EmailPayload, EmailProviderResponse } from '../types';

export class ResendProvider implements IEmailProvider {
  readonly providerName = 'resend';
  private client: Resend;

  constructor() {
    const config = getEmailConfig();
    this.client = new Resend(config.apiKey);
  }

  async send(payload: EmailPayload): Promise<EmailProviderResponse> {
    try {
      const config = getEmailConfig();

      let toAddresses = Array.isArray(payload.to)
        ? payload.to.map((r) => (r.name ? `${r.name} <${r.email}>` : r.email))
        : payload.to.name
          ? [`${payload.to.name} <${payload.to.email}>`]
          : [payload.to.email];

      const fromAddress = payload.from ?? config.fromEmail;
      const targetDevEmail = config.devRedirectTo ?? (fromAddress.includes('@resend.dev') ? 'smartcitycms@gmail.com' : undefined);

      if (targetDevEmail) {
        const isAlreadyOwner = toAddresses.length === 1 && toAddresses[0].includes(targetDevEmail);
        if (!isAlreadyOwner) {
          console.log(
            `[ResendProvider] Dev mode / unverified domain (@resend.dev): Redirecting recipient(s) [${toAddresses.join(', ')}] -> ${targetDevEmail}`
          );
          toAddresses = [targetDevEmail];
        }
      }

      const { data, error } = await this.client.emails.send({
        from: fromAddress,
        to: toAddresses,
        reply_to: payload.replyTo ?? config.replyTo,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        cc: payload.cc?.map((r) =>
          r.name ? `${r.name} <${r.email}>` : r.email
        ),
        bcc: payload.bcc?.map((r) =>
          r.name ? `${r.name} <${r.email}>` : r.email
        ),
        attachments: payload.attachments?.map((a) => ({
          filename: a.filename,
          content:
            typeof a.content === 'string'
              ? a.content
              : a.content.toString('base64'),
          content_type: a.contentType,
        })),
        headers: payload.headers,
        tags: payload.tags
          ? Object.entries(payload.tags).map(([name, value]) => ({
              name,
              value,
            }))
          : undefined,
      });

      if (error) {
        if (error.message.includes('testing emails') || error.name === 'validation_error') {
          console.warn(
            `[ResendProvider] Unverified domain restriction: Resend allows sending emails ONLY to smartcitycms@gmail.com in test mode. ` +
            `To send to other recipients, verify a domain at https://resend.com/domains and set RESEND_FROM_EMAIL to an address on that domain.`
          );
        }
        return {
          success: false,
          error: error.message,
          providerResponse: error as unknown as Record<string, unknown>,
        };
      }

      return {
        success: true,
        providerId: data?.id,
        providerResponse: data as unknown as Record<string, unknown>,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: message,
      };
    }
  }

  async sendBatch(payloads: EmailPayload[]): Promise<EmailProviderResponse[]> {
    // Resend supports batch sending up to 100 emails
    // For now, use sequential sending; can be optimised with the batch API later
    const results: EmailProviderResponse[] = [];
    for (const payload of payloads) {
      results.push(await this.send(payload));
    }
    return results;
  }
}
