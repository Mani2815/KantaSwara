// =============================================================================
// Webhook Tool (Built-in)
// =============================================================================
// Fire-and-forget or wait-for-response webhook invocation.
// Supports HMAC signature verification for outgoing webhooks.
// =============================================================================

import * as crypto from 'crypto';
import type {
  ToolHandler,
  ToolExecutionResult,
  ToolExecutionContext,
  ToolDefinition,
} from '../tool.types';
import { DEFAULT_SECURITY_POLICY } from '../tool.types';
import { registerTool } from '../tool-registry.service';

// =============================================================================
// WEBHOOK TOOL HANDLER
// =============================================================================

export const webhookToolHandler: ToolHandler = {
  async execute(
    parameters: Record<string, unknown>,
    config: Record<string, unknown>,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    const startTime = Date.now();

    const url = (parameters.url as string) || (config.url as string);
    const payload = parameters.payload || config.defaultPayload || {};
    const secret = (config.signingSecret as string) || '';
    const waitForResponse = (config.waitForResponse as boolean) ?? false;
    const timeoutMs = (config.timeoutMs as number) || 5000;

    if (!url) {
      return {
        success: false,
        error: { code: 'MISSING_URL', message: 'No webhook URL.', retryable: false },
        durationMs: Date.now() - startTime,
      };
    }

    // Build body
    const body = JSON.stringify({
      event: (parameters.event as string) || 'tool.executed',
      timestamp: new Date().toISOString(),
      sessionId: context.sessionId,
      organizationId: context.organizationId,
      data: payload,
    });

    // Build headers with optional HMAC signature
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'KantaSwara-Webhook/1.0',
    };

    if (secret) {
      const signature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');
      headers['X-Webhook-Signature'] = `sha256=${signature}`;
    }

    try {
      if (!waitForResponse) {
        // Fire-and-forget: don't await the response
        fetch(url, { method: 'POST', headers, body }).catch((err) => {
          console.error(`[WebhookTool] Fire-and-forget failed for ${url}:`, err);
        });

        return {
          success: true,
          output: { delivered: true, mode: 'fire-and-forget' },
          durationMs: Date.now() - startTime,
        };
      }

      // Wait for response
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      let responseData: unknown;
      try {
        responseData = await response.json();
      } catch {
        responseData = await response.text();
      }

      return {
        success: response.ok,
        output: {
          status: response.status,
          data: responseData,
        },
        durationMs: Date.now() - startTime,
        metadata: { url, statusCode: response.status },
      };
    } catch (err) {
      return {
        success: false,
        error: {
          code: 'WEBHOOK_FAILED',
          message: err instanceof Error ? err.message : 'Webhook delivery failed',
          retryable: true,
        },
        durationMs: Date.now() - startTime,
      };
    }
  },
};

// =============================================================================
// REGISTER AS BUILT-IN
// =============================================================================

export function registerWebhookTool(): void {
  const definition: ToolDefinition = {
    id: 'builtin:webhook',
    name: 'Webhook',
    description:
      'Send a webhook notification to an external URL. Supports HMAC signature ' +
      'verification and fire-and-forget or wait-for-response modes.',
    category: 'webhook',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Webhook URL' },
        event: { type: 'string', description: 'Event type (e.g., "lead.qualified")' },
        payload: { type: 'object', description: 'Event payload data' },
      },
      required: ['url'],
    },
    security: { ...DEFAULT_SECURITY_POLICY, rateLimitPerMinute: 10 },
    timeoutMs: 5000,
    builtin: true,
    organizationId: null,
    config: {},
    enabled: true,
  };

  registerTool(definition, webhookToolHandler);
}
