// =============================================================================
// Provider Health Monitor
// =============================================================================
// Tracks success/failure counts and latency for each provider.
// Used by the FailoverManager and circuit breakers to make routing decisions.
// =============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface ProviderHealthSnapshot {
  providerId: string;
  status: HealthStatus;
  successCount: number;
  failureCount: number;
  consecutiveFailures: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  lastSuccessAt: Date | null;
  lastFailureAt: Date | null;
  lastCheckedAt: Date;
}

interface HealthEntry {
  providerId: string;
  successCount: number;
  failureCount: number;
  consecutiveFailures: number;
  latencies: number[]; // rolling window
  lastSuccessAt: Date | null;
  lastFailureAt: Date | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const MAX_LATENCY_SAMPLES = 100;
const DEGRADED_FAILURE_RATE = 0.1; // 10% failure rate → degraded
const UNHEALTHY_CONSECUTIVE_FAILURES = 5;

// ─────────────────────────────────────────────────────────────────────────────
// Storage
// ─────────────────────────────────────────────────────────────────────────────

const healthStore = new Map<string, HealthEntry>();

// =============================================================================
// RECORD RESULTS
// =============================================================================

/**
 * Record a successful provider invocation.
 */
export function recordSuccess(providerId: string, latencyMs: number): void {
  const entry = getOrCreateEntry(providerId);
  entry.successCount++;
  entry.consecutiveFailures = 0;
  entry.lastSuccessAt = new Date();
  addLatency(entry, latencyMs);
}

/**
 * Record a failed provider invocation.
 */
export function recordFailure(providerId: string, latencyMs: number): void {
  const entry = getOrCreateEntry(providerId);
  entry.failureCount++;
  entry.consecutiveFailures++;
  entry.lastFailureAt = new Date();
  addLatency(entry, latencyMs);
}

// =============================================================================
// QUERY HEALTH
// =============================================================================

/**
 * Get the current health status of a provider.
 */
export function getHealthStatus(providerId: string): HealthStatus {
  const entry = healthStore.get(providerId);
  if (!entry) return 'healthy'; // Unknown providers are assumed healthy

  if (entry.consecutiveFailures >= UNHEALTHY_CONSECUTIVE_FAILURES) {
    return 'unhealthy';
  }

  const total = entry.successCount + entry.failureCount;
  if (total > 10 && entry.failureCount / total >= DEGRADED_FAILURE_RATE) {
    return 'degraded';
  }

  return 'healthy';
}

/**
 * Get a full health snapshot for a provider.
 */
export function getHealthSnapshot(providerId: string): ProviderHealthSnapshot {
  const entry = getOrCreateEntry(providerId);
  const latencies = entry.latencies;

  return {
    providerId,
    status: getHealthStatus(providerId),
    successCount: entry.successCount,
    failureCount: entry.failureCount,
    consecutiveFailures: entry.consecutiveFailures,
    avgLatencyMs: latencies.length > 0
      ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
      : 0,
    p95LatencyMs: calculateP95(latencies),
    lastSuccessAt: entry.lastSuccessAt,
    lastFailureAt: entry.lastFailureAt,
    lastCheckedAt: new Date(),
  };
}

/**
 * Get health snapshots for all tracked providers.
 */
export function getAllHealthSnapshots(): ProviderHealthSnapshot[] {
  return Array.from(healthStore.keys()).map(getHealthSnapshot);
}

/**
 * Get average latency for a provider.
 */
export function getAvgLatency(providerId: string): number {
  const entry = healthStore.get(providerId);
  if (!entry || entry.latencies.length === 0) return 0;
  return Math.round(
    entry.latencies.reduce((a, b) => a + b, 0) / entry.latencies.length
  );
}

/**
 * Reset health tracking for a provider (e.g., after config change).
 */
export function resetHealth(providerId: string): void {
  healthStore.delete(providerId);
}

// =============================================================================
// HELPERS
// =============================================================================

function getOrCreateEntry(providerId: string): HealthEntry {
  let entry = healthStore.get(providerId);
  if (!entry) {
    entry = {
      providerId,
      successCount: 0,
      failureCount: 0,
      consecutiveFailures: 0,
      latencies: [],
      lastSuccessAt: null,
      lastFailureAt: null,
    };
    healthStore.set(providerId, entry);
  }
  return entry;
}

function addLatency(entry: HealthEntry, latencyMs: number): void {
  entry.latencies.push(latencyMs);
  if (entry.latencies.length > MAX_LATENCY_SAMPLES) {
    entry.latencies.shift();
  }
}

function calculateP95(latencies: number[]): number {
  if (latencies.length === 0) return 0;
  const sorted = [...latencies].sort((a, b) => a - b);
  const idx = Math.ceil(sorted.length * 0.95) - 1;
  return sorted[Math.max(0, idx)];
}
