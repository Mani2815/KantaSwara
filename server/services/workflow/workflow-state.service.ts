// =============================================================================
// Workflow State Manager
// =============================================================================
// Manages workflow execution state per session. Provides in-memory state
// with variable storage, node history tracking, and state transitions.
// =============================================================================

import type {
  WorkflowExecutionState,
  WorkflowStatus,
  WorkflowNodeType,
  NodeExecutionResult,
  NodeHistoryEntry,
} from './workflow.types';

// ── In-Memory State Store ───────────────────────────────────────────────────
const stateStore = new Map<string, WorkflowExecutionState>();

// =============================================================================
// INITIALIZE STATE
// =============================================================================

/**
 * Create a new workflow execution state for a session.
 */
export function initializeState(
  sessionId: string,
  workflowId: string,
  startNodeId: string
): WorkflowExecutionState {
  const state: WorkflowExecutionState = {
    sessionId,
    workflowId,
    currentNodeId: startNodeId,
    status: 'initialized',
    variables: new Map(),
    nodeHistory: [],
    currentRetries: 0,
    awaitingInput: false,
    lastUpdatedAt: new Date(),
  };

  stateStore.set(sessionId, state);
  return state;
}

// =============================================================================
// GET STATE
// =============================================================================

export function getState(sessionId: string): WorkflowExecutionState | null {
  return stateStore.get(sessionId) || null;
}

// =============================================================================
// TRANSITION TO NODE
// =============================================================================

/**
 * Transition the workflow to a new node.
 * Records history and resets retry counter.
 */
export function transitionToNode(
  sessionId: string,
  targetNodeId: string,
  targetNodeType: WorkflowNodeType,
  result?: NodeExecutionResult
): WorkflowExecutionState {
  const state = stateStore.get(sessionId);
  if (!state) {
    throw new Error(`[WorkflowState] No state found for session ${sessionId}`);
  }

  // Close current history entry
  if (state.nodeHistory.length > 0) {
    const lastEntry = state.nodeHistory[state.nodeHistory.length - 1];
    if (!lastEntry.exitedAt) {
      lastEntry.exitedAt = new Date();
      lastEntry.result = result;
    }
  }

  // Record new history entry
  state.nodeHistory.push({
    nodeId: targetNodeId,
    nodeType: targetNodeType,
    enteredAt: new Date(),
  });

  state.previousNodeId = state.currentNodeId;
  state.currentNodeId = targetNodeId;
  state.currentRetries = 0;
  state.lastUpdatedAt = new Date();

  // Apply variables from result
  if (result?.variablesSet) {
    for (const [key, value] of Object.entries(result.variablesSet)) {
      state.variables.set(key, value);
    }
  }

  return state;
}

// =============================================================================
// UPDATE STATUS
// =============================================================================

export function updateStatus(
  sessionId: string,
  status: WorkflowStatus
): void {
  const state = stateStore.get(sessionId);
  if (!state) return;

  state.status = status;
  state.awaitingInput = status === 'awaiting_input';
  state.lastUpdatedAt = new Date();
}

// =============================================================================
// VARIABLE OPERATIONS
// =============================================================================

export function setVariable(
  sessionId: string,
  name: string,
  value: unknown
): void {
  const state = stateStore.get(sessionId);
  if (!state) return;

  state.variables.set(name, value);
  state.lastUpdatedAt = new Date();
}

export function getVariable(
  sessionId: string,
  name: string
): unknown | undefined {
  const state = stateStore.get(sessionId);
  return state?.variables.get(name);
}

export function getAllVariables(
  sessionId: string
): Record<string, unknown> {
  const state = stateStore.get(sessionId);
  if (!state) return {};

  const vars: Record<string, unknown> = {};
  for (const [key, value] of state.variables) {
    vars[key] = value;
  }
  return vars;
}

// =============================================================================
// RETRY TRACKING
// =============================================================================

export function incrementRetry(sessionId: string): number {
  const state = stateStore.get(sessionId);
  if (!state) return 0;

  state.currentRetries += 1;
  state.lastUpdatedAt = new Date();
  return state.currentRetries;
}

export function getRetryCount(sessionId: string): number {
  return stateStore.get(sessionId)?.currentRetries || 0;
}

// =============================================================================
// CLEANUP
// =============================================================================

export function clearState(sessionId: string): void {
  stateStore.delete(sessionId);
}

export function getActiveWorkflowCount(): number {
  return stateStore.size;
}

// =============================================================================
// SERIALIZATION (for persistence/debugging)
// =============================================================================

/**
 * Serialize workflow state to a plain JSON-safe object.
 */
export function serializeState(
  sessionId: string
): Record<string, unknown> | null {
  const state = stateStore.get(sessionId);
  if (!state) return null;

  return {
    sessionId: state.sessionId,
    workflowId: state.workflowId,
    currentNodeId: state.currentNodeId,
    previousNodeId: state.previousNodeId,
    status: state.status,
    variables: Object.fromEntries(state.variables),
    nodeHistory: state.nodeHistory.map((h) => ({
      nodeId: h.nodeId,
      nodeType: h.nodeType,
      enteredAt: h.enteredAt.toISOString(),
      exitedAt: h.exitedAt?.toISOString(),
    })),
    currentRetries: state.currentRetries,
    awaitingInput: state.awaitingInput,
    lastUpdatedAt: state.lastUpdatedAt.toISOString(),
  };
}
