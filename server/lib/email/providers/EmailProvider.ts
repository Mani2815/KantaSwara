// =============================================================================
// KantaSwara — Email Provider Interface
// =============================================================================

import type { EmailPayload, EmailProviderResponse } from '../types';

export interface IEmailProvider {
  /**
   * Send a single email.
   */
  send(payload: EmailPayload): Promise<EmailProviderResponse>;

  /**
   * Send multiple emails in a batch.
   * Default implementation sends sequentially; providers can override for true batch.
   */
  sendBatch(payloads: EmailPayload[]): Promise<EmailProviderResponse[]>;

  /**
   * The provider name (for logging).
   */
  readonly providerName: string;
}
