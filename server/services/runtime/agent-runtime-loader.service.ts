// =============================================================================
// Agent Runtime Loader
// =============================================================================
// Loads and validates agent configuration into a RuntimeContext.
// Enforces deployment validation, multi-tenant isolation, and status checks.
// Only loads active, deployed agents belonging to the requesting org.
// =============================================================================

import { prisma } from '@server/lib/prisma';
import type { RuntimeContext } from './runtime.types';
import { buildRuntimeContext } from './runtime-context.service';
import type { AgentData, OrganizationData } from './runtime-context.service';

// =============================================================================
// LOAD AGENT RUNTIME
// =============================================================================

/**
 * Load a complete RuntimeContext for an agent.
 * Validates organization status, agent status, deployment state,
 * and multi-tenant isolation.
 *
 * @throws AgentLoaderError if validation fails
 */
export async function loadAgentRuntime(
  agentId: string,
  organizationId: string
): Promise<RuntimeContext> {
  // ── Load organization ───────────────────────────────────────────────────
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      settings_rel: true,
    },
  });

  if (!org) {
    throw new AgentLoaderError('ORG_NOT_FOUND', 'Organization not found.', 404);
  }

  if (!org.isActive) {
    throw new AgentLoaderError(
      'ORG_INACTIVE',
      'Organization is not active.',
      403
    );
  }

  if (org.status !== 'active' && org.approvalStatus !== 'approved') {
    throw new AgentLoaderError(
      'ORG_NOT_APPROVED',
      'Organization is not approved for use.',
      403
    );
  }

  // ── Load agent ──────────────────────────────────────────────────────────
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
  });

  if (!agent) {
    throw new AgentLoaderError('AGENT_NOT_FOUND', 'Agent not found.', 404);
  }

  // ── Multi-tenant isolation ──────────────────────────────────────────────
  if (agent.organizationId !== organizationId) {
    throw new AgentLoaderError(
      'FORBIDDEN',
      'Agent does not belong to this organization.',
      403
    );
  }

  // ── Deployment validation ───────────────────────────────────────────────
  validateAgentStatus(agent.status, agent.deployedAt);

  // ── Build RuntimeContext ────────────────────────────────────────────────
  const orgSettings = org.settings_rel?.[0];

  const agentData: AgentData = {
    id: agent.id,
    name: agent.name,
    description: agent.description,
    status: agent.status,
    systemPrompt: agent.systemPrompt,
    greeting: agent.greeting,
    voiceConfig: agent.voiceConfig as Record<string, unknown>,
    knowledgeBaseIds: agent.knowledgeBaseIds || [],
    workflowId: agent.workflowId,
  };

  const organizationData: OrganizationData = {
    id: org.id,
    name: org.name,
    slug: org.slug,
    plan: org.plan,
    settings: {
      ...(org.settings as Record<string, unknown> || {}),
      timezone: orgSettings?.timezone,
      language: orgSettings?.language,
    },
    isActive: org.isActive,
    maxConcurrentCalls: org.maxConcurrentCalls,
    maxAgents: org.maxAgents,
  };

  return buildRuntimeContext(agentData, organizationData);
}

// =============================================================================
// VALIDATE AGENT STATUS
// =============================================================================

/**
 * Validate that an agent is eligible to be loaded into the runtime.
 * Only active, deployed agents are allowed.
 */
function validateAgentStatus(status: string, deployedAt: Date | null): void {
  // Reject draft agents
  if (status === 'draft') {
    throw new AgentLoaderError(
      'AGENT_DRAFT',
      'This agent is still in draft status and cannot be used.',
      422
    );
  }

  // Reject error agents
  if (status === 'error') {
    throw new AgentLoaderError(
      'AGENT_ERROR',
      'This agent is in an error state and cannot be used.',
      422
    );
  }

  // Reject inactive agents
  if (status === 'inactive') {
    throw new AgentLoaderError(
      'AGENT_INACTIVE',
      'This agent is inactive and cannot be used.',
      422
    );
  }

  // Must be deployed
  if (status === 'active' && !deployedAt) {
    throw new AgentLoaderError(
      'AGENT_NOT_DEPLOYED',
      'This agent has not been deployed yet.',
      422
    );
  }
}

// =============================================================================
// VALIDATE AGENT OWNERSHIP
// =============================================================================

/**
 * Quick validation that an agent belongs to an organization.
 * Lighter than full loadAgentRuntime — used for authorization checks.
 */
export async function validateAgentOwnership(
  agentId: string,
  organizationId: string
): Promise<boolean> {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: { organizationId: true },
  });

  return agent?.organizationId === organizationId;
}

// =============================================================================
// Agent Loader Error
// =============================================================================

export class AgentLoaderError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, message: string, statusCode = 500) {
    super(message);
    this.name = 'AgentLoaderError';
    this.code = code;
    this.statusCode = statusCode;
  }
}
