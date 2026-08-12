// =============================================================================
// Runtime — Barrel Exports
// =============================================================================

// ── Types ───────────────────────────────────────────────────────────────────
export type {
  VoiceSession,
  VoiceSessionState,
  RuntimeContext,
  RuntimeMessageInput,
  RuntimeMessageOutput,
  RuntimeMessage,
  SessionMetrics,
  SessionConstraints,
  VoiceConfig,
  ExtendedPromptParams,
} from './runtime.types';

export {
  ACTIVE_SESSION_STATES,
  TERMINAL_SESSION_STATES,
  PLATFORM_DEFAULTS,
} from './runtime.types';

// ── Provider Registry ───────────────────────────────────────────────────────
export {
  registerSTTProvider,
  registerLLMProvider,
  registerTTSProvider,
  getSTTProvider,
  getLLMProvider,
  getTTSProvider,
  getRegisteredProviders,
  clearProviderCache,
} from './provider-registry.service';

// ── Session Manager ─────────────────────────────────────────────────────────
export {
  createSession,
  getSession,
  getSessionByToken,
  updateSessionState,
  recordTurn,
  endSession,
  validateSession,
  getActiveSessionCount,
  getActiveSessionCountForOrg,
  SessionError,
} from './session-manager.service';

// ── Conversation Manager ────────────────────────────────────────────────────
export {
  addMessage as addRuntimeMessage,
  getHistory as getRuntimeHistory,
  getPromptHistory as getRuntimePromptHistory,
  replaceOlderWithSummary,
  clearSessionCache as clearRuntimeSessionCache,
  getActiveCacheCount as getRuntimeActiveCacheCount,
} from './conversation-manager.service';

// ── Memory Manager ──────────────────────────────────────────────────────────
export {
  getContextWindow,
  shouldSummarize,
  summarizeOlderMessages,
} from './memory-manager.service';
export type { MemoryConfig } from './memory-manager.service';

// ── Prompt Assembler ────────────────────────────────────────────────────────
export {
  assembleExtendedPrompt,
  buildOrganizationContext,
  buildRuntimeContext as buildRuntimeContextMetadata,
} from './prompt-assembler.service';

// ── Streaming ───────────────────────────────────────────────────────────────
export {
  streamLLMResponse,
  generateNonStreaming,
} from './streaming.service';
export type { SSEController, StreamingResult } from './streaming.service';

// ── Voice Runtime ───────────────────────────────────────────────────────────
export {
  processMessage,
  processMessageStreaming,
  RuntimeError,
} from './voice-runtime.service';

// ── Agent Runtime Loader ────────────────────────────────────────────────────
export {
  loadAgentRuntime,
  validateAgentOwnership,
  AgentLoaderError,
} from './agent-runtime-loader.service';

// ── Runtime Context Builder ─────────────────────────────────────────────────
export {
  buildRuntimeContext,
  buildDemoRuntimeContext,
} from './runtime-context.service';
export type { AgentData, OrganizationData } from './runtime-context.service';
