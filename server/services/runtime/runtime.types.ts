// =============================================================================
// Voice Runtime — Core Type Definitions
// =============================================================================
// Shared types for the enterprise voice runtime layer.
// Used by SessionManager, VoiceRuntime, ConversationManager, MemoryManager,
// PromptAssembler, AgentRuntimeLoader, and RuntimeContextBuilder.
// =============================================================================

import type { LLMOptions, STTOptions, TTSOptions } from '../providers/types';

// ─────────────────────────────────────────────────────────────────────────────
// Voice Session States
// ─────────────────────────────────────────────────────────────────────────────

export type VoiceSessionState =
  | 'pending'
  | 'connecting'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'expired';

/** States that represent an active (non-terminal) session */
export const ACTIVE_SESSION_STATES: VoiceSessionState[] = [
  'pending',
  'connecting',
  'listening',
  'thinking',
  'speaking',
  'paused',
];

/** States that represent a terminal (ended) session */
export const TERMINAL_SESSION_STATES: VoiceSessionState[] = [
  'completed',
  'failed',
  'expired',
];

// ─────────────────────────────────────────────────────────────────────────────
// Voice Session
// ─────────────────────────────────────────────────────────────────────────────

export interface VoiceSession {
  id: string;
  organizationId: string;
  agentId: string;
  sessionToken: string;
  state: VoiceSessionState;
  callerIdentifier?: string;
  startedAt: Date;
  endedAt?: Date | null;
  durationSeconds: number;
  turnCount: number;
  totalTokens: number;
  estimatedCost: number;
  avgLatencyMs: number;
  summary?: string | null;
  metadata: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Runtime Context — passed to every downstream service
// ─────────────────────────────────────────────────────────────────────────────

export interface RuntimeContext {
  /** Organization details */
  organization: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    settings: Record<string, unknown>;
    isActive: boolean;
  };

  /** Agent details */
  agent: {
    id: string;
    name: string;
    description?: string | null;
    status: string;
    systemPrompt: string;
    greeting: string;
    voiceConfig: VoiceConfig;
    knowledgeBaseIds: string[];
    workflowId?: string | null;
  };

  /** Provider configuration */
  providers: {
    stt: { provider: string; options?: STTOptions };
    llm: { provider: string; options?: LLMOptions };
    tts: { provider: string; options?: TTSOptions };
  };

  /** Session constraints */
  constraints: SessionConstraints;

  /** Feature flags */
  features: {
    knowledgeEnabled: boolean;
    streamingEnabled: boolean;
    workflowEnabled: boolean;
    memorySummarization: boolean;
  };

  /** Usage limits from subscription */
  usageLimits: {
    maxConcurrentSessions: number;
    maxSessionDurationSec: number;
    maxTurns: number;
    maxTokensPerSession: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Voice Configuration
// ─────────────────────────────────────────────────────────────────────────────

export interface VoiceConfig {
  voice: string;
  speed: number;
  format: string;
  language?: string;
  model?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Session Constraints
// ─────────────────────────────────────────────────────────────────────────────

export interface SessionConstraints {
  maxSessionDurationSec: number;
  maxTurns: number;
  maxConcurrentSessions: number;
  maxContextMessages: number;
  maxContextTokens: number;
  idleTimeoutSec: number;
  summarizeAfterMessages: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Session Metrics
// ─────────────────────────────────────────────────────────────────────────────

export interface SessionMetrics {
  sttLatencyMs: number;
  llmLatencyMs: number;
  ttsLatencyMs: number;
  totalLatencyMs: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Runtime Message Input / Output
// ─────────────────────────────────────────────────────────────────────────────

export interface RuntimeMessageInput {
  /** Text input from the user */
  text?: string;
  /** Base64-encoded audio from user */
  audio?: string;
  /** MIME type of the audio */
  audioMimeType?: string;
}

export interface RuntimeMessageOutput {
  messageId: string;
  /** Transcribed user text (from STT if audio input) */
  userText: string;
  /** Agent's text response */
  agentText: string;
  /** Base64-encoded audio response */
  audio?: string;
  /** MIME type of audio response */
  audioMimeType?: string;
  /** Per-step latency metrics */
  metrics: SessionMetrics;
  /** Current turn count */
  turnCount: number;
  /** Whether the session should end */
  shouldEnd: boolean;
  /** Reason for ending */
  endReason?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Conversation Message (generic, provider-independent)
// ─────────────────────────────────────────────────────────────────────────────

export interface RuntimeMessage {
  id: string;
  sessionId: string;
  speaker: 'user' | 'agent' | 'system';
  text: string;
  role?: 'user' | 'assistant' | 'system';
  processingMs?: number;
  tokensUsed?: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// Extended Prompt Assembly Parameters
// ─────────────────────────────────────────────────────────────────────────────

export interface ExtendedPromptParams {
  /** Core system prompt defining agent persona */
  systemPrompt: string;
  /** Organization context (name, industry, policies) */
  organizationContext?: string;
  /** Knowledge context (RAG-retrieved chunks) */
  knowledgeContext?: string;
  /** Conversation history (memory-managed window) */
  history: Array<{ speaker: 'user' | 'agent' | 'system'; text: string }>;
  /** Current user message */
  userMessage: string;
  /** Runtime context (current time, session info) */
  runtimeContext?: string;
  /** Maximum context messages (sliding window) */
  maxContextMessages?: number;
  /** Maximum token budget for the entire prompt */
  maxTokenBudget?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Platform Defaults
// ─────────────────────────────────────────────────────────────────────────────

export const PLATFORM_DEFAULTS: {
  constraints: SessionConstraints;
  providers: RuntimeContext['providers'];
  features: RuntimeContext['features'];
} = {
  constraints: {
    maxSessionDurationSec: 600,
    maxTurns: 50,
    maxConcurrentSessions: 10,
    maxContextMessages: 20,
    maxContextTokens: 4096,
    idleTimeoutSec: 120,
    summarizeAfterMessages: 15,
  },
  providers: {
    stt: { provider: 'openai-whisper' },
    llm: { provider: 'openai', options: { model: 'gpt-4o-mini', temperature: 0.7, maxTokens: 512 } },
    tts: { provider: 'openai-tts' },
  },
  features: {
    knowledgeEnabled: false,
    streamingEnabled: true,
    workflowEnabled: false,
    memorySummarization: true,
  },
};
