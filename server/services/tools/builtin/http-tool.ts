// =============================================================================
// HTTP Tool (Built-in)
// =============================================================================
// Generic HTTP request tool. Configurable method, headers, body template,
// response mapping. Enforces domain allowlisting and timeout.
//
// Used by both workflow api_call nodes and agent function-calling.
// =============================================================================

import type {
  ToolHandler,
  ToolExecutionResult,
  ToolExecutionContext,
  ToolDefinition,
} from '../tool.types';
import { DEFAULT_SECURITY_POLICY } from '../tool.types';
import { registerTool } from '../tool-registry.service';

// =============================================================================
// HTTP TOOL HANDLER
// =============================================================================

export const httpToolHandler: ToolHandler = {
  async execute(
    parameters: Record<string, unknown>,
    config: Record<string, unknown>,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    const startTime = Date.now();

    const url = substituteVars(
      (parameters.url as string) || (config.url as string) || '',
      context.variables
    );
    const method = ((parameters.method as string) || (config.method as string) || 'GET').toUpperCase();
    const headers = {
      ...((config.headers as Record<string, string>) || {}),
      ...((parameters.headers as Record<string, string>) || {}),
    };
    const bodyTemplate = (parameters.body as string) || (config.body as string);
    const timeoutMs = (config.timeoutMs as number) || 10000;

    if (!url) {
      return {
        success: false,
        error: { code: 'MISSING_URL', message: 'No URL provided.', retryable: false },
        durationMs: Date.now() - startTime,
      };
    }

    // ── Domain validation ─────────────────────────────────────────────────
    const allowedDomains = (config.allowedDomains as string[]) || [];
    if (allowedDomains.length > 0) {
      try {
        const hostname = new URL(url).hostname;
        const allowed = allowedDomains.some(
          (d) => hostname === d || hostname.endsWith(`.${d}`)
        );
        if (!allowed) {
          return {
            success: false,
            error: {
              code: 'DOMAIN_BLOCKED',
              message: `Domain "${hostname}" is not in the allowed list.`,
              retryable: false,
            },
            durationMs: Date.now() - startTime,
          };
        }
      } catch {
        return {
          success: false,
          error: { code: 'INVALID_URL', message: `Invalid URL: ${url}`, retryable: false },
          durationMs: Date.now() - startTime,
        };
      }
    }

    // ── Execute request ───────────────────────────────────────────────────
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      // Set default content type for POST/PUT
      if (['POST', 'PUT', 'PATCH'].includes(method) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }

      const body = bodyTemplate
        ? substituteVars(bodyTemplate, context.variables)
        : undefined;

      const response = await fetch(url, {
        method,
        headers,
        body: method !== 'GET' && method !== 'HEAD' ? body : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      // Parse response
      let responseData: unknown;
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      // Extract specific field if responseMapping is configured
      const responseMapping = config.responseMapping as string | undefined;
      if (responseMapping && typeof responseData === 'object' && responseData) {
        const mapped = getNestedValue(responseData as Record<string, unknown>, responseMapping);
        if (mapped !== undefined) {
          responseData = mapped;
        }
      }

      return {
        success: response.ok,
        output: {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
        },
        durationMs: Date.now() - startTime,
        metadata: {
          url,
          method,
          statusCode: response.status,
        },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      const isAbort = message.includes('abort');

      return {
        success: false,
        error: {
          code: isAbort ? 'TIMEOUT' : 'REQUEST_FAILED',
          message: isAbort ? `HTTP request timed out after ${timeoutMs}ms` : message,
          retryable: isAbort,
        },
        durationMs: Date.now() - startTime,
      };
    }
  },
};

// =============================================================================
// REGISTER AS BUILT-IN
// =============================================================================

export function registerHttpTool(): void {
  const definition: ToolDefinition = {
    id: 'builtin:http',
    name: 'HTTP Request',
    description:
      'Make an HTTP request to an external API. Supports GET, POST, PUT, PATCH, DELETE. ' +
      'Configure URL, headers, body template, and response field mapping.',
    category: 'http',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'The URL to call' },
        method: {
          type: 'string',
          description: 'HTTP method',
          enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        },
        headers: { type: 'object', description: 'Additional HTTP headers' },
        body: { type: 'string', description: 'Request body (JSON string)' },
      },
      required: ['url'],
    },
    security: { ...DEFAULT_SECURITY_POLICY },
    timeoutMs: 10000,
    builtin: true,
    organizationId: null,
    config: {},
    enabled: true,
  };

  registerTool(definition, httpToolHandler);
}

// =============================================================================
// HELPERS
// =============================================================================

function substituteVars(
  template: string,
  variables?: Record<string, unknown>
): string {
  if (!variables) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    const value = variables[varName];
    return value !== undefined ? String(value) : match;
  });
}

function getNestedValue(
  obj: Record<string, unknown>,
  path: string
): unknown {
  return path.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}
