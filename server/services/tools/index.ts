// =============================================================================
// Tool Framework — Barrel Exports & Initialization
// =============================================================================

// ── Types ───────────────────────────────────────────────────────────────────
export type {
  ToolDefinition,
  ToolHandler,
  ToolExecutionInput,
  ToolExecutionResult,
  ToolExecutionError,
  ToolExecutionContext,
  ToolCategory,
  ToolSecurityPolicy,
  ToolInputSchema,
  ToolInputProperty,
  ToolRegistrationInput,
} from './tool.types';
export { DEFAULT_SECURITY_POLICY } from './tool.types';

// ── Registry ────────────────────────────────────────────────────────────────
export {
  registerTool,
  registerCustomTool,
  getTool,
  getToolHandler,
  listTools,
  listToolsForLLM,
  removeTool,
  enableTool,
  disableTool,
} from './tool-registry.service';

// ── Executor ────────────────────────────────────────────────────────────────
export {
  executeTool,
  clearSessionRateLimits,
  ToolExecutorError,
} from './tool-executor.service';

// ── Built-in Tools ──────────────────────────────────────────────────────────
import { registerHttpTool } from './builtin/http-tool';
import { registerWebhookTool } from './builtin/webhook-tool';

/**
 * Initialize built-in tools. Call once at server startup.
 */
export function initializeBuiltinTools(): void {
  registerHttpTool();
  registerWebhookTool();
  console.log('[ToolFramework] Built-in tools registered: http, webhook');
}
