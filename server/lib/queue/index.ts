// =============================================================================
// Queue System — Barrel Exports & Initialization
// =============================================================================

// ── Redis ───────────────────────────────────────────────────────────────────
import {
  getRedisClient,
  disconnectRedis,
  isRedisHealthy,
} from '../redis/redis';

export {
  getRedisClient,
  disconnectRedis,
  isRedisHealthy,
};

// ── Queue Factory ───────────────────────────────────────────────────────────
export {
  getQueue,
  createWorker,
  closeAllQueues,
  enqueueEmbeddingJob,
  enqueueNotificationJob,
  enqueueAnalyticsJob,
  QUEUE_NAMES,
} from './queue';
export type { QueueName } from './queue';

// ── Workers ─────────────────────────────────────────────────────────────────
import { startEmbeddingWorker } from './workers/embedding-worker';
import { startAnalyticsWorker } from './workers/analytics-worker';
import { startNotificationWorker } from './workers/notification-worker';

/**
 * Initialize all background workers.
 * Call once at server startup (only in non-edge environments).
 */
export async function initializeWorkers(): Promise<void> {
  try {
    const redisOk = await isRedisHealthy();
    if (!redisOk) {
      console.warn('[Queue] Redis is unavailable. Skipping background worker initialization.');
      return;
    }

    startEmbeddingWorker();
    startAnalyticsWorker();
    startNotificationWorker();
    console.log('[Queue] All workers initialized');
  } catch (err) {
    console.error('[Queue] Failed to initialize workers:', err);
  }
}
