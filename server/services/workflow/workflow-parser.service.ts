// =============================================================================
// Workflow Parser
// =============================================================================
// Parses a WorkflowContract (JSON from frontend/DB) into an executable
// WorkflowDefinition used by the engine. Validates graph connectivity,
// resolves start/end nodes, and builds adjacency maps.
// =============================================================================

import type { WorkflowContract, WorkflowNode, WorkflowEdge } from '@/types/workflow';
import type {
  WorkflowDefinition,
  ExecutableNode,
  WorkflowTransition,
  WorkflowNodeType,
  IntentMapping,
  WorkflowFallback,
  NodeData,
} from './workflow.types';

// =============================================================================
// PARSE WORKFLOW
// =============================================================================

/**
 * Parse a WorkflowContract into an executable WorkflowDefinition.
 * Validates structure and builds optimized lookup maps.
 *
 * @throws WorkflowParseError if contract is invalid
 */
export function parseWorkflow(
  workflowId: string,
  name: string,
  version: number,
  contract: WorkflowContract
): WorkflowDefinition {
  const errors: string[] = [];

  // ── Parse Nodes ───────────────────────────────────────────────────────────
  const nodes = new Map<string, ExecutableNode>();
  let startNodeId: string | null = null;

  for (const node of contract.nodes) {
    const nodeType = mapNodeType(node.type as string);

    if (!nodeType) {
      errors.push(`Unknown node type "${node.type}" on node "${node.id}"`);
      continue;
    }

    nodes.set(node.id, {
      id: node.id,
      type: nodeType,
      label: node.label,
      data: node.data as NodeData,
    });

    if (nodeType === 'start') {
      if (startNodeId) {
        errors.push('Multiple start nodes found. Only one is allowed.');
      }
      startNodeId = node.id;
    }
  }

  if (!startNodeId) {
    errors.push('No start node found in workflow.');
  }

  // ── Parse Edges into Transitions ──────────────────────────────────────────
  const transitions = new Map<string, WorkflowTransition[]>();

  for (const edge of contract.edges) {
    if (!nodes.has(edge.source)) {
      errors.push(`Edge "${edge.id}" references unknown source node "${edge.source}"`);
      continue;
    }
    if (!nodes.has(edge.target)) {
      errors.push(`Edge "${edge.id}" references unknown target node "${edge.target}"`);
      continue;
    }

    const transition: WorkflowTransition = {
      id: edge.id,
      sourceNodeId: edge.source,
      targetNodeId: edge.target,
      condition: edge.condition,
      label: edge.label,
      priority: 0,
    };

    const existing = transitions.get(edge.source) || [];
    existing.push(transition);
    transitions.set(edge.source, existing);
  }

  // ── Parse Intent Mappings ─────────────────────────────────────────────────
  const intents: IntentMapping[] = (contract.intents || []).map((i) => ({
    intent: i.intent,
    description: i.description,
    examples: i.examples,
    targetNodeId: i.targetNodeId,
  }));

  // ── Parse Fallbacks ───────────────────────────────────────────────────────
  const fallbacks = new Map<string, WorkflowFallback>();
  for (const fb of contract.fallbacks || []) {
    fallbacks.set(fb.nodeId, {
      nodeId: fb.nodeId,
      message: fb.message,
      action: fb.action,
    });
  }

  // ── Validate Connectivity ─────────────────────────────────────────────────
  if (startNodeId) {
    const reachable = getReachableNodes(startNodeId, transitions);
    const unreachable = [...nodes.keys()].filter(
      (id) => !reachable.has(id) && nodes.get(id)?.type !== 'start'
    );

    if (unreachable.length > 0) {
      // Orphan nodes are warnings, not errors — they might be intentional
      console.warn(
        `[WorkflowParser] Unreachable nodes in workflow "${name}": ${unreachable.join(', ')}`
      );
    }
  }

  // ── Check for errors ──────────────────────────────────────────────────────
  if (errors.length > 0) {
    throw new WorkflowParseError(
      'INVALID_WORKFLOW',
      `Workflow parsing failed with ${errors.length} error(s): ${errors.join('; ')}`
    );
  }

  return {
    id: workflowId,
    name,
    version,
    nodes,
    transitions,
    startNodeId: startNodeId!,
    intents,
    fallbacks,
  };
}

// =============================================================================
// VALIDATE WORKFLOW CONTRACT
// =============================================================================

/**
 * Quick validation of a WorkflowContract without full parsing.
 * Returns validation errors/warnings.
 */
export function validateContract(contract: WorkflowContract): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!contract.nodes || contract.nodes.length === 0) {
    errors.push('Workflow has no nodes.');
    return { valid: false, errors, warnings };
  }

  const nodeIds = new Set(contract.nodes.map((n) => n.id));
  const startNodes = contract.nodes.filter((n) => (n.type as string) === 'trigger' || (n.type as string) === 'start');
  const endNodes = contract.nodes.filter((n) => (n.type as string) === 'end');

  if (startNodes.length === 0) errors.push('No start node found.');
  if (startNodes.length > 1) errors.push('Multiple start nodes found.');
  if (endNodes.length === 0) warnings.push('No end node found.');

  for (const edge of contract.edges || []) {
    if (!nodeIds.has(edge.source)) {
      errors.push(`Edge "${edge.id}" references unknown source "${edge.source}".`);
    }
    if (!nodeIds.has(edge.target)) {
      errors.push(`Edge "${edge.id}" references unknown target "${edge.target}".`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Map frontend node type strings to engine-recognized WorkflowNodeType.
 */
function mapNodeType(type: string): WorkflowNodeType | null {
  const typeMap: Record<string, WorkflowNodeType> = {
    start: 'start',
    end: 'end',
    message: 'message',
    ask_question: 'ask_question',
    askQuestion: 'ask_question',
    intent_detection: 'intent_detection',
    intentDetection: 'intent_detection',
    knowledge_search: 'knowledge_search',
    knowledgeSearch: 'knowledge_search',
    api_call: 'api_call',
    apiCall: 'api_call',
    function_call: 'function_call',
    functionCall: 'function_call',
    condition: 'condition',
    delay: 'delay',
    human_handoff: 'human_handoff',
    humanHandoff: 'human_handoff',
  };

  return typeMap[type] || null;
}

/**
 * BFS to find all nodes reachable from the start node.
 */
function getReachableNodes(
  startId: string,
  transitions: Map<string, WorkflowTransition[]>
): Set<string> {
  const visited = new Set<string>();
  const queue = [startId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    const edges = transitions.get(current) || [];
    for (const edge of edges) {
      if (!visited.has(edge.targetNodeId)) {
        queue.push(edge.targetNodeId);
      }
    }
  }

  return visited;
}

// =============================================================================
// Parse Error
// =============================================================================

export class WorkflowParseError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'WorkflowParseError';
    this.code = code;
  }
}
