// =============================================================================
// Failover Manager
// =============================================================================
// Manages ordered failover chains for STT, LLM, and TTS providers.
// Integrates with health monitoring and circuit breakers to route calls
// to the healthiest, cheapest, or fastest available provider.
//
// Usage:
//   const result = await failoverManager.executeWithFailover('llm', messages, options);
// =============================================================================

import type { ProviderType } from '../types';
import { CircuitBreaker, CircuitOpenError } from '../health/circuit-breaker';
import * as healthMonitor from '../health/provider-health.service';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type RoutingStrategy = 'priority' | 'cost' | 'latency';

export interface FailoverChainEntry {
  providerId: string;
  /** Priority order (lower = higher priority) */
  priority: number;
  /** Cost per 1K tokens (for cost routing) */
  costPer1kTokens: number;
}

export interface FailoverResult<T> {
  result: T;
  providerId: string;
  attemptCount: number;
  totalLatencyMs: number;
  failedProviders: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Storage
// ─────────────────────────────────────────────────────────────────────────────

/** Failover chains per provider type */
const chains = new Map<ProviderType, FailoverChainEntry[]>();

/** Circuit breakers per provider ID */
const breakers = new Map<string, CircuitBreaker>();

// =============================================================================
// CONFIGURE CHAINS
// =============================================================================

/**
 * Set the failover chain for a provider type.
 * Entries are ordered by priority (lowest first).
 */
export function setFailoverChain(
  type: ProviderType,
  entries: FailoverChainEntry[]
): void {
  chains.set(type, [...entries].sort((a, b) => a.priority - b.priority));
}

/**
 * Get the failover chain for a provider type.
 */
export function getFailoverChain(type: ProviderType): FailoverChainEntry[] {
  return chains.get(type) || [];
}

// =============================================================================
// EXECUTE WITH FAILOVER
// =============================================================================

/**
 * Execute a function against providers in the failover chain.
 * Tries each provider in order until one succeeds.
 *
 * @param type - Provider type (stt, llm, tts)
 * @param fn - Function to execute, receives provider ID
 * @param preferredProvider - Optional preferred provider to try first
 * @param strategy - Routing strategy (default: priority)
 */
export async function executeWithFailover<T>(
  type: ProviderType,
  fn: (providerId: string) => Promise<T>,
  preferredProvider?: string,
  strategy: RoutingStrategy = 'priority'
): Promise<FailoverResult<T>> {
  const chain = getOrderedChain(type, strategy);
  const startTime = Date.now();
  const failedProviders: string[] = [];
  const errors: Error[] = [];
  let attemptCount = 0;

  // If a preferred provider is specified and healthy, try it first
  if (preferredProvider) {
    const preferredEntry = chain.find((e) => e.providerId === preferredProvider);
    if (preferredEntry) {
      // Move preferred to front
      const reordered = [
        preferredEntry,
        ...chain.filter((e) => e.providerId !== preferredProvider),
      ];
      chain.length = 0;
      chain.push(...reordered);
    }
  }

  for (const entry of chain) {
    const breaker = getOrCreateBreaker(entry.providerId);
    attemptCount++;

    try {
      const callStart = Date.now();
      const result = await breaker.execute(() => fn(entry.providerId));
      const latencyMs = Date.now() - callStart;

      // Record success
      healthMonitor.recordSuccess(entry.providerId, latencyMs);

      return {
        result,
        providerId: entry.providerId,
        attemptCount,
        totalLatencyMs: Date.now() - startTime,
        failedProviders,
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      
      if (error instanceof Error) {
        errors.push(error);
      }

      if (error instanceof CircuitOpenError) {
        // Circuit is open — skip this provider
        failedProviders.push(entry.providerId);
        continue;
      }

      // Record failure
      healthMonitor.recordFailure(entry.providerId, latencyMs);
      failedProviders.push(entry.providerId);

      console.warn(
        `[FailoverManager] Provider "${entry.providerId}" failed (attempt ${attemptCount}):`,
        error instanceof Error ? error.message : error
      );
    }
  }

  // All providers failed
  throw new AllProvidersFailedError(type, failedProviders, errors);
}

// =============================================================================
// CIRCUIT BREAKER MANAGEMENT
// =============================================================================

function getOrCreateBreaker(providerId: string): CircuitBreaker {
  let breaker = breakers.get(providerId);
  if (!breaker) {
    breaker = new CircuitBreaker(providerId);
    breakers.set(providerId, breaker);
  }
  return breaker;
}

/**
 * Get the circuit breaker state for a provider.
 */
export function getCircuitState(
  providerId: string
): { state: string; providerId: string } {
  const breaker = breakers.get(providerId);
  return {
    providerId,
    state: breaker ? breaker.getState() : 'closed',
  };
}

/**
 * Manually reset a circuit breaker (e.g., after fixing provider config).
 */
export function resetCircuitBreaker(providerId: string): void {
  const breaker = breakers.get(providerId);
  if (breaker) breaker.reset();
  healthMonitor.resetHealth(providerId);
}

// =============================================================================
// ORDERING
// =============================================================================

function getOrderedChain(
  type: ProviderType,
  strategy: RoutingStrategy
): FailoverChainEntry[] {
  const chain = [...(chains.get(type) || [])];

  switch (strategy) {
    case 'cost':
      return chain.sort((a, b) => a.costPer1kTokens - b.costPer1kTokens);
    case 'latency':
      return chain.sort((a, b) => {
        const latA = healthMonitor.getAvgLatency(a.providerId);
        const latB = healthMonitor.getAvgLatency(b.providerId);
        return latA - latB;
      });
    case 'priority':
    default:
      return chain; // Already sorted by priority
  }
}

// =============================================================================
// Error
// =============================================================================

export class AllProvidersFailedError extends Error {
  readonly providerType: ProviderType;
  readonly failedProviders: string[];
  readonly errors: Error[];

  constructor(type: ProviderType, failedProviders: string[], errors: Error[]) {
    super(
      `All ${type} providers failed: ${failedProviders.join(', ')}. ` +
      `Last error: ${errors.length > 0 ? errors[errors.length - 1].message : 'Unknown'}`
    );
    this.name = 'AllProvidersFailedError';
    this.providerType = type;
    this.failedProviders = failedProviders;
    this.errors = errors;
  }
}
