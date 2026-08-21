// =============================================================================
// Workflow Executor
// =============================================================================
// Core node execution logic. Each node type has a dedicated handler.
// The executor resolves the current node, executes it, evaluates transitions,
// and returns the result for the engine to process.
// =============================================================================

import type { RuntimeContext } from '../runtime/runtime.types';
import type {
  ExecutableNode,
  WorkflowDefinition,
  WorkflowTransition,
  NodeExecutionResult,
  WorkflowNodeType,
} from './workflow.types';
import { DEFAULT_RETRY_CONFIG, DEFAULT_TIMEOUT_CONFIG } from './workflow.types';
import * as workflowState from './workflow-state.service';
import { executeTool } from '../tools/tool-executor.service';

// =============================================================================
// EXECUTE NODE
// =============================================================================

/**
 * Execute a single workflow node and return the result.
 * Handles timeout enforcement and error wrapping.
 */
export async function executeNode(
  node: ExecutableNode,
  sessionId: string,
  userInput: string | undefined,
  context: RuntimeContext,
  definition: WorkflowDefinition
): Promise<NodeExecutionResult> {
  const timeoutMs = node.data.timeoutConfig?.timeoutMs || DEFAULT_TIMEOUT_CONFIG.timeoutMs;

  try {
    const resultPromise = executeNodeByType(node, sessionId, userInput, context, definition);

    // Enforce timeout
    const result = await Promise.race([
      resultPromise,
      new Promise<NodeExecutionResult>((_, reject) =>
        setTimeout(() => reject(new Error('NODE_TIMEOUT')), timeoutMs)
      ),
    ]);

    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';

    if (message === 'NODE_TIMEOUT') {
      const timeoutConfig = node.data.timeoutConfig || DEFAULT_TIMEOUT_CONFIG;
      if (timeoutConfig.onTimeout === 'fallback' && timeoutConfig.fallbackNodeId) {
        return {
          success: true,
          nextNodeId: timeoutConfig.fallbackNodeId,
          outputMessage: 'I apologize for the delay. Let me try a different approach.',
        };
      }
      return {
        success: false,
        error: {
          code: 'NODE_TIMEOUT',
          message: `Node "${node.label}" timed out after ${timeoutMs}ms.`,
          nodeId: node.id,
          recoverable: true,
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'NODE_EXECUTION_ERROR',
        message: `Node "${node.label}" failed: ${message}`,
        nodeId: node.id,
        recoverable: true,
      },
    };
  }
}

// =============================================================================
// NODE TYPE HANDLERS
// =============================================================================

async function executeNodeByType(
  node: ExecutableNode,
  sessionId: string,
  userInput: string | undefined,
  context: RuntimeContext,
  definition: WorkflowDefinition
): Promise<NodeExecutionResult> {
  switch (node.type) {
    case 'start':
      return executeStartNode(node);
    case 'end':
      return executeEndNode(node, sessionId);
    case 'message':
      return executeMessageNode(node, sessionId);
    case 'ask_question':
      return executeQuestionNode(node, sessionId, userInput);
    case 'intent_detection':
      return executeIntentDetectionNode(node, sessionId, userInput, definition);
    case 'knowledge_search':
      return executeKnowledgeSearchNode(node, sessionId, userInput, context);
    case 'api_call':
      return executeApiCallNode(node, sessionId);
    case 'function_call':
      return executeFunctionCallNode(node, sessionId, context);
    case 'condition':
      return executeConditionNode(node, sessionId);
    case 'delay':
      return executeDelayNode(node);
    case 'human_handoff':
      return executeHumanHandoffNode(node, sessionId);
    default:
      return {
        success: false,
        error: {
          code: 'UNKNOWN_NODE_TYPE',
          message: `Unknown node type: ${node.type}`,
          nodeId: node.id,
          recoverable: false,
        },
      };
  }
}

// ─── Start Node ─────────────────────────────────────────────────────────────

function executeStartNode(node: ExecutableNode): NodeExecutionResult {
  return {
    success: true,
    outputMessage: node.data.message,
  };
}

// ─── End Node ───────────────────────────────────────────────────────────────

function executeEndNode(node: ExecutableNode, sessionId: string): NodeExecutionResult {
  return {
    success: true,
    outputMessage: node.data.message || 'Thank you for your call. Goodbye!',
    shouldEnd: true,
    endReason: 'workflow_complete',
  };
}

// ─── Message Node ───────────────────────────────────────────────────────────

function executeMessageNode(node: ExecutableNode, sessionId: string): NodeExecutionResult {
  let message = node.data.message || node.label;

  // Substitute variables in message template
  message = substituteVariables(message, sessionId);

  return {
    success: true,
    outputMessage: message,
  };
}

// ─── Ask Question Node ──────────────────────────────────────────────────────

function executeQuestionNode(
  node: ExecutableNode,
  sessionId: string,
  userInput: string | undefined
): NodeExecutionResult {
  // If no user input yet, ask the question and wait
  if (!userInput) {
    const question = substituteVariables(node.data.question || node.label, sessionId);
    return {
      success: true,
      outputMessage: question,
      awaitInput: true,
    };
  }

  // User has responded — validate if regex is specified
  if (node.data.validationRegex) {
    const regex = new RegExp(node.data.validationRegex, 'i');
    if (!regex.test(userInput)) {
      const retryCount = workflowState.incrementRetry(sessionId);
      const maxRetries = node.data.maxRetries || DEFAULT_RETRY_CONFIG.maxRetries;

      if (retryCount >= maxRetries) {
        return {
          success: false,
          outputMessage: 'I was unable to understand your response after multiple attempts.',
          error: {
            code: 'MAX_RETRIES_EXCEEDED',
            message: `Validation failed after ${maxRetries} retries.`,
            nodeId: node.id,
            recoverable: false,
          },
        };
      }

      return {
        success: true,
        outputMessage: node.data.retryMessage || 'I didn\'t quite get that. Could you please try again?',
        awaitInput: true,
      };
    }
  }

  // Store the answer in a variable
  if (node.data.variableName) {
    workflowState.setVariable(sessionId, node.data.variableName, userInput);
  }

  return {
    success: true,
    variablesSet: node.data.variableName
      ? { [node.data.variableName]: userInput }
      : undefined,
  };
}

// ─── Intent Detection Node ──────────────────────────────────────────────────

async function executeIntentDetectionNode(
  node: ExecutableNode,
  sessionId: string,
  userInput: string | undefined,
  definition: WorkflowDefinition
): Promise<NodeExecutionResult> {
  if (!userInput) {
    return {
      success: true,
      outputMessage: node.data.message || 'How can I help you?',
      awaitInput: true,
    };
  }

  // Use intent mappings to find best match
  // In production, this delegates to the IntentRouter which uses LLM
  const intents = definition.intents.filter(
    (i) => !node.data.intents || node.data.intents.includes(i.intent)
  );

  // Simple keyword-based matching as fallback
  // The WorkflowEngine will use the full IntentRouter for LLM-based matching
  for (const intent of intents) {
    for (const example of intent.examples) {
      if (userInput.toLowerCase().includes(example.toLowerCase())) {
        return {
          success: true,
          nextNodeId: intent.targetNodeId,
          variablesSet: {
            __detected_intent: intent.intent,
            __user_message: userInput,
          },
        };
      }
    }
  }

  // No match — use fallback
  if (node.data.fallbackNodeId) {
    return {
      success: true,
      nextNodeId: node.data.fallbackNodeId,
      variablesSet: { __detected_intent: 'fallback', __user_message: userInput },
    };
  }

  return {
    success: true,
    outputMessage: 'I\'m not sure I understood. Could you please rephrase?',
    awaitInput: true,
  };
}

// ─── Knowledge Search Node ──────────────────────────────────────────────────

async function executeKnowledgeSearchNode(
  node: ExecutableNode,
  sessionId: string,
  userInput: string | undefined,
  context: RuntimeContext
): Promise<NodeExecutionResult> {
  const query = userInput || substituteVariables(node.data.queryTemplate || '', sessionId);

  if (!query) {
    return { success: true, outputMessage: 'What would you like to know?' };
  }

  try {
    const { queryKnowledge } = require('../knowledge/knowledge.service');
    const kbIds = node.data.knowledgeBaseIds || context.agent.knowledgeBaseIds;

    const knowledgeContext = await queryKnowledge(
      query,
      kbIds,
      context.organization.id,
      1024
    );

    if (knowledgeContext) {
      workflowState.setVariable(sessionId, '__knowledge_context', knowledgeContext);
      return {
        success: true,
        variablesSet: { __knowledge_context: knowledgeContext },
        metadata: { knowledgeFound: true },
      };
    }

    return {
      success: true,
      variablesSet: { __knowledge_context: '' },
      metadata: { knowledgeFound: false },
    };
  } catch (err) {
    console.error('[WorkflowExecutor] Knowledge search failed:', err);
    return {
      success: true,
      variablesSet: { __knowledge_context: '' },
      metadata: { knowledgeFound: false, error: true },
    };
  }
}

// ─── API Call Node ──────────────────────────────────────────────────────────

async function executeApiCallNode(
  node: ExecutableNode,
  sessionId: string
): Promise<NodeExecutionResult> {
  const url = substituteVariables(node.data.url || '', sessionId);
  const method = node.data.method || 'GET';
  const headers = node.data.headers || {};
  const bodyTemplate = node.data.body ? substituteVariables(node.data.body, sessionId) : undefined;
  const timeoutMs = node.data.timeoutMs || 10000;

  if (!url) {
    return {
      success: false,
      error: {
        code: 'MISSING_URL',
        message: 'API call node has no URL configured.',
        nodeId: node.id,
        recoverable: false,
      },
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: bodyTemplate,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const responseData = await response.json().catch(() => response.text());

    if (node.data.responseVariable) {
      workflowState.setVariable(sessionId, node.data.responseVariable, responseData);
    }

    return {
      success: response.ok,
      variablesSet: node.data.responseVariable
        ? { [node.data.responseVariable]: responseData }
        : undefined,
      metadata: { statusCode: response.status },
    };
  } catch (err) {
    return {
      success: false,
      error: {
        code: 'API_CALL_FAILED',
        message: `API call failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        nodeId: node.id,
        recoverable: true,
      },
    };
  }
}

// ─── Function Call Node ─────────────────────────────────────────────────────

async function executeFunctionCallNode(
  node: ExecutableNode,
  sessionId: string,
  context: RuntimeContext
): Promise<NodeExecutionResult> {
  const functionName = node.data.functionName;

  if (!functionName) {
    return {
      success: false,
      error: {
        code: 'MISSING_FUNCTION',
        message: 'Function call node has no function configured.',
        nodeId: node.id,
        recoverable: false,
      },
    };
  }

  // Resolve parameters from workflow variables
  const rawParams = (node.data.parameters as Record<string, unknown>) || {};
  const resolvedParams: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rawParams)) {
    if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
      const varName = value.slice(2, -2).trim();
      resolvedParams[key] = workflowState.getVariable(sessionId, varName) ?? value;
    } else {
      resolvedParams[key] = value;
    }
  }

  // Execute via the Tool Framework
  const result = await executeTool({
    toolId: functionName,
    parameters: resolvedParams,
    sessionId,
    organizationId: context.organization.id,
  });

  if (!result.success) {
    return {
      success: false,
      error: {
        code: result.error?.code || 'TOOL_ERROR',
        message: result.error?.message || 'Tool execution failed.',
        nodeId: node.id,
        recoverable: result.error?.retryable ?? true,
      },
      metadata: { functionName, durationMs: result.durationMs },
    };
  }

  // Store result in workflow variable
  const resultVarName = `__tool_result_${functionName}`;
  workflowState.setVariable(sessionId, resultVarName, result.output);

  return {
    success: true,
    variablesSet: { [resultVarName]: result.output },
    metadata: { functionName, durationMs: result.durationMs },
  };
}

// ─── Condition Node ─────────────────────────────────────────────────────────

function executeConditionNode(
  node: ExecutableNode,
  sessionId: string
): NodeExecutionResult {
  const conditionExpr = node.data.condition || '';
  const variables = workflowState.getAllVariables(sessionId);

  let result = false;
  try {
    // Simple condition evaluation using variable substitution
    result = evaluateCondition(conditionExpr, variables);
  } catch (err) {
    console.error('[WorkflowExecutor] Condition evaluation failed:', err);
  }

  return {
    success: true,
    nextNodeId: result ? node.data.trueNodeId : node.data.falseNodeId,
    variablesSet: { __condition_result: result },
  };
}

// ─── Delay Node ─────────────────────────────────────────────────────────────

async function executeDelayNode(node: ExecutableNode): Promise<NodeExecutionResult> {
  const delayMs = node.data.delayMs || 1000;
  await new Promise((resolve) => setTimeout(resolve, Math.min(delayMs, 10000)));

  return { success: true };
}

// ─── Human Handoff Node ─────────────────────────────────────────────────────

function executeHumanHandoffNode(
  node: ExecutableNode,
  sessionId: string
): NodeExecutionResult {
  const message = substituteVariables(
    node.data.handoffMessage || 'Let me connect you with a human agent. Please hold.',
    sessionId
  );

  return {
    success: true,
    outputMessage: message,
    shouldEnd: true,
    endReason: 'human_handoff',
    metadata: { department: node.data.department },
  };
}

// =============================================================================
// RESOLVE NEXT NODE
// =============================================================================

/**
 * Determine the next node to transition to based on execution result and edges.
 */
export function resolveNextNode(
  currentNodeId: string,
  result: NodeExecutionResult,
  definition: WorkflowDefinition
): string | null {
  // If the node itself determined the next node
  if (result.nextNodeId) {
    return result.nextNodeId;
  }

  // Look up transitions from current node
  const transitions = definition.transitions.get(currentNodeId) || [];

  if (transitions.length === 0) {
    return null; // No outgoing edges — end of workflow
  }

  // Evaluate conditional transitions
  for (const t of transitions) {
    if (!t.condition) {
      return t.targetNodeId; // Default/unconditional transition
    }
  }

  // If all transitions are conditional and none matched, use first
  return transitions[0]?.targetNodeId || null;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Substitute {{variableName}} placeholders in a string with workflow variables.
 */
function substituteVariables(template: string, sessionId: string): string {
  const variables = workflowState.getAllVariables(sessionId);

  return template.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    const value = variables[varName];
    return value !== undefined ? String(value) : match;
  });
}

/**
 * Simple condition evaluator.
 * Supports: variable == value, variable != value, variable > value, etc.
 */
function evaluateCondition(
  expression: string,
  variables: Record<string, unknown>
): boolean {
  if (!expression.trim()) return false;

  // Replace variable references with values
  let expr = expression;
  for (const [key, value] of Object.entries(variables)) {
    const replacement = typeof value === 'string' ? `"${value}"` : String(value);
    expr = expr.replace(new RegExp(`\\b${key}\\b`, 'g'), replacement);
  }

  // Simple comparisons
  const eqMatch = expr.match(/^"?(.+?)"?\s*(==|!=|>=|<=|>|<)\s*"?(.+?)"?$/);
  if (eqMatch) {
    const [, left, op, right] = eqMatch;
    const l = isNaN(Number(left)) ? left : Number(left);
    const r = isNaN(Number(right)) ? right : Number(right);

    switch (op) {
      case '==': return l == r;
      case '!=': return l != r;
      case '>': return l > r;
      case '<': return l < r;
      case '>=': return l >= r;
      case '<=': return l <= r;
    }
  }

  // Truthy check
  const value = variables[expression.trim()];
  return !!value;
}
