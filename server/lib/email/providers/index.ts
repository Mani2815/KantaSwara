// =============================================================================
// KantaSwara — Provider Factory
// =============================================================================
// To switch providers: replace ResendProvider with SESProvider / SendGridProvider etc.
// The rest of the system remains unchanged.

import { ResendProvider } from './ResendProvider';
import { GmailSMTPProvider } from './GmailSMTPProvider';
import { getEmailConfig } from '../config';
import type { IEmailProvider } from './EmailProvider';

export type { IEmailProvider };

let _provider: IEmailProvider | null = null;

export function getEmailProvider(): IEmailProvider {
  if (!_provider) {
    const config = getEmailConfig();
    if (config.provider === 'gmail') {
      _provider = new GmailSMTPProvider();
    } else {
      _provider = new ResendProvider();
    }
  }
  return _provider;
}
