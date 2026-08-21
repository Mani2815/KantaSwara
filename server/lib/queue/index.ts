// =============================================================================
// Queue System — Barrel Exports & Initialization
// =============================================================================

// ── Redis ───────────────────────────────────────────────────────────────────
export {
  getRedisClient,
  disconnectRedis,
  isRedisHealthy,
} from '../redis/redis';

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
export function initializeWorkers(): void {
  try {
    startEmbeddingWorker();
    startAnalyticsWorker();
    startNotificationWorker();
    console.log('[Queue] All workers initialized');
  } catch (err) {
    console.error('[Queue] Failed to initialize workers:', err);
  }
}
