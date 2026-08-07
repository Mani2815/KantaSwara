// =============================================================================
// KantaSwara — Email Config
// =============================================================================

export interface EmailConfig {
  provider: 'resend' | 'gmail';
  gmailUser?: string;
  gmailAppPassword?: string;
  apiKey: string;
  fromEmail: string;
  replyTo: string;
  appUrl: string;
  appName: string;
  supportEmail: string;
  isTestMode: boolean;
  devRedirectTo?: string;
}

function validateEmailConfig(): EmailConfig {
  const provider = (process.env.EMAIL_PROVIDER || 'resend') as 'resend' | 'gmail';
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
  const apiKey = process.env.RESEND_API_KEY;
  let fromEmail = process.env.RESEND_FROM_EMAIL;
  
  if (provider === 'gmail') {
    if (!gmailUser || !gmailAppPassword) {
      throw new Error(
        '[EmailConfig] EMAIL_PROVIDER is set to gmail, but GMAIL_USER or GMAIL_APP_PASSWORD is missing.'
      );
    }
    // Automatically set fromEmail for development
    fromEmail = `KantaSwara <${gmailUser}>`;
  } else {
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
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'KantaSwara';
  const replyTo = process.env.RESEND_REPLY_TO ?? `support@kantaswara.com`;
  const supportEmail = process.env.RESEND_REPLY_TO ?? `support@kantaswara.com`;
  const devRedirectTo = process.env.RESEND_DEV_REDIRECT_TO;

  let isTestMode = false;
  if (provider === 'resend') {
    isTestMode = apiKey!.startsWith('re_test_') || fromEmail!.includes('@resend.dev');
  } else {
    isTestMode = true; // Gmail is considered test/dev mode in our context
  }

  return {
    provider,
    gmailUser,
    gmailAppPassword,
    apiKey: apiKey ?? '',
    fromEmail: fromEmail!,
    replyTo,
    appUrl,
    appName,
    supportEmail,
    isTestMode,
    devRedirectTo,
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
