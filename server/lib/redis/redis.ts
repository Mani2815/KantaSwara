// =============================================================================
// Redis Client Singleton
// =============================================================================
// IORedis connection for BullMQ queues and caching.
// Connection config from REDIS_URL env var.
// Graceful disconnect on process termination.
// =============================================================================

import Redis from 'ioredis';

let redisClient: Redis | null = null;

// =============================================================================
// GET CLIENT
// =============================================================================

/**
 * Get or create the Redis client singleton.
 * Lazy initialization — only connects when first called.
 */
export function getRedisClient(): Redis {
  if (redisClient) return redisClient;

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: false,
    retryStrategy(times: number) {
      const delay = Math.min(times * 200, 5000);
      console.warn(`[Redis] Reconnecting... attempt ${times} (${delay}ms delay)`);
      return delay;
    },
    lazyConnect: true,
  });

  redisClient.on('connect', () => {
    console.log('[Redis] Connected');
  });

  redisClient.on('error', (err: Error) => {
    console.error('[Redis] Connection error:', err.message);
  });

  redisClient.on('close', () => {
    console.warn('[Redis] Connection closed');
  });

  // Connect
  redisClient.connect().catch((err: Error) => {
    console.error('[Redis] Initial connection failed:', err.message);
  });

  return redisClient;
}

// =============================================================================
// DISCONNECT
// =============================================================================

/**
 * Gracefully disconnect Redis. Call on server shutdown.
 */
export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('[Redis] Disconnected');
  }
}

// =============================================================================
// HEALTH CHECK
// =============================================================================

/**
 * Check if Redis is connected and responsive.
 */
export async function isRedisHealthy(): Promise<boolean> {
  if (!redisClient) return false;
  try {
    const pong = await redisClient.ping();
    return pong === 'PONG';
  } catch {
    return false;
  }
}

// ── Graceful shutdown ───────────────────────────────────────────────────────
if (typeof process !== 'undefined') {
  process.on('SIGTERM', disconnectRedis);
  process.on('SIGINT', disconnectRedis);
}
