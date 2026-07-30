// =============================================================================
// KantaSwara — Provider Factory
// =============================================================================
// To switch providers: replace ResendProvider with SESProvider / SendGridProvider etc.
// The rest of the system remains unchanged.

import { ResendProvider } from './ResendProvider';
import type { IEmailProvider } from './EmailProvider';

export type { IEmailProvider };

let _provider: IEmailProvider | null = null;

export function getEmailProvider(): IEmailProvider {
  if (!_provider) {
    _provider = new ResendProvider();
  }
  return _provider;
}
