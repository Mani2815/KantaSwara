// =============================================================================
// KantaSwara — Gmail SMTP Email Provider
// =============================================================================

import * as nodemailer from 'nodemailer';
import { getEmailConfig } from '../config';
import type { IEmailProvider } from './EmailProvider';
import type { EmailPayload, EmailProviderResponse } from '../types';

export class GmailSMTPProvider implements IEmailProvider {
  readonly providerName = 'gmail';
  private transporter: nodemailer.Transporter;

  constructor() {
    const config = getEmailConfig();
    
    // Validate config at instantiation
    if (config.provider !== 'gmail' || !config.gmailUser || !config.gmailAppPassword) {
      throw new Error('[GmailSMTPProvider] Invalid configuration for Gmail provider.');
    }

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: config.gmailUser,
        pass: config.gmailAppPassword,
      },
    });
  }

  async send(payload: EmailPayload): Promise<EmailProviderResponse> {
    try {
      const config = getEmailConfig();
      
      const toAddresses = Array.isArray(payload.to)
        ? payload.to.map((r) => (r.name ? `"${r.name}" <${r.email}>` : r.email))
        : payload.to.name
          ? [`"${payload.to.name}" <${payload.to.email}>`]
          : [payload.to.email];
          
      const ccAddresses = payload.cc?.map((r) =>
        r.name ? `"${r.name}" <${r.email}>` : r.email
      );
      
      const bccAddresses = payload.bcc?.map((r) =>
        r.name ? `"${r.name}" <${r.email}>` : r.email
      );

      const fromAddress = payload.from ?? config.fromEmail;
      
      const mailOptions: nodemailer.SendMailOptions = {
        from: fromAddress,
        to: toAddresses.join(', '),
        replyTo: payload.replyTo ?? config.replyTo,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        cc: ccAddresses ? ccAddresses.join(', ') : undefined,
        bcc: bccAddresses ? bccAddresses.join(', ') : undefined,
        attachments: payload.attachments?.map((a) => ({
          filename: a.filename,
          content: a.content,
          contentType: a.contentType,
        })),
        headers: payload.headers,
      };

      console.log('\n[DEBUG-GMAIL] BEFORE sendMail:');
      console.log({
        to: mailOptions.to,
        from: mailOptions.from,
        subject: mailOptions.subject,
        htmlLength: payload.html?.length,
      });

      const info = await this.transporter.sendMail(mailOptions);

      console.log('\n[DEBUG-GMAIL] AFTER sendMail (Raw Response):');
      console.log(info);

      return {
        success: true,
        providerId: info.messageId,
        providerResponse: info as unknown as Record<string, unknown>,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      
      // Log some diagnostic info without exposing credentials
      console.error(`[GmailSMTPProvider] Failed to send email to ${JSON.stringify(payload.to)}. Error:`, message);

      return {
        success: false,
        error: message,
      };
    }
  }

  async sendBatch(payloads: EmailPayload[]): Promise<EmailProviderResponse[]> {
    // Send sequentially to avoid rate limits / overloading
    const results: EmailProviderResponse[] = [];
    for (const payload of payloads) {
      results.push(await this.send(payload));
    }
    return results;
  }
}
