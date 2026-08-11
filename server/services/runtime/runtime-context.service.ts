// =============================================================================
// Runtime Context Builder
// =============================================================================
// Constructs a RuntimeContext from loaded agent + organization data.
// Merges platform defaults with org settings and agent config.
// Also provides a "demo" context builder for backward compatibility.
// =============================================================================

import type { RuntimeContext, VoiceConfig, SessionConstraints } from './runtime.types';
import { PLATFORM_DEFAULTS } from './runtime.types';
import { DEMO_AGENT_CONFIG } from '../demo/demo.config';

// ─────────────────────────────────────────────────────────────────────────────
// Build RuntimeContext from Agent + Organization data
// ─────────────────────────────────────────────────────────────────────────────

export interface AgentData {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  systemPrompt: string;
  greeting: string;
  voiceConfig: Record<string, unknown>;
  knowledgeBaseIds: string[];
  workflowId?: string | null;
}

export interface OrganizationData {
  id: string;
  name: string;
  slug: string;
  plan: string;
  settings: Record<string, unknown>;
  isActive: boolean;
  maxConcurrentCalls: number;
  maxAgents: number;
}

/**
 * Build a RuntimeContext from agent and organization data.
 * Applies configuration precedence: Platform Default → Org Default → Agent Override.
 */
export function buildRuntimeContext(
  agent: AgentData,
  organization: OrganizationData,
  overrides?: Partial<RuntimeContext>
): RuntimeContext {
  // ── Resolve voice config ────────────────────────────────────────────────
  const voiceConfig: VoiceConfig = {
    voice: (agent.voiceConfig?.voice as string) || 'nova',
    speed: (agent.voiceConfig?.speed as number) || 1.0,
    format: (agent.voiceConfig?.format as string) || 'mp3',
    language: (agent.voiceConfig?.language as string) || 'en',
    model: (agent.voiceConfig?.model as string) || undefined,
  };

  // ── Resolve constraints (platform defaults + org overrides) ─────────────
  const orgConstraints = (organization.settings?.constraints || {}) as Partial<SessionConstraints>;
  const constraints: SessionConstraints = {
    ...PLATFORM_DEFAULTS.constraints,
    ...orgConstraints,
    maxConcurrentSessions: organization.maxConcurrentCalls || PLATFORM_DEFAULTS.constraints.maxConcurrentSessions,
  };

  // ── Resolve providers ───────────────────────────────────────────────────
  const orgProviders = (organization.settings?.providers || {}) as Partial<RuntimeContext['providers']>;
  const agentProviders = (agent.voiceConfig?.providers || {}) as Partial<RuntimeContext['providers']>;
  const providers: RuntimeContext['providers'] = {
    stt: { ...PLATFORM_DEFAULTS.providers.stt, ...orgProviders?.stt, ...agentProviders?.stt },
    llm: { ...PLATFORM_DEFAULTS.providers.llm, ...orgProviders?.llm, ...agentProviders?.llm },
    tts: { ...PLATFORM_DEFAULTS.providers.tts, ...orgProviders?.tts, ...agentProviders?.tts },
  };

  // ── Resolve features ────────────────────────────────────────────────────
  const orgFeatures = (organization.settings?.features || {}) as Partial<RuntimeContext['features']>;
  const features: RuntimeContext['features'] = {
    ...PLATFORM_DEFAULTS.features,
    ...orgFeatures,
    knowledgeEnabled: agent.knowledgeBaseIds.length > 0,
    workflowEnabled: !!agent.workflowId,
  };

  // ── Build context ───────────────────────────────────────────────────────
  const context: RuntimeContext = {
    organization: {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      plan: organization.plan,
      settings: organization.settings,
      isActive: organization.isActive,
    },
    agent: {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      status: agent.status,
      systemPrompt: agent.systemPrompt,
      greeting: agent.greeting,
      voiceConfig,
      knowledgeBaseIds: agent.knowledgeBaseIds,
      workflowId: agent.workflowId,
    },
    providers,
    constraints,
    features,
    usageLimits: {
      maxConcurrentSessions: constraints.maxConcurrentSessions,
      maxSessionDurationSec: constraints.maxSessionDurationSec,
      maxTurns: constraints.maxTurns,
      maxTokensPerSession: constraints.maxContextTokens * 10, // Rough estimate
    },
    ...overrides,
  };

  return context;
}

// ─────────────────────────────────────────────────────────────────────────────
// Build Demo RuntimeContext (backward compatibility)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a RuntimeContext for the public demo.
 * Uses the hardcoded DEMO_AGENT_CONFIG to create a context
 * that the runtime can use, preserving demo behavior.
 */
export function buildDemoRuntimeContext(): RuntimeContext {
  const config = DEMO_AGENT_CONFIG;

  return {
    organization: {
      id: 'demo',
      name: 'KantaSwara Demo',
      slug: 'demo',
      plan: 'demo',
      settings: {},
      isActive: true,
    },
    agent: {
      id: 'demo-rani',
      name: config.name,
      description: config.persona,
      status: 'active',
      systemPrompt: config.systemPrompt,
      greeting: config.greeting,
      voiceConfig: {
        voice: config.tts.voice,
        speed: config.tts.speed,
        format: config.tts.format,
      },
      knowledgeBaseIds: [],
      workflowId: null,
    },
    providers: {
      stt: { provider: config.providers.stt },
      llm: {
        provider: config.providers.llm,
        options: {
          model: config.llm.model,
          temperature: config.llm.temperature,
          maxTokens: config.llm.maxTokens,
          topP: config.llm.topP,
        },
      },
      tts: { provider: config.providers.tts },
    },
    constraints: {
      maxSessionDurationSec: config.constraints.maxSessionDurationSec,
      maxTurns: config.constraints.maxTurns,
      maxConcurrentSessions: config.constraints.maxConcurrentSessions,
      maxContextMessages: config.constraints.maxContextMessages,
      maxContextTokens: 4096,
      idleTimeoutSec: config.constraints.idleTimeoutSec,
      summarizeAfterMessages: 15,
    },
    features: {
      knowledgeEnabled: false,
      streamingEnabled: true,
      workflowEnabled: false,
      memorySummarization: false, // Demo sessions are short, no need
    },
    usageLimits: {
      maxConcurrentSessions: config.constraints.maxConcurrentSessions,
      maxSessionDurationSec: config.constraints.maxSessionDurationSec,
      maxTurns: config.constraints.maxTurns,
      maxTokensPerSession: 40960,
    },
  };
}
