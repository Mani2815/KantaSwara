// =============================================================================
// KantaSwara — Email Config
// =============================================================================

export interface EmailConfig {
  apiKey: string;
  fromEmail: string;
  replyTo: string;
  appUrl: string;
  appName: string;
  supportEmail: string;
  isTestMode: boolean;
}

function validateEmailConfig(): EmailConfig {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'KantaSwara';
  const replyTo = process.env.RESEND_REPLY_TO ?? `support@kantaswara.com`;
  const supportEmail = process.env.RESEND_REPLY_TO ?? `support@kantaswara.com`;

  if (!apiKey) {
    throw new Error(
      '[EmailConfig] RESEND_API_KEY is not set. ' +
        'Add it to your .env.local file. ' +
        'Get an API key from https://resend.com'
    );
  }

  if (!fromEmail) {
    throw new Error(
      '[EmailConfig] RESEND_FROM_EMAIL is not set. ' +
        'Example: "KantaSwara <noreply@kantaswara.com>"'
    );
  }

  const isTestMode = apiKey.startsWith('re_test_');

  return {
    apiKey,
    fromEmail,
    replyTo,
    appUrl,
    appName,
    supportEmail,
    isTestMode,
  };
}

// Lazy singleton — only validated when first accessed
let _config: EmailConfig | null = null;

export function getEmailConfig(): EmailConfig {
  if (!_config) {
    _config = validateEmailConfig();
  }
  return _config;
}

export function initEmailConfig(): void {
  // Eagerly validate config on startup to throw fast if keys are missing
  getEmailConfig();
}

// Rate limiting defaults
export const EMAIL_RATE_LIMITS = {
  perOrgPerHour: 500,
  perRecipientPerDay: 20,
  bulkMaxPerRequest: 100,
} as const;

// Retry defaults
export const EMAIL_RETRY_DEFAULTS = {
  maxRetries: 3,
  backoffMs: [60_000, 300_000, 1_800_000], // 1m, 5m, 30m
} as const;
