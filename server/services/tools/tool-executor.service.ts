// =============================================================================
// Tool Executor
// =============================================================================
// Orchestrates tool execution with validation, security enforcement,
// rate limiting, timeout, and output sanitization.
//
// This is the single entry point for all tool invocations — used by the
// workflow executor (function_call nodes) and future LLM function-calling.
// =============================================================================

import type {
  ToolExecutionInput,
  ToolExecutionResult,
  ToolDefinition,
  ToolExecutionContext,
} from './tool.types';
import { getTool, getToolHandler } from './tool-registry.service';

// ── Rate limit tracking (in-memory, per session) ────────────────────────────

const sessionCallCounts = new Map<string, { count: number; windowStart: number }>();

// =============================================================================
// EXECUTE TOOL
// =============================================================================

/**
 * Execute a registered tool with full validation, security, and rate limiting.
 */
export async function executeTool(
  input: ToolExecutionInput
): Promise<ToolExecutionResult> {
  const startTime = Date.now();

  // ── 1. Resolve tool definition ──────────────────────────────────────────
  const tool = getTool(input.toolId, input.organizationId);
  if (!tool) {
    return {
      success: false,
      error: {
        code: 'TOOL_NOT_FOUND',
        message: `Tool "${input.toolId}" not found or not accessible.`,
        retryable: false,
      },
      durationMs: Date.now() - startTime,
    };
  }

  if (!tool.enabled) {
    return {
      success: false,
      error: {
        code: 'TOOL_DISABLED',
        message: `Tool "${tool.name}" is currently disabled.`,
        retryable: false,
      },
      durationMs: Date.now() - startTime,
    };
  }

  // ── 2. Resolve handler ──────────────────────────────────────────────────
  const handler = getToolHandler(input.toolId);
  if (!handler) {
    return {
      success: false,
      error: {
        code: 'NO_HANDLER',
        message: `No handler registered for tool "${tool.name}".`,
        retryable: false,
      },
      durationMs: Date.now() - startTime,
    };
  }

  // ── 3. Validate input against schema ────────────────────────────────────
  const validationError = validateInput(input.parameters, tool);
  if (validationError) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: validationError,
        retryable: false,
      },
      durationMs: Date.now() - startTime,
    };
  }

  // ── 4. Rate limiting ────────────────────────────────────────────────────
  const rateLimitError = checkRateLimit(input.sessionId, tool);
  if (rateLimitError) {
    return {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: rateLimitError,
        retryable: true,
      },
      durationMs: Date.now() - startTime,
    };
  }

  // ── 5. Execute with timeout ─────────────────────────────────────────────
  const context: ToolExecutionContext = {
    sessionId: input.sessionId,
    organizationId: input.organizationId,
  };

  try {
    const result = await Promise.race([
      handler.execute(input.parameters, tool.config, context),
      new Promise<ToolExecutionResult>((_, reject) =>
        setTimeout(
          () => reject(new Error('TOOL_TIMEOUT')),
          tool.timeoutMs
        )
      ),
    ]);

    // ── 6. Sanitize output ──────────────────────────────────────────────
    result.durationMs = Date.now() - startTime;
    if (result.output) {
      result.output = sanitizeOutput(result.output, tool);
    }

    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const isTimeout = message === 'TOOL_TIMEOUT';

    return {
      success: false,
      error: {
        code: isTimeout ? 'TOOL_TIMEOUT' : 'EXECUTION_ERROR',
        message: isTimeout
          ? `Tool "${tool.name}" timed out after ${tool.timeoutMs}ms.`
          : `Tool "${tool.name}" failed: ${message}`,
        retryable: isTimeout,
      },
      durationMs: Date.now() - startTime,
    };
  }
}

// =============================================================================
// VALIDATION
// =============================================================================

function validateInput(
  parameters: Record<string, unknown>,
  tool: ToolDefinition
): string | null {
  const schema = tool.inputSchema;

  // Check required fields
  if (schema.required) {
    for (const field of schema.required) {
      if (!(field in parameters) || parameters[field] === undefined || parameters[field] === null) {
        return `Missing required parameter: "${field}"`;
      }
    }
  }

  // Check types
  for (const [key, value] of Object.entries(parameters)) {
    const propSchema = schema.properties[key];
    if (!propSchema) continue; // Allow extra fields (lenient)

    const actual = Array.isArray(value) ? 'array' : typeof value;
    if (actual !== propSchema.type) {
      return `Parameter "${key}" must be type "${propSchema.type}", got "${actual}"`;
    }

    // Enum validation
    if (propSchema.enum && typeof value === 'string') {
      if (!propSchema.enum.includes(value)) {
        return `Parameter "${key}" must be one of: ${propSchema.enum.join(', ')}`;
      }
    }
  }

  return null;
}

// =============================================================================
// RATE LIMITING
// =============================================================================

function checkRateLimit(
  sessionId: string,
  tool: ToolDefinition
): string | null {
  const limit = tool.security.rateLimitPerMinute;
  if (limit <= 0) return null;

  const now = Date.now();
  const key = `${sessionId}:${tool.id}`;
  const entry = sessionCallCounts.get(key);

  if (!entry || now - entry.windowStart >= 60000) {
    sessionCallCounts.set(key, { count: 1, windowStart: now });
    return null;
  }

  if (entry.count >= limit) {
    return `Rate limit exceeded: max ${limit} calls/minute for tool "${tool.name}"`;
  }

  entry.count++;
  return null;
}

/**
 * Clear rate limit tracking for a session (call on session end).
 */
export function clearSessionRateLimits(sessionId: string): void {
  for (const key of sessionCallCounts.keys()) {
    if (key.startsWith(`${sessionId}:`)) {
      sessionCallCounts.delete(key);
    }
  }
}

// =============================================================================
// OUTPUT SANITIZATION
// =============================================================================

function sanitizeOutput(
  output: unknown,
  tool: ToolDefinition
): unknown {
  const maxBytes = tool.security.maxResponseBytes;

  // Truncate large string outputs
  if (typeof output === 'string' && output.length > maxBytes) {
    return output.slice(0, maxBytes) + '... [truncated]';
  }

  // Truncate large JSON outputs
  if (typeof output === 'object') {
    const json = JSON.stringify(output);
    if (json.length > maxBytes) {
      return {
        _truncated: true,
        _originalSize: json.length,
        _preview: json.slice(0, 500),
      };
    }
  }

  return output;
}

// =============================================================================
// Tool Executor Error
// =============================================================================

export class ToolExecutorError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, message: string, statusCode = 500) {
    super(message);
    this.name = 'ToolExecutorError';
    this.code = code;
    this.statusCode = statusCode;
  }
}
