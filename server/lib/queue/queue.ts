// =============================================================================
// BullMQ Queue Factory
// =============================================================================
// Creates named queues with default job options.
// All queues share the same Redis connection.
// =============================================================================

import { Queue, Worker, type ConnectionOptions, type JobsOptions } from 'bullmq';
import { getRedisClient, isRedisHealthy } from '../redis/redis';

// ─────────────────────────────────────────────────────────────────────────────
// Queue Names
// ─────────────────────────────────────────────────────────────────────────────

export const QUEUE_NAMES = {
  EMBEDDINGS: 'embeddings',
  ANALYTICS: 'analytics',
  NOTIFICATIONS: 'notifications',
  EMAIL: 'email',
  CLEANUP: 'cleanup',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

// ─────────────────────────────────────────────────────────────────────────────
// Default Job Options
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_JOB_OPTIONS: JobsOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 500 },
};

// ─────────────────────────────────────────────────────────────────────────────
// Queue Cache
// ─────────────────────────────────────────────────────────────────────────────

const queues = new Map<string, Queue>();

// =============================================================================
// GET QUEUE
// =============================================================================

/**
 * Get or create a BullMQ queue by name.
 * Queues are cached as singletons.
 */
export function getQueue(name: QueueName): Queue {
  let queue = queues.get(name);
  if (queue) return queue;

  const connection = getRedisClient() as unknown as ConnectionOptions;

  queue = new Queue(name, {
    connection,
    defaultJobOptions: DEFAULT_JOB_OPTIONS,
  });

  queues.set(name, queue);
  return queue;
}

// =============================================================================
// CREATE WORKER
// =============================================================================

/**
 * Create a BullMQ worker for a queue.
 * Workers process jobs from the specified queue.
 */
export function createWorker(
  name: QueueName,
  processor: (job: { id?: string; name: string; data: Record<string, unknown> }) => Promise<unknown>,
  options?: { concurrency?: number }
): Worker {
  const connection = getRedisClient() as unknown as ConnectionOptions;

  const worker = new Worker(name, processor, {
    connection,
    concurrency: options?.concurrency || 3,
  });

  worker.on('completed', (job) => {
    console.log(`[Queue:${name}] Job ${job?.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Queue:${name}] Job ${job?.id} failed:`, err.message);
  });

  worker.on('error', (err) => {
    console.error(`[Queue:${name}] Worker error:`, err.message);
  });

  return worker;
}

// =============================================================================
// ENQUEUE HELPERS
// =============================================================================

/**
 * Add a job to the embeddings queue.
 */
export async function enqueueEmbeddingJob(data: {
  documentId: string;
  organizationId: string;
  knowledgeBaseId: string;
  fileName: string;
}): Promise<string> {
  if (!(await isRedisHealthy())) {
    console.warn('[Queue] Redis is unavailable. Skipping enqueueEmbeddingJob.');
    return 'redis-unavailable-fallback-id';
  }
  try {
    const queue = getQueue(QUEUE_NAMES.EMBEDDINGS);
    const job = await queue.add('index-document', data, {
      priority: 2,
    });
    return job.id || '';
  } catch (err: any) {
    console.error('[Queue] Failed to enqueue embedding job:', err.message);
    return 'queue-error-fallback-id';
  }
}

/**
 * Add a job to the notification queue.
 */
export async function enqueueNotificationJob(data: {
  type: 'email' | 'in-app' | 'usage-warning';
  organizationId: string;
  userId?: string;
  payload: Record<string, unknown>;
}): Promise<string> {
  if (!(await isRedisHealthy())) {
    console.warn('[Queue] Redis is unavailable. Skipping enqueueNotificationJob.');
    return 'redis-unavailable-fallback-id';
  }
  try {
    const queue = getQueue(QUEUE_NAMES.NOTIFICATIONS);
    const job = await queue.add(`notify-${data.type}`, data);
    return job.id || '';
  } catch (err: any) {
    console.error('[Queue] Failed to enqueue notification job:', err.message);
    return 'queue-error-fallback-id';
  }
}

/**
 * Add a job to the analytics queue.
 */
export async function enqueueAnalyticsJob(data: {
  type: 'daily-summary' | 'weekly-report' | 'cost-alert';
  organizationId: string;
  payload: Record<string, unknown>;
}): Promise<string> {
  if (!(await isRedisHealthy())) {
    console.warn('[Queue] Redis is unavailable. Skipping enqueueAnalyticsJob.');
    return 'redis-unavailable-fallback-id';
  }
  try {
    const queue = getQueue(QUEUE_NAMES.ANALYTICS);
    const job = await queue.add(`analytics-${data.type}`, data);
    return job.id || '';
  } catch (err: any) {
    console.error('[Queue] Failed to enqueue analytics job:', err.message);
    return 'queue-error-fallback-id';
  }
}

// =============================================================================
// SHUTDOWN
// =============================================================================

/**
 * Gracefully close all queues and workers.
 */
export async function closeAllQueues(): Promise<void> {
  const closePromises = Array.from(queues.values()).map((q) => q.close());
  await Promise.all(closePromises);
  queues.clear();
  console.log('[Queue] All queues closed');
}
