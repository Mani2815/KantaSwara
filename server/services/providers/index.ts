// =============================================================================
// Provider Barrel Exports
// =============================================================================

// ── STT Providers ───────────────────────────────────────────────────────────
export { OpenAIWhisperSTTProvider } from './stt/openai-whisper.provider';
export { DeepgramSTTProvider } from './stt/deepgram.provider';

// ── LLM Providers ───────────────────────────────────────────────────────────
export { OpenAILLMProvider } from './llm/openai.provider';
export { GroqLLMProvider } from './llm/groq.provider';

// ── TTS Providers ───────────────────────────────────────────────────────────
export { OpenAITTSProvider } from './tts/openai-tts.provider';
export { ElevenLabsTTSProvider } from './tts/elevenlabs.provider';

// ── Health & Failover ───────────────────────────────────────────────────────
export { CircuitBreaker, CircuitOpenError } from './health/circuit-breaker';
export type { CircuitState, CircuitBreakerConfig } from './health/circuit-breaker';

export {
  recordSuccess,
  recordFailure,
  getHealthStatus,
  getHealthSnapshot,
  getAllHealthSnapshots,
  getAvgLatency,
  resetHealth,
} from './health/provider-health.service';
export type { HealthStatus, ProviderHealthSnapshot } from './health/provider-health.service';

export {
  setFailoverChain,
  getFailoverChain,
  executeWithFailover,
  getCircuitState,
  resetCircuitBreaker,
  AllProvidersFailedError,
} from './failover/failover-manager.service';
export type {
  RoutingStrategy,
  FailoverChainEntry,
  FailoverResult,
} from './failover/failover-manager.service';

// ── Types ───────────────────────────────────────────────────────────────────
export type {
  STTProvider,
  STTResult,
  STTOptions,
  LLMProvider,
  LLMMessage,
  LLMResponse,
  LLMStreamChunk,
  LLMOptions,
  TTSProvider,
  TTSResult,
  TTSOptions,
  TelephonyProvider,
  ProviderConfig,
} from './types';
