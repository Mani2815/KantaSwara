// =============================================================================
// Agents — Barrel Exports
// =============================================================================

// ── Config Service ──────────────────────────────────────────────────────────
export {
  listAgents,
  getAgent,
  createAgent,
  updateAgent,
  deleteAgent,
  AgentConfigError,
} from './agent-config.service';

export type {
  AgentCreateInput,
  AgentUpdateInput,
  AgentVoiceConfig,
  AgentRuntimeConfig,
  AgentListFilters,
  AgentListResult,
  AgentSummary,
  AgentDetail,
} from './agent-config.service';

// ── Validation Service ──────────────────────────────────────────────────────
export { validateAgent } from './agent-validation.service';
export type { ValidationResult, ValidationIssue } from './agent-validation.service';

// ── Deployment Service ──────────────────────────────────────────────────────
export {
  deployAgent,
  publishAgent,
  deactivateAgent,
  resetToDraft,
  DeploymentError,
} from './agent-deployment.service';
export type { DeploymentResult } from './agent-deployment.service';
