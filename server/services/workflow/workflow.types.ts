// =============================================================================
// Workflow Engine — Type Definitions
// =============================================================================
// Types for the workflow execution engine. Defines the runtime data model
// for workflow execution, extending the frontend WorkflowContract types.
// =============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// Workflow Node Types (executable by the engine)
// ─────────────────────────────────────────────────────────────────────────────

export type WorkflowNodeType =
  | 'start'
  | 'end'
  | 'message'
  | 'ask_question'
  | 'intent_detection'
  | 'knowledge_search'
  | 'api_call'
  | 'function_call'
  | 'condition'
  | 'delay'
  | 'human_handoff';

/** Nodes that require user input before advancing */
export const USER_INPUT_NODES: WorkflowNodeType[] = [
  'ask_question',
  'intent_detection',
];

/** Nodes that auto-advance without user input */
export const AUTO_ADVANCE_NODES: WorkflowNodeType[] = [
  'start',
  'message',
  'condition',
  'api_call',
  'function_call',
  'knowledge_search',
  'delay',
];

// ─────────────────────────────────────────────────────────────────────────────
// Workflow Definition (parsed from WorkflowContract)
// ─────────────────────────────────────────────────────────────────────────────

export interface WorkflowDefinition {
  id: string;
  name: string;
  version: number;
  /** All nodes indexed by ID */
  nodes: Map<string, ExecutableNode>;
  /** Adjacency list: sourceNodeId → array of transitions */
  transitions: Map<string, WorkflowTransition[]>;
  /** The start node ID */
  startNodeId: string;
  /** Intent mappings for intent_detection nodes */
  intents: IntentMapping[];
  /** Fallback configurations */
  fallbacks: Map<string, WorkflowFallback>;
}

export interface ExecutableNode {
  id: string;
  type: WorkflowNodeType;
  label: string;
  data: NodeData;
}

/** Union of all possible node data configurations */
export interface NodeData {
  // Message node
  message?: string;
  // Ask question node
  question?: string;
  variableName?: string;
  validationRegex?: string;
  retryMessage?: string;
  maxRetries?: number;
  // Intent detection node
  intents?: string[];
  fallbackNodeId?: string;
  // Knowledge search node
  knowledgeBaseIds?: string[];
  queryTemplate?: string;
  // API call node
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  responseVariable?: string;
  timeoutMs?: number;
  // Function call node
  functionName?: string;
  parameters?: Record<string, unknown>;
  // Condition node
  condition?: string;
  trueNodeId?: string;
  falseNodeId?: string;
  // Delay node
  delayMs?: number;
  // Human handoff node
  handoffMessage?: string;
  department?: string;
  // General
  retryConfig?: RetryConfig;
  timeoutConfig?: TimeoutConfig;
}

// ─────────────────────────────────────────────────────────────────────────────
// Transitions & Routing
// ─────────────────────────────────────────────────────────────────────────────

export interface WorkflowTransition {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  /** Condition expression (if any) */
  condition?: string;
  /** Edge label */
  label?: string;
  /** For intent-based transitions */
  intent?: string;
  /** Priority for ordering (lower = higher priority) */
  priority: number;
}

export interface IntentMapping {
  intent: string;
  description: string;
  examples: string[];
  targetNodeId: string;
}

export interface WorkflowFallback {
  nodeId: string;
  message: string;
  action: 'transfer' | 'voicemail' | 'end' | 'retry';
}

// ─────────────────────────────────────────────────────────────────────────────
// Execution State
// ─────────────────────────────────────────────────────────────────────────────

export interface WorkflowExecutionState {
  /** Session ID this state belongs to */
  sessionId: string;
  /** Workflow definition ID */
  workflowId: string;
  /** Current node ID */
  currentNodeId: string;
  /** Previous node ID */
  previousNodeId?: string;
  /** Execution status */
  status: WorkflowStatus;
  /** Variable storage (session-scoped) */
  variables: Map<string, unknown>;
  /** Node execution history */
  nodeHistory: NodeHistoryEntry[];
  /** Number of retries for current node */
  currentRetries: number;
  /** Whether waiting for user input */
  awaitingInput: boolean;
  /** Timestamp of last state change */
  lastUpdatedAt: Date;
  /** Error info if in error state */
  error?: WorkflowError;
}

export type WorkflowStatus =
  | 'initialized'
  | 'running'
  | 'awaiting_input'
  | 'completed'
  | 'failed'
  | 'handed_off';

export interface NodeHistoryEntry {
  nodeId: string;
  nodeType: WorkflowNodeType;
  enteredAt: Date;
  exitedAt?: Date;
  result?: NodeExecutionResult;
}

// ─────────────────────────────────────────────────────────────────────────────
// Node Execution
// ─────────────────────────────────────────────────────────────────────────────

export interface NodeExecutionResult {
  /** Whether the node executed successfully */
  success: boolean;
  /** Output message to send to the user (if any) */
  outputMessage?: string;
  /** The next node to transition to (if determined by the node itself) */
  nextNodeId?: string;
  /** Variables set during execution */
  variablesSet?: Record<string, unknown>;
  /** Whether to wait for user input */
  awaitInput?: boolean;
  /** Whether the workflow should end */
  shouldEnd?: boolean;
  /** End reason */
  endReason?: string;
  /** Error details */
  error?: WorkflowError;
  /** Metadata from execution */
  metadata?: Record<string, unknown>;
}

export interface WorkflowError {
  code: string;
  message: string;
  nodeId: string;
  recoverable: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

export interface RetryConfig {
  maxRetries: number;
  backoffMs: number;
  backoffMultiplier: number;
}

export interface TimeoutConfig {
  timeoutMs: number;
  onTimeout: 'error' | 'fallback' | 'skip';
  fallbackNodeId?: string;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  backoffMs: 1000,
  backoffMultiplier: 2,
};

export const DEFAULT_TIMEOUT_CONFIG: TimeoutConfig = {
  timeoutMs: 30000,
  onTimeout: 'error',
};
