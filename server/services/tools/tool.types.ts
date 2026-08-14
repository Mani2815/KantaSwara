// =============================================================================
// Tool Framework — Type Definitions
// =============================================================================
// Types for the enterprise tool execution system.
// Tools are external capabilities that agents can invoke during conversations
// (HTTP calls, CRM lookups, calendar booking, email sending, webhooks).
// =============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// Tool Definition
// ─────────────────────────────────────────────────────────────────────────────

export type ToolCategory =
  | 'http'
  | 'crm'
  | 'calendar'
  | 'email'
  | 'webhook'
  | 'internal';

export interface ToolDefinition {
  /** Unique tool identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Description for LLM function-calling */
  description: string;
  /** Tool category */
  category: ToolCategory;
  /** JSON Schema for input parameters */
  inputSchema: ToolInputSchema;
  /** Security policy */
  security: ToolSecurityPolicy;
  /** Timeout in milliseconds */
  timeoutMs: number;
  /** Whether this is a built-in tool (not deletable) */
  builtin: boolean;
  /** Organization ID (null for platform-wide built-ins) */
  organizationId?: string | null;
  /** Tool-specific configuration */
  config: Record<string, unknown>;
  /** Whether the tool is active */
  enabled: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Input Schema (JSON Schema subset)
// ─────────────────────────────────────────────────────────────────────────────

export interface ToolInputSchema {
  type: 'object';
  properties: Record<string, ToolInputProperty>;
  required?: string[];
}

export interface ToolInputProperty {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  enum?: string[];
  default?: unknown;
  items?: ToolInputProperty;
}

// ─────────────────────────────────────────────────────────────────────────────
// Security Policy
// ─────────────────────────────────────────────────────────────────────────────

export interface ToolSecurityPolicy {
  /** Allowed domains for HTTP/webhook calls (empty = all) */
  allowedDomains: string[];
  /** Max response body size in bytes */
  maxResponseBytes: number;
  /** Max calls per minute per session */
  rateLimitPerMinute: number;
  /** Whether to strip sensitive headers from outgoing requests */
  stripSensitiveHeaders: boolean;
  /** Whether to log full request/response for auditing */
  auditLogging: boolean;
}

export const DEFAULT_SECURITY_POLICY: ToolSecurityPolicy = {
  allowedDomains: [],
  maxResponseBytes: 1024 * 1024, // 1 MB
  rateLimitPerMinute: 30,
  stripSensitiveHeaders: true,
  auditLogging: true,
};

// ─────────────────────────────────────────────────────────────────────────────
// Execution
// ─────────────────────────────────────────────────────────────────────────────

export interface ToolExecutionInput {
  /** Tool ID */
  toolId: string;
  /** Input parameters (validated against inputSchema) */
  parameters: Record<string, unknown>;
  /** Session ID for rate limiting and context */
  sessionId: string;
  /** Organization ID for tenant scoping */
  organizationId: string;
}

export interface ToolExecutionResult {
  /** Whether execution succeeded */
  success: boolean;
  /** Output data */
  output?: unknown;
  /** Error details */
  error?: ToolExecutionError;
  /** Execution duration in milliseconds */
  durationMs: number;
  /** Metadata for analytics */
  metadata?: Record<string, unknown>;
}

export interface ToolExecutionError {
  code: string;
  message: string;
  /** Whether the tool call can be retried */
  retryable: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool Handler Interface
// ─────────────────────────────────────────────────────────────────────────────

/**
 * All tool implementations must implement this interface.
 * The registry maps tool IDs to handlers.
 */
export interface ToolHandler {
  /** Execute the tool with given parameters */
  execute(
    parameters: Record<string, unknown>,
    config: Record<string, unknown>,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResult>;
}

export interface ToolExecutionContext {
  sessionId: string;
  organizationId: string;
  /** Workflow variables available for template substitution */
  variables?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool Registration Input
// ─────────────────────────────────────────────────────────────────────────────

export interface ToolRegistrationInput {
  name: string;
  description: string;
  category: ToolCategory;
  inputSchema: ToolInputSchema;
  config: Record<string, unknown>;
  security?: Partial<ToolSecurityPolicy>;
  timeoutMs?: number;
}
