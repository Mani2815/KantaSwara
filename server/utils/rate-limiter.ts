// =============================================================================
// Rate Limiter — IP-based In-Memory Rate Limiting
// =============================================================================
// Simple sliding-window rate limiter using in-memory Map.
// Suitable for single-instance Next.js deployments.
// For multi-instance deployments, replace with Redis-based solution.
// =============================================================================

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up stale entries every 10 minutes
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function startCleanup(windowMs: number) {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
      if (entry.timestamps.length === 0) {
        store.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);

  // Allow process to exit without waiting for cleanup
  if (cleanupTimer && typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref();
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAtMs: number;
  retryAfterSec: number;
}

/**
 * Check if a request is within the rate limit.
 *
 * @param key - Unique identifier (typically IP address)
 * @param maxRequests - Max requests allowed within the window
 * @param windowSec - Time window in seconds
 * @returns RateLimitResult with status and metadata
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSec: number
): RateLimitResult {
  const windowMs = windowSec * 1000;
  const now = Date.now();

  startCleanup(windowMs);

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove expired timestamps
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    const resetAtMs = oldestInWindow + windowMs;
    const retryAfterSec = Math.ceil((resetAtMs - now) / 1000);

    return {
      allowed: false,
      remaining: 0,
      resetAtMs,
      retryAfterSec,
    };
  }

  // Allow the request
  entry.timestamps.push(now);

  return {
    allowed: true,
    remaining: maxRequests - entry.timestamps.length,
    resetAtMs: now + windowMs,
    retryAfterSec: 0,
  };
}

/**
 * Get current count for a key without incrementing.
 */
export function getRateLimitCount(key: string, windowSec: number): number {
  const windowMs = windowSec * 1000;
  const now = Date.now();
  const entry = store.get(key);
  if (!entry) return 0;
  return entry.timestamps.filter((t) => now - t < windowMs).length;
}
