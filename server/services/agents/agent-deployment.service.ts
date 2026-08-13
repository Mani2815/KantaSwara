// =============================================================================
// Agent Deployment Service
// =============================================================================
// Manages the agent lifecycle state machine:
//   draft → testing → active (deployed) → inactive
//
// Validates agent before deployment. Sets deployedAt timestamp.
// Multi-tenant scoped.
// =============================================================================

import { prisma } from '@server/lib/prisma';
import { validateAgent } from './agent-validation.service';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface DeploymentResult {
  success: boolean;
  agentId: string;
  status: string;
  deployedAt?: Date;
  message: string;
  validationScore?: number;
}

// Valid state transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ['active', 'inactive'],
  active: ['inactive'],
  inactive: ['draft', 'active'],
  error: ['draft', 'inactive'],
};

// =============================================================================
// DEPLOY AGENT
// =============================================================================

/**
 * Deploy an agent to production.
 * Runs validation checks, then transitions status to 'active' and sets deployedAt.
 */
export async function deployAgent(
  agentId: string,
  organizationId: string
): Promise<DeploymentResult> {
  // Load agent
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: {
      id: true,
      organizationId: true,
      status: true,
      deletedAt: true,
    },
  });

  if (!agent || agent.organizationId !== organizationId || agent.deletedAt) {
    throw new DeploymentError('AGENT_NOT_FOUND', 'Agent not found.', 404);
  }

  // Validate state transition
  const allowedTransitions = VALID_TRANSITIONS[agent.status] || [];
  if (!allowedTransitions.includes('active')) {
    throw new DeploymentError(
      'INVALID_TRANSITION',
      `Cannot deploy agent from "${agent.status}" status. Allowed transitions: ${allowedTransitions.join(', ')}`,
      422
    );
  }

  // Run validation
  const validation = await validateAgent(agentId, organizationId);

  if (!validation.valid) {
    return {
      success: false,
      agentId,
      status: agent.status,
      message: `Deployment blocked: ${validation.errors.length} validation error(s). ${validation.errors.map((e) => e.message).join('; ')}`,
      validationScore: validation.score,
    };
  }

  // Deploy
  const deployedAt = new Date();
  await prisma.agent.update({
    where: { id: agentId },
    data: {
      status: 'active',
      deployedAt,
    },
  });

  return {
    success: true,
    agentId,
    status: 'active',
    deployedAt,
    message: 'Agent deployed successfully.',
    validationScore: validation.score,
  };
}

// =============================================================================
// PUBLISH AGENT (Version Lock)
// =============================================================================

/**
 * Publish an agent version. Marks the current configuration as a stable release.
 * The agent must be active (deployed) to be published.
 */
export async function publishAgent(
  agentId: string,
  organizationId: string
): Promise<DeploymentResult> {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: {
      id: true,
      organizationId: true,
      status: true,
      deletedAt: true,
    },
  });

  if (!agent || agent.organizationId !== organizationId || agent.deletedAt) {
    throw new DeploymentError('AGENT_NOT_FOUND', 'Agent not found.', 404);
  }

  if (agent.status !== 'active') {
    throw new DeploymentError(
      'NOT_DEPLOYED',
      'Agent must be deployed (active) before publishing.',
      422
    );
  }

  // Run validation before publish
  const validation = await validateAgent(agentId, organizationId);

  if (!validation.valid) {
    return {
      success: false,
      agentId,
      status: agent.status,
      message: `Publish blocked: ${validation.errors.length} validation error(s).`,
      validationScore: validation.score,
    };
  }

  // Mark as published (update deployedAt to reflect latest publish time)
  const publishedAt = new Date();
  await prisma.agent.update({
    where: { id: agentId },
    data: {
      deployedAt: publishedAt,
    },
  });

  return {
    success: true,
    agentId,
    status: 'active',
    deployedAt: publishedAt,
    message: 'Agent published successfully.',
    validationScore: validation.score,
  };
}

// =============================================================================
// DEACTIVATE AGENT
// =============================================================================

/**
 * Deactivate an agent. Removes it from active service.
 */
export async function deactivateAgent(
  agentId: string,
  organizationId: string
): Promise<DeploymentResult> {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: {
      id: true,
      organizationId: true,
      status: true,
      activeCalls: true,
      deletedAt: true,
    },
  });

  if (!agent || agent.organizationId !== organizationId || agent.deletedAt) {
    throw new DeploymentError('AGENT_NOT_FOUND', 'Agent not found.', 404);
  }

  if (agent.activeCalls > 0) {
    throw new DeploymentError(
      'ACTIVE_CALLS',
      `Cannot deactivate agent with ${agent.activeCalls} active call(s). Wait for calls to complete.`,
      422
    );
  }

  await prisma.agent.update({
    where: { id: agentId },
    data: { status: 'inactive' },
  });

  return {
    success: true,
    agentId,
    status: 'inactive',
    message: 'Agent deactivated successfully.',
  };
}

// =============================================================================
// RESET AGENT TO DRAFT
// =============================================================================

/**
 * Reset an agent back to draft status for editing.
 */
export async function resetToDraft(
  agentId: string,
  organizationId: string
): Promise<DeploymentResult> {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: {
      id: true,
      organizationId: true,
      status: true,
      activeCalls: true,
      deletedAt: true,
    },
  });

  if (!agent || agent.organizationId !== organizationId || agent.deletedAt) {
    throw new DeploymentError('AGENT_NOT_FOUND', 'Agent not found.', 404);
  }

  const allowedTransitions = VALID_TRANSITIONS[agent.status] || [];
  if (!allowedTransitions.includes('draft')) {
    throw new DeploymentError(
      'INVALID_TRANSITION',
      `Cannot reset to draft from "${agent.status}" status.`,
      422
    );
  }

  if (agent.activeCalls > 0) {
    throw new DeploymentError(
      'ACTIVE_CALLS',
      'Cannot reset agent with active calls.',
      422
    );
  }

  await prisma.agent.update({
    where: { id: agentId },
    data: { status: 'draft' },
  });

  return {
    success: true,
    agentId,
    status: 'draft',
    message: 'Agent reset to draft status.',
  };
}

// =============================================================================
// Deployment Error
// =============================================================================

export class DeploymentError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, message: string, statusCode = 500) {
    super(message);
    this.name = 'DeploymentError';
    this.code = code;
    this.statusCode = statusCode;
  }
}
