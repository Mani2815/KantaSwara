// =============================================================================
// Provider Errors
// =============================================================================

export class ProviderAuthError extends Error {
  constructor(provider: string, message: string) {
    super(`[${provider}] Authentication Error: ${message}`);
    this.name = 'ProviderAuthError';
  }
}

export class ProviderRateLimitError extends Error {
  constructor(provider: string, message: string) {
    super(`[${provider}] Rate Limit Exceeded: ${message}`);
    this.name = 'ProviderRateLimitError';
  }
}

export class ProviderQuotaExceededError extends Error {
  constructor(provider: string, message: string) {
    super(`[${provider}] Quota Exceeded or Forbidden: ${message}`);
    this.name = 'ProviderQuotaExceededError';
  }
}

export class ProviderNetworkError extends Error {
  constructor(provider: string, message: string) {
    super(`[${provider}] Network or Timeout Error: ${message}`);
    this.name = 'ProviderNetworkError';
  }
}

export class ProviderModelUnsupportedError extends Error {
  constructor(provider: string, message: string) {
    super(`[${provider}] Unsupported Model: ${message}`);
    this.name = 'ProviderModelUnsupportedError';
  }
}

export class ProviderGenericError extends Error {
  constructor(provider: string, status: number, message: string) {
    super(`[${provider}] API error (${status}): ${message}`);
    this.name = 'ProviderGenericError';
  }
}

/**
 * Helper to throw the correct error based on HTTP status code.
 */
export function handleHttpError(providerName: string, status: number, errorText: string): never {
  let message = errorText;
  try {
    const parsed = JSON.parse(errorText);
    message = parsed.error?.message || parsed.message || parsed.err_msg;
    if (!message && parsed.detail) {
      if (typeof parsed.detail === 'string') {
        message = parsed.detail;
      } else if (typeof parsed.detail === 'object' && parsed.detail.message) {
        message = parsed.detail.message;
      } else {
        message = JSON.stringify(parsed.detail);
      }
    }
    message = message || errorText;
    
    // Check for specific model unsupported messages
    if (typeof message === 'string' && (message.toLowerCase().includes('model not found') || message.toLowerCase().includes('does not exist'))) {
      throw new ProviderModelUnsupportedError(providerName, message);
    }
  } catch {
    // Keep raw text if parsing fails
  }

  if (status === 401) {
    throw new ProviderAuthError(providerName, message);
  }
  if (status === 429) {
    throw new ProviderRateLimitError(providerName, message);
  }
  if (status === 402 || status === 403) {
    throw new ProviderQuotaExceededError(providerName, message);
  }
  if (status === 404) {
    throw new ProviderModelUnsupportedError(providerName, message);
  }
  if (status === 503 || status === 504 || status === 502) {
    throw new ProviderNetworkError(providerName, message);
  }

  throw new ProviderGenericError(providerName, status, message);
}
