// =============================================================================
// Agent Configuration Service
// =============================================================================
// Full CRUD for enterprise agent configuration using Prisma Agent model.
// Manages agent profiles, provider bindings, voice settings, knowledge base
// associations, workflow bindings, and runtime limits.
//
// Multi-tenant: all operations are scoped to organizationId.
// =============================================================================

import { prisma } from '@server/lib/prisma';
import { Prisma } from '@prisma/client';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AgentCreateInput {
  name: string;
  description?: string;
  systemPrompt: string;
  greeting: string;
  voiceConfig: AgentVoiceConfig;
  knowledgeBaseIds?: string[];
  workflowId?: string;
  runtimeConfig?: AgentRuntimeConfig;
}

export interface AgentUpdateInput {
  name?: string;
  description?: string;
  systemPrompt?: string;
  greeting?: string;
  voiceConfig?: AgentVoiceConfig;
  knowledgeBaseIds?: string[];
  workflowId?: string | null;
  runtimeConfig?: AgentRuntimeConfig;
}

export interface AgentVoiceConfig {
  /** TTS voice identifier (e.g., 'nova', 'alloy') */
  voice: string;
  /** Playback speed multiplier (0.5-2.0) */
  speed: number;
  /** Audio format ('mp3', 'wav', 'opus') */
  format: string;
  /** Language code (e.g., 'en', 'hi') */
  language?: string;
  /** TTS model override */
  model?: string;
}

export interface AgentRuntimeConfig {
  /** LLM temperature (0-2) */
  temperature?: number;
  /** Maximum tokens per LLM response */
  maxTokens?: number;
  /** Maximum conversation turns */
  maxTurns?: number;
  /** Maximum session duration in seconds */
  maxSessionDurationSec?: number;
  /** Fallback message when agent can't respond */
  fallbackMessage?: string;
  /** STT provider override */
  sttProvider?: string;
  /** LLM provider override */
  llmProvider?: string;
  /** TTS provider override */
  ttsProvider?: string;
  /** LLM model override */
  llmModel?: string;
}

export interface AgentListFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AgentListResult {
  agents: AgentSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AgentSummary {
  id: string;
  name: string;
  description: string | null;
  status: string;
  activeCalls: number;
  totalCalls: number;
  avgCallDuration: number;
  successRate: number;
  workflowId: string | null;
  knowledgeBaseCount: number;
  deployedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentDetail extends AgentSummary {
  systemPrompt: string;
  greeting: string;
  voiceConfig: AgentVoiceConfig;
  knowledgeBaseIds: string[];
  runtimeConfig: AgentRuntimeConfig;
}

// =============================================================================
// LIST AGENTS
// =============================================================================

export async function listAgents(
  organizationId: string,
  filters: AgentListFilters = {}
): Promise<AgentListResult> {
  const { status, search, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.AgentWhereInput = {
    organizationId,
    deletedAt: null,
  };

  if (status) {
    where.status = status as Prisma.EnumAgentStatusFilter;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [agents, total] = await Promise.all([
    prisma.agent.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.agent.count({ where }),
  ]);

  return {
    agents: agents.map(mapAgentSummary),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// =============================================================================
// GET AGENT
// =============================================================================

export async function getAgent(
  agentId: string,
  organizationId: string
): Promise<AgentDetail | null> {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
  });

  if (!agent || agent.organizationId !== organizationId || agent.deletedAt) {
    return null;
  }

  return mapAgentDetail(agent);
}

// =============================================================================
// CREATE AGENT
// =============================================================================

export async function createAgent(
  organizationId: string,
  input: AgentCreateInput
): Promise<AgentDetail> {
  // Check agent limit
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { maxAgents: true },
  });

  if (org) {
    const currentCount = await prisma.agent.count({
      where: { organizationId, deletedAt: null },
    });

    if (currentCount >= org.maxAgents) {
      throw new AgentConfigError(
        'AGENT_LIMIT_REACHED',
        `Maximum agent limit (${org.maxAgents}) reached for this organization.`,
        422
      );
    }
  }

  // Validate knowledge base ownership
  if (input.knowledgeBaseIds && input.knowledgeBaseIds.length > 0) {
    await validateKnowledgeBaseOwnership(organizationId, input.knowledgeBaseIds);
  }

  // Validate workflow ownership
  if (input.workflowId) {
    await validateWorkflowOwnership(organizationId, input.workflowId);
  }

  const voiceConfig = buildVoiceConfigJson(input.voiceConfig, input.runtimeConfig);

  const agent = await prisma.agent.create({
    data: {
      organizationId,
      name: input.name,
      description: input.description,
      systemPrompt: input.systemPrompt,
      greeting: input.greeting,
      voiceConfig: voiceConfig as Prisma.InputJsonValue,
      knowledgeBaseIds: input.knowledgeBaseIds || [],
      workflowId: input.workflowId,
      status: 'draft',
    },
  });

  return mapAgentDetail(agent);
}

// =============================================================================
// UPDATE AGENT
// =============================================================================

export async function updateAgent(
  agentId: string,
  organizationId: string,
  input: AgentUpdateInput
): Promise<AgentDetail> {
  const existing = await prisma.agent.findUnique({
    where: { id: agentId },
  });

  if (!existing || existing.organizationId !== organizationId || existing.deletedAt) {
    throw new AgentConfigError('AGENT_NOT_FOUND', 'Agent not found.', 404);
  }

  // Validate knowledge base ownership
  if (input.knowledgeBaseIds && input.knowledgeBaseIds.length > 0) {
    await validateKnowledgeBaseOwnership(organizationId, input.knowledgeBaseIds);
  }

  // Validate workflow ownership
  if (input.workflowId) {
    await validateWorkflowOwnership(organizationId, input.workflowId);
  }

  const updateData: Prisma.AgentUpdateInput = {};

  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.systemPrompt !== undefined) updateData.systemPrompt = input.systemPrompt;
  if (input.greeting !== undefined) updateData.greeting = input.greeting;
  if (input.knowledgeBaseIds !== undefined) updateData.knowledgeBaseIds = input.knowledgeBaseIds;
  if (input.workflowId !== undefined) {
    updateData.workflow = input.workflowId
      ? { connect: { id: input.workflowId } }
      : { disconnect: true };
  }

  if (input.voiceConfig || input.runtimeConfig) {
    const existingVoiceConfig = existing.voiceConfig as Record<string, unknown>;
    const mergedVoiceConfig = {
      ...existingVoiceConfig,
      ...(input.voiceConfig || {}),
    };
    if (input.runtimeConfig) {
      Object.assign(mergedVoiceConfig, {
        providers: {
          ...(existingVoiceConfig?.providers as Record<string, unknown> || {}),
          ...(input.runtimeConfig.sttProvider ? { stt: { provider: input.runtimeConfig.sttProvider } } : {}),
          ...(input.runtimeConfig.llmProvider ? { llm: { provider: input.runtimeConfig.llmProvider, options: { model: input.runtimeConfig.llmModel, temperature: input.runtimeConfig.temperature, maxTokens: input.runtimeConfig.maxTokens } } } : {}),
          ...(input.runtimeConfig.ttsProvider ? { tts: { provider: input.runtimeConfig.ttsProvider } } : {}),
        },
        fallbackMessage: input.runtimeConfig.fallbackMessage,
        maxTurns: input.runtimeConfig.maxTurns,
        maxSessionDurationSec: input.runtimeConfig.maxSessionDurationSec,
      });
    }
    updateData.voiceConfig = mergedVoiceConfig as Prisma.InputJsonValue;
  }

  const agent = await prisma.agent.update({
    where: { id: agentId },
    data: updateData,
  });

  return mapAgentDetail(agent);
}

// =============================================================================
// DELETE AGENT (Soft Delete)
// =============================================================================

export async function deleteAgent(
  agentId: string,
  organizationId: string
): Promise<void> {
  const existing = await prisma.agent.findUnique({
    where: { id: agentId },
    select: { organizationId: true, status: true, deletedAt: true },
  });

  if (!existing || existing.organizationId !== organizationId || existing.deletedAt) {
    throw new AgentConfigError('AGENT_NOT_FOUND', 'Agent not found.', 404);
  }

  if (existing.status === 'active') {
    throw new AgentConfigError(
      'AGENT_ACTIVE',
      'Cannot delete an active agent. Deactivate it first.',
      422
    );
  }

  await prisma.agent.update({
    where: { id: agentId },
    data: {
      deletedAt: new Date(),
      status: 'inactive',
    },
  });
}

// =============================================================================
// HELPERS
// =============================================================================

async function validateKnowledgeBaseOwnership(
  organizationId: string,
  knowledgeBaseIds: string[]
): Promise<void> {
  const kbs = await prisma.knowledgeBase.findMany({
    where: {
      id: { in: knowledgeBaseIds },
      organizationId,
      deletedAt: null,
    },
    select: { id: true },
  });

  const foundIds = new Set(kbs.map((kb) => kb.id));
  const missing = knowledgeBaseIds.filter((id) => !foundIds.has(id));

  if (missing.length > 0) {
    throw new AgentConfigError(
      'KB_NOT_FOUND',
      `Knowledge bases not found or not owned by this organization: ${missing.join(', ')}`,
      422
    );
  }
}

async function validateWorkflowOwnership(
  organizationId: string,
  workflowId: string
): Promise<void> {
  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    select: { organizationId: true, deletedAt: true },
  });

  if (!workflow || workflow.organizationId !== organizationId || workflow.deletedAt) {
    throw new AgentConfigError(
      'WORKFLOW_NOT_FOUND',
      'Workflow not found or not owned by this organization.',
      422
    );
  }
}

function buildVoiceConfigJson(
  voiceConfig: AgentVoiceConfig,
  runtimeConfig?: AgentRuntimeConfig
): Record<string, unknown> {
  const config: Record<string, unknown> = {
    voice: voiceConfig.voice,
    speed: voiceConfig.speed,
    format: voiceConfig.format,
    language: voiceConfig.language || 'en',
    model: voiceConfig.model,
  };

  if (runtimeConfig) {
    config.providers = {};
    if (runtimeConfig.sttProvider) {
      (config.providers as Record<string, unknown>).stt = { provider: runtimeConfig.sttProvider };
    }
    if (runtimeConfig.llmProvider) {
      (config.providers as Record<string, unknown>).llm = {
        provider: runtimeConfig.llmProvider,
        options: {
          model: runtimeConfig.llmModel,
          temperature: runtimeConfig.temperature,
          maxTokens: runtimeConfig.maxTokens,
        },
      };
    }
    if (runtimeConfig.ttsProvider) {
      (config.providers as Record<string, unknown>).tts = { provider: runtimeConfig.ttsProvider };
    }
    if (runtimeConfig.fallbackMessage) config.fallbackMessage = runtimeConfig.fallbackMessage;
    if (runtimeConfig.maxTurns) config.maxTurns = runtimeConfig.maxTurns;
    if (runtimeConfig.maxSessionDurationSec) config.maxSessionDurationSec = runtimeConfig.maxSessionDurationSec;
  }

  return config;
}

function mapAgentSummary(agent: {
  id: string;
  name: string;
  description: string | null;
  status: string;
  activeCalls: number;
  totalCalls: number;
  avgCallDuration: number;
  successRate: number;
  workflowId: string | null;
  knowledgeBaseIds: string[];
  deployedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): AgentSummary {
  return {
    id: agent.id,
    name: agent.name,
    description: agent.description,
    status: agent.status,
    activeCalls: agent.activeCalls,
    totalCalls: agent.totalCalls,
    avgCallDuration: agent.avgCallDuration,
    successRate: agent.successRate,
    workflowId: agent.workflowId,
    knowledgeBaseCount: agent.knowledgeBaseIds?.length || 0,
    deployedAt: agent.deployedAt,
    createdAt: agent.createdAt,
    updatedAt: agent.updatedAt,
  };
}

function mapAgentDetail(agent: {
  id: string;
  name: string;
  description: string | null;
  status: string;
  systemPrompt: string;
  greeting: string;
  voiceConfig: unknown;
  knowledgeBaseIds: string[];
  workflowId: string | null;
  activeCalls: number;
  totalCalls: number;
  avgCallDuration: number;
  successRate: number;
  deployedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): AgentDetail {
  const vc = (agent.voiceConfig as Record<string, unknown>) || {};
  const providers = (vc.providers as Record<string, unknown>) || {};
  const llmOpts = ((providers.llm as Record<string, unknown>)?.options as Record<string, unknown>) || {};

  return {
    ...mapAgentSummary(agent),
    systemPrompt: agent.systemPrompt,
    greeting: agent.greeting,
    voiceConfig: {
      voice: (vc.voice as string) || 'nova',
      speed: (vc.speed as number) || 1.0,
      format: (vc.format as string) || 'mp3',
      language: (vc.language as string) || 'en',
      model: (vc.model as string) || undefined,
    },
    knowledgeBaseIds: agent.knowledgeBaseIds || [],
    runtimeConfig: {
      temperature: (llmOpts.temperature as number) || undefined,
      maxTokens: (llmOpts.maxTokens as number) || undefined,
      maxTurns: (vc.maxTurns as number) || undefined,
      maxSessionDurationSec: (vc.maxSessionDurationSec as number) || undefined,
      fallbackMessage: (vc.fallbackMessage as string) || undefined,
      sttProvider: ((providers.stt as Record<string, unknown>)?.provider as string) || undefined,
      llmProvider: ((providers.llm as Record<string, unknown>)?.provider as string) || undefined,
      ttsProvider: ((providers.tts as Record<string, unknown>)?.provider as string) || undefined,
      llmModel: (llmOpts.model as string) || undefined,
    },
  };
}

// =============================================================================
// Agent Config Error
// =============================================================================

export class AgentConfigError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, message: string, statusCode = 500) {
    super(message);
    this.name = 'AgentConfigError';
    this.code = code;
    this.statusCode = statusCode;
  }
}
