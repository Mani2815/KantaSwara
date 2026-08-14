// =============================================================================
// Agent Validation Service
// =============================================================================
// Pre-deployment validation pipeline for agents.
// Checks system prompt, voice config, provider availability, knowledge bases,
// and workflow validity before allowing deployment.
// =============================================================================

import { prisma } from '@server/lib/prisma';
import { getRegisteredProviders } from '../runtime/provider-registry.service';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  score: number; // 0-100
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  checkedAt: string;
}

export interface ValidationIssue {
  field: string;
  code: string;
  message: string;
  severity: 'error' | 'warning';
}

// =============================================================================
// VALIDATE AGENT
// =============================================================================

/**
 * Run comprehensive validation checks on an agent configuration.
 * Returns a structured report with errors and warnings.
 */
export async function validateAgent(
  agentId: string,
  organizationId: string
): Promise<ValidationResult> {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  // Load agent
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
  });

  if (!agent || agent.organizationId !== organizationId || agent.deletedAt) {
    return {
      valid: false,
      score: 0,
      errors: [{
        field: 'agent',
        code: 'AGENT_NOT_FOUND',
        message: 'Agent not found or not owned by this organization.',
        severity: 'error',
      }],
      warnings: [],
      checkedAt: new Date().toISOString(),
    };
  }

  // ── System Prompt ─────────────────────────────────────────────────────────
  if (!agent.systemPrompt || agent.systemPrompt.trim().length === 0) {
    errors.push({
      field: 'systemPrompt',
      code: 'MISSING_SYSTEM_PROMPT',
      message: 'System prompt is required for agent deployment.',
      severity: 'error',
    });
  } else if (agent.systemPrompt.trim().length < 50) {
    warnings.push({
      field: 'systemPrompt',
      code: 'SHORT_SYSTEM_PROMPT',
      message: 'System prompt is very short. Consider adding more context for better agent behavior.',
      severity: 'warning',
    });
  }

  // ── Greeting ──────────────────────────────────────────────────────────────
  if (!agent.greeting || agent.greeting.trim().length === 0) {
    errors.push({
      field: 'greeting',
      code: 'MISSING_GREETING',
      message: 'Greeting message is required.',
      severity: 'error',
    });
  }

  // ── Voice Configuration ───────────────────────────────────────────────────
  const voiceConfig = agent.voiceConfig as Record<string, unknown>;

  if (!voiceConfig || !voiceConfig.voice) {
    errors.push({
      field: 'voiceConfig',
      code: 'MISSING_VOICE',
      message: 'Voice configuration must specify a voice.',
      severity: 'error',
    });
  }

  const speed = voiceConfig?.speed as number;
  if (speed !== undefined && (speed < 0.25 || speed > 4.0)) {
    errors.push({
      field: 'voiceConfig.speed',
      code: 'INVALID_SPEED',
      message: 'Voice speed must be between 0.25 and 4.0.',
      severity: 'error',
    });
  }

  // ── Provider Availability ─────────────────────────────────────────────────
  const providers = (voiceConfig?.providers as Record<string, unknown>) || {};
  const registeredProviders = getRegisteredProviders();

  const sttProvider = (providers.stt as Record<string, unknown>)?.provider as string || 'openai-whisper';
  if (!registeredProviders.stt.includes(sttProvider)) {
    errors.push({
      field: 'providers.stt',
      code: 'STT_PROVIDER_UNAVAILABLE',
      message: `STT provider "${sttProvider}" is not registered. Available: ${registeredProviders.stt.join(', ')}`,
      severity: 'error',
    });
  }

  const llmProvider = (providers.llm as Record<string, unknown>)?.provider as string || 'openai';
  if (!registeredProviders.llm.includes(llmProvider)) {
    errors.push({
      field: 'providers.llm',
      code: 'LLM_PROVIDER_UNAVAILABLE',
      message: `LLM provider "${llmProvider}" is not registered. Available: ${registeredProviders.llm.join(', ')}`,
      severity: 'error',
    });
  }

  const ttsProvider = (providers.tts as Record<string, unknown>)?.provider as string || 'openai-tts';
  if (!registeredProviders.tts.includes(ttsProvider)) {
    errors.push({
      field: 'providers.tts',
      code: 'TTS_PROVIDER_UNAVAILABLE',
      message: `TTS provider "${ttsProvider}" is not registered. Available: ${registeredProviders.tts.join(', ')}`,
      severity: 'error',
    });
  }

  // ── Knowledge Bases ───────────────────────────────────────────────────────
  if (agent.knowledgeBaseIds && agent.knowledgeBaseIds.length > 0) {
    const kbs = await prisma.knowledgeBase.findMany({
      where: {
        id: { in: agent.knowledgeBaseIds },
        organizationId,
        deletedAt: null,
      },
      select: { id: true, documentCount: true },
    });

    const foundIds = new Set(kbs.map((kb) => kb.id));
    for (const kbId of agent.knowledgeBaseIds) {
      if (!foundIds.has(kbId)) {
        errors.push({
          field: 'knowledgeBaseIds',
          code: 'KB_NOT_FOUND',
          message: `Knowledge base "${kbId}" not found.`,
          severity: 'error',
        });
      }
    }

    // Warn about empty knowledge bases
    for (const kb of kbs) {
      if (kb.documentCount === 0) {
        warnings.push({
          field: 'knowledgeBaseIds',
          code: 'KB_EMPTY',
          message: `Knowledge base "${kb.id}" has no documents indexed.`,
          severity: 'warning',
        });
      }
    }
  }

  // ── Workflow ───────────────────────────────────────────────────────────────
  if (agent.workflowId) {
    const workflow = await prisma.workflow.findUnique({
      where: { id: agent.workflowId },
      select: {
        organizationId: true,
        status: true,
        deletedAt: true,
        contract: true,
      },
    });

    if (!workflow || workflow.organizationId !== organizationId || workflow.deletedAt) {
      errors.push({
        field: 'workflowId',
        code: 'WORKFLOW_NOT_FOUND',
        message: 'Linked workflow not found.',
        severity: 'error',
      });
    } else if (workflow.status === 'draft') {
      warnings.push({
        field: 'workflowId',
        code: 'WORKFLOW_DRAFT',
        message: 'Linked workflow is still in draft status. Consider publishing it first.',
        severity: 'warning',
      });
    }

    // Validate workflow contract has required nodes
    if (workflow?.contract) {
      const contract = workflow.contract as Record<string, unknown>;
      const nodes = contract.nodes as Array<Record<string, unknown>> || [];

      const hasStart = nodes.some((n) => n.type === 'start');
      const hasEnd = nodes.some((n) => n.type === 'end');

      if (!hasStart) {
        errors.push({
          field: 'workflow.contract',
          code: 'WORKFLOW_NO_START',
          message: 'Workflow must have a Start node.',
          severity: 'error',
        });
      }
      if (!hasEnd) {
        warnings.push({
          field: 'workflow.contract',
          code: 'WORKFLOW_NO_END',
          message: 'Workflow has no End node. Conversations may not terminate cleanly.',
          severity: 'warning',
        });
      }
    }
  }

  // ── Organization Status ───────────────────────────────────────────────────
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { isActive: true, status: true },
  });

  if (!org?.isActive) {
    errors.push({
      field: 'organization',
      code: 'ORG_INACTIVE',
      message: 'Organization is not active.',
      severity: 'error',
    });
  }

  // ── Calculate Score ───────────────────────────────────────────────────────
  const score = errors.length > 0
    ? 0
    : warnings.length > 0
      ? Math.max(50, 100 - warnings.length * 10)
      : 100;

  return {
    valid: errors.length === 0,
    score,
    errors,
    warnings,
    checkedAt: new Date().toISOString(),
  };
}
