// =============================================================================
// Tool Registry
// =============================================================================
// Central registry for all tool definitions and handlers.
// Tools are registered at startup (built-ins) or dynamically (custom tools).
// Organization-scoped access control — tools are either platform-wide or org-owned.
// =============================================================================

import type {
  ToolDefinition,
  ToolHandler,
  ToolRegistrationInput,
  ToolCategory,
} from './tool.types';
import { DEFAULT_SECURITY_POLICY } from './tool.types';

// ── Storage ─────────────────────────────────────────────────────────────────

/** Tool definitions indexed by ID */
const toolDefinitions = new Map<string, ToolDefinition>();

/** Tool handlers indexed by ID */
const toolHandlers = new Map<string, ToolHandler>();

// =============================================================================
// REGISTER TOOL
// =============================================================================

/**
 * Register a tool definition and its handler.
 * Built-in tools have no organizationId and cannot be deleted.
 */
export function registerTool(
  definition: ToolDefinition,
  handler: ToolHandler
): void {
  if (toolDefinitions.has(definition.id)) {
    console.warn(`[ToolRegistry] Overwriting tool "${definition.id}"`);
  }
  toolDefinitions.set(definition.id, definition);
  toolHandlers.set(definition.id, handler);
}

/**
 * Register a custom (org-owned) tool.
 * Returns the generated tool ID.
 */
export function registerCustomTool(
  organizationId: string,
  input: ToolRegistrationInput
): string {
  const id = `${organizationId}:${input.name.toLowerCase().replace(/\s+/g, '-')}`;

  const definition: ToolDefinition = {
    id,
    name: input.name,
    description: input.description,
    category: input.category,
    inputSchema: input.inputSchema,
    security: { ...DEFAULT_SECURITY_POLICY, ...input.security },
    timeoutMs: input.timeoutMs || 10000,
    builtin: false,
    organizationId,
    config: input.config,
    enabled: true,
  };

  // Custom tools use the generic HTTP handler by default
  const handler = getHandlerForCategory(input.category);

  toolDefinitions.set(id, definition);
  toolHandlers.set(id, handler);

  return id;
}

// =============================================================================
// GET / LIST TOOLS
// =============================================================================

/**
 * Get a tool definition by ID.
 * Enforces organization access: returns null if tool belongs to a different org.
 */
export function getTool(
  toolId: string,
  organizationId: string
): ToolDefinition | null {
  const tool = toolDefinitions.get(toolId);
  if (!tool) return null;

  // Platform-wide tools are accessible to all orgs
  if (!tool.organizationId) return tool;

  // Org-owned tools only accessible to that org
  if (tool.organizationId !== organizationId) return null;

  return tool;
}

/**
 * Get the handler for a tool.
 */
export function getToolHandler(toolId: string): ToolHandler | null {
  return toolHandlers.get(toolId) || null;
}

/**
 * List all tools accessible to an organization.
 * Includes platform-wide built-ins + org-owned custom tools.
 */
export function listTools(
  organizationId: string,
  filters?: { category?: ToolCategory; enabledOnly?: boolean }
): ToolDefinition[] {
  const results: ToolDefinition[] = [];

  for (const tool of toolDefinitions.values()) {
    // Access control
    if (tool.organizationId && tool.organizationId !== organizationId) continue;

    // Filters
    if (filters?.category && tool.category !== filters.category) continue;
    if (filters?.enabledOnly && !tool.enabled) continue;

    results.push(tool);
  }

  return results;
}

/**
 * List tools formatted for LLM function-calling.
 * Returns a compact array of { name, description, parameters }.
 */
export function listToolsForLLM(
  organizationId: string
): Array<{ name: string; description: string; parameters: Record<string, unknown> }> {
  const tools = listTools(organizationId, { enabledOnly: true });

  return tools.map((t) => ({
    name: t.id,
    description: t.description,
    parameters: t.inputSchema as unknown as Record<string, unknown>,
  }));
}

// =============================================================================
// REMOVE TOOL
// =============================================================================

/**
 * Remove a custom tool. Cannot remove built-in tools.
 */
export function removeTool(toolId: string, organizationId: string): boolean {
  const tool = toolDefinitions.get(toolId);
  if (!tool) return false;
  if (tool.builtin) return false;
  if (tool.organizationId !== organizationId) return false;

  toolDefinitions.delete(toolId);
  toolHandlers.delete(toolId);
  return true;
}

// =============================================================================
// ENABLE / DISABLE
// =============================================================================

export function enableTool(toolId: string, organizationId: string): boolean {
  const tool = getTool(toolId, organizationId);
  if (!tool) return false;
  tool.enabled = true;
  return true;
}

export function disableTool(toolId: string, organizationId: string): boolean {
  const tool = getTool(toolId, organizationId);
  if (!tool) return false;
  tool.enabled = false;
  return true;
}

// =============================================================================
// HELPERS
// =============================================================================

/** Lazy-load handler for category (avoids circular imports at module level) */
function getHandlerForCategory(category: ToolCategory): ToolHandler {
  // All custom tools route through the HTTP handler for now.
  // The executor resolves the actual handler at runtime.
  return {
    async execute(parameters, config, context) {
      // Placeholder — the ToolExecutor calls the real category handler
      return {
        success: false,
        error: {
          code: 'NOT_IMPLEMENTED',
          message: `No handler registered for category "${category}"`,
          retryable: false,
        },
        durationMs: 0,
      };
    },
  };
}
