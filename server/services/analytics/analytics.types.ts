// =============================================================================
// Analytics Engine — Type Definitions
// =============================================================================
// Types for session, agent, provider, and organization analytics.
// All queries are multi-tenant scoped by organizationId.
// =============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// Time Ranges & Aggregation
// ─────────────────────────────────────────────────────────────────────────────

export type MetricTimeRange = '1h' | '24h' | '7d' | '30d' | '90d' | 'custom';

export type AggregationType = 'sum' | 'avg' | 'min' | 'max' | 'count';

export interface TimeRangeFilter {
  range: MetricTimeRange;
  /** Required when range is 'custom' */
  startDate?: Date;
  endDate?: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// Session Analytics
// ─────────────────────────────────────────────────────────────────────────────

export interface SessionAnalyticsRecord {
  sessionId: string;
  organizationId: string;
  agentId: string;
  startedAt: Date;
  endedAt: Date | null;
  durationSeconds: number;
  turnCount: number;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  estimatedCost: number;
  avgLatencyMs: number;
  sttLatencyMs: number;
  llmLatencyMs: number;
  ttsLatencyMs: number;
  sttProvider: string;
  llmProvider: string;
  ttsProvider: string;
  endReason: string | null;
  hadFailover: boolean;
  workflowId: string | null;
  toolsUsed: string[];
  errorCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Agent Analytics
// ─────────────────────────────────────────────────────────────────────────────

export interface AgentAnalytics {
  agentId: string;
  agentName: string;
  totalSessions: number;
  activeSessions: number;
  avgSessionDuration: number;
  avgTurnsPerSession: number;
  avgLatencyMs: number;
  totalTokens: number;
  totalCost: number;
  successRate: number;
  errorRate: number;
  topEndReasons: Array<{ reason: string; count: number }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider Analytics
// ─────────────────────────────────────────────────────────────────────────────

export interface ProviderAnalytics {
  providerId: string;
  providerType: 'stt' | 'llm' | 'tts';
  totalCalls: number;
  successCount: number;
  failureCount: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  totalTokens: number;
  totalCost: number;
  failoverCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Organization Dashboard
// ─────────────────────────────────────────────────────────────────────────────

export interface OrganizationDashboard {
  organizationId: string;
  timeRange: TimeRangeFilter;
  totalSessions: number;
  totalTokens: number;
  totalCost: number;
  avgSessionDuration: number;
  avgLatencyMs: number;
  activeAgents: number;
  errorRate: number;
  agentBreakdown: AgentAnalytics[];
  providerBreakdown: ProviderAnalytics[];
  dailyTrend: Array<{
    date: string;
    sessions: number;
    tokens: number;
    cost: number;
  }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Analytics Query
// ─────────────────────────────────────────────────────────────────────────────

export interface AnalyticsQuery {
  organizationId: string;
  timeRange: TimeRangeFilter;
  agentId?: string;
  providerId?: string;
  page?: number;
  limit?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Cost Models
// ─────────────────────────────────────────────────────────────────────────────

export interface ProviderCostModel {
  providerId: string;
  /** Cost per 1K input tokens */
  inputCostPer1k: number;
  /** Cost per 1K output tokens */
  outputCostPer1k: number;
  /** Cost per minute of audio (STT) */
  audioCostPerMinute?: number;
  /** Cost per 1K characters (TTS) */
  charCostPer1k?: number;
}

export const PROVIDER_COST_MODELS: Record<string, ProviderCostModel> = {
  'openai': {
    providerId: 'openai',
    inputCostPer1k: 0.00015,
    outputCostPer1k: 0.0006,
  },
  'groq': {
    providerId: 'groq',
    inputCostPer1k: 0.00005,
    outputCostPer1k: 0.00008,
  },
  'openai-whisper': {
    providerId: 'openai-whisper',
    inputCostPer1k: 0,
    outputCostPer1k: 0,
    audioCostPerMinute: 0.006,
  },
  'deepgram': {
    providerId: 'deepgram',
    inputCostPer1k: 0,
    outputCostPer1k: 0,
    audioCostPerMinute: 0.0043,
  },
  'openai-tts': {
    providerId: 'openai-tts',
    inputCostPer1k: 0,
    outputCostPer1k: 0,
    charCostPer1k: 0.015,
  },
  'elevenlabs': {
    providerId: 'elevenlabs',
    inputCostPer1k: 0,
    outputCostPer1k: 0,
    charCostPer1k: 0.03,
  },
};
