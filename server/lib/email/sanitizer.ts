// =============================================================================
// KantaSwara — Email Sanitizer
// =============================================================================

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const HEADER_INJECTION_REGEX = /[\r\n]/;

export class EmailSanitizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmailSanitizationError';
  }
}

/**
 * Validates an email address format.
 * Throws if invalid.
 */
export function validateEmail(email: string): void {
  const trimmed = email.trim();
  if (!trimmed) {
    throw new EmailSanitizationError('Email address is empty');
  }
  if (trimmed.length > 320) {
    throw new EmailSanitizationError(`Email address too long: ${trimmed.length} chars`);
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    throw new EmailSanitizationError(`Invalid email address: "${trimmed}"`);
  }
  if (HEADER_INJECTION_REGEX.test(trimmed)) {
    throw new EmailSanitizationError('Email address contains illegal characters (CR/LF)');
  }
}

/**
 * Sanitizes a subject line — strips CR/LF to prevent header injection.
 */
export function sanitizeSubject(subject: string): string {
  if (!subject || typeof subject !== 'string') {
    throw new EmailSanitizationError('Subject is required');
  }
  const sanitized = subject.replace(HEADER_INJECTION_REGEX, '').trim();
  if (!sanitized) {
    throw new EmailSanitizationError('Subject is empty after sanitization');
  }
  return sanitized;
}

/**
 * Strips HTML tags from a string (for template variable safety).
 */
export function stripHtml(str: unknown): string {
  if (str == null) return '';
  return String(str)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

/**
 * Sanitizes a record of template variables.
 * Strips HTML from string values to prevent XSS in emails.
 */
export function sanitizeVariables(
  variables: Record<string, unknown>
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(variables)) {
    if (typeof value === 'string') {
      // Keep URLs intact, strip HTML from everything else
      if (key.toLowerCase().includes('url') || key.toLowerCase().includes('link')) {
        // Validate URL format
        try {
          new URL(value);
          sanitized[key] = value;
        } catch {
          sanitized[key] = stripHtml(value);
        }
      } else {
        sanitized[key] = stripHtml(value);
      }
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
