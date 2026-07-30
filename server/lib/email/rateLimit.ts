// =============================================================================
// KantaSwara — Email Rate Limiter
// =============================================================================

import { EMAIL_RATE_LIMITS } from './config';

interface RateLimitWindow {
  count: number;
  windowStart: number;
}

// In-memory store (per process). Replace with Redis for multi-instance.
const orgWindows = new Map<string, RateLimitWindow>();     // orgId → hourly count
const recipientWindows = new Map<string, RateLimitWindow>(); // email → daily count

function isWithinWindow(window: RateLimitWindow, durationMs: number): boolean {
  return Date.now() - window.windowStart < durationMs;
}

function checkAndIncrement(
  map: Map<string, RateLimitWindow>,
  key: string,
  limit: number,
  durationMs: number
): boolean {
  const existing = map.get(key);

  if (!existing || !isWithinWindow(existing, durationMs)) {
    // Start fresh window
    map.set(key, { count: 1, windowStart: Date.now() });
    return true; // allowed
  }

  if (existing.count >= limit) {
    return false; // rate limited
  }

  existing.count += 1;
  return true; // allowed
}

export class EmailRateLimiter {
  /**
   * Check if an org can send more emails in the current hour.
   */
  static checkOrg(organizationId: string): boolean {
    return checkAndIncrement(
      orgWindows,
      organizationId,
      EMAIL_RATE_LIMITS.perOrgPerHour,
      60 * 60 * 1000 // 1 hour
    );
  }

  /**
   * Check if a recipient can receive more emails today.
   */
  static checkRecipient(email: string): boolean {
    return checkAndIncrement(
      recipientWindows,
      email.toLowerCase(),
      EMAIL_RATE_LIMITS.perRecipientPerDay,
      24 * 60 * 60 * 1000 // 24 hours
    );
  }

  /**
   * Check both org and recipient limits.
   * Returns { allowed, reason } for clear error messages.
   */
  static check(
    email: string,
    organizationId?: string
  ): { allowed: boolean; reason?: string } {
    if (organizationId) {
      const orgAllowed = EmailRateLimiter.checkOrg(organizationId);
      if (!orgAllowed) {
        return {
          allowed: false,
          reason: `Organization rate limit exceeded (${EMAIL_RATE_LIMITS.perOrgPerHour}/hour)`,
        };
      }
    }

    const recipientAllowed = EmailRateLimiter.checkRecipient(email);
    if (!recipientAllowed) {
      return {
        allowed: false,
        reason: `Recipient rate limit exceeded (${EMAIL_RATE_LIMITS.perRecipientPerDay}/day)`,
      };
    }

    return { allowed: true };
  }

  /**
   * Reset all windows (useful for testing).
   */
  static resetAll(): void {
    orgWindows.clear();
    recipientWindows.clear();
  }
}
