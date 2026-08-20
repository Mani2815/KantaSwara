// =============================================================================
// Circuit Breaker
// =============================================================================
// Classic circuit breaker pattern: closed → open → half-open.
// Wraps provider calls and trips on consecutive failures.
//
// States:
//   CLOSED   — normal operation, calls pass through
//   OPEN     — circuit tripped, all calls fail immediately
//   HALF_OPEN — trial mode, one call allowed to test recovery
// =============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type CircuitState = 'closed' | 'open' | 'half_open';

export interface CircuitBreakerConfig {
  /** Number of consecutive failures before opening the circuit */
  failureThreshold: number;
  /** Milliseconds to wait before transitioning from open → half_open */
  resetTimeoutMs: number;
  /** Number of successes in half_open required to close the circuit */
  halfOpenSuccessThreshold: number;
}

export const DEFAULT_CIRCUIT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 3,
  resetTimeoutMs: 30000, // 30 seconds
  halfOpenSuccessThreshold: 2,
};

// =============================================================================
// CIRCUIT BREAKER CLASS
// =============================================================================

export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private consecutiveFailures = 0;
  private halfOpenSuccesses = 0;
  private lastFailureTime = 0;
  private config: CircuitBreakerConfig;
  readonly providerId: string;

  constructor(providerId: string, config?: Partial<CircuitBreakerConfig>) {
    this.providerId = providerId;
    this.config = { ...DEFAULT_CIRCUIT_CONFIG, ...config };
  }

  /**
   * Execute a function through the circuit breaker.
   * Throws CircuitOpenError if the circuit is open.
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit should transition from open → half_open
    if (this.state === 'open') {
      const elapsed = Date.now() - this.lastFailureTime;
      if (elapsed >= this.config.resetTimeoutMs) {
        this.state = 'half_open';
        this.halfOpenSuccesses = 0;
      } else {
        throw new CircuitOpenError(
          this.providerId,
          this.config.resetTimeoutMs - elapsed
        );
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Get the current circuit state.
   */
  getState(): CircuitState {
    // Auto-transition from open → half_open if timeout elapsed
    if (this.state === 'open') {
      const elapsed = Date.now() - this.lastFailureTime;
      if (elapsed >= this.config.resetTimeoutMs) {
        this.state = 'half_open';
        this.halfOpenSuccesses = 0;
      }
    }
    return this.state;
  }

  /**
   * Manually reset the circuit breaker to closed state.
   */
  reset(): void {
    this.state = 'closed';
    this.consecutiveFailures = 0;
    this.halfOpenSuccesses = 0;
  }

  // ── Internal ────────────────────────────────────────────────────────────

  private onSuccess(): void {
    if (this.state === 'half_open') {
      this.halfOpenSuccesses++;
      if (this.halfOpenSuccesses >= this.config.halfOpenSuccessThreshold) {
        this.state = 'closed';
        this.consecutiveFailures = 0;
      }
    } else {
      this.consecutiveFailures = 0;
    }
  }

  private onFailure(): void {
    this.consecutiveFailures++;
    this.lastFailureTime = Date.now();

    if (this.state === 'half_open') {
      // Half-open failure → back to open
      this.state = 'open';
    } else if (this.consecutiveFailures >= this.config.failureThreshold) {
      this.state = 'open';
    }
  }
}

// =============================================================================
// Circuit Open Error
// =============================================================================

export class CircuitOpenError extends Error {
  readonly providerId: string;
  readonly retryAfterMs: number;

  constructor(providerId: string, retryAfterMs: number) {
    super(
      `Circuit breaker open for provider "${providerId}". ` +
      `Retry after ${Math.ceil(retryAfterMs / 1000)}s.`
    );
    this.name = 'CircuitOpenError';
    this.providerId = providerId;
    this.retryAfterMs = retryAfterMs;
  }
}
