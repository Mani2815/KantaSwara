// =============================================================================
// Prompt Assembler
// =============================================================================
// Extended prompt assembly supporting multi-context injection:
//   System Prompt + Organization Context + Knowledge Context
//   + Conversation History + Runtime Context
//
// Replaces the simple assemblePrompt() for runtime use.
// The original prompt.service.ts remains unchanged for demo compatibility.
// =============================================================================

import type { LLMMessage } from '../providers/types';
import type { ExtendedPromptParams } from './runtime.types';
import { estimateTokenCount } from '../voice/prompt.service';

// =============================================================================
// ASSEMBLE PROMPT (Extended)
// =============================================================================

/**
 * Assemble a complete LLM message array from multiple context sources.
 * Token-budget-aware: trims history to fit within budget after higher-priority
 * context sections are included.
 *
 * Priority order (highest to lowest):
 * 1. System prompt (always included)
 * 2. Current user message (always included)
 * 3. Organization context
 * 4. Knowledge context
 * 5. Runtime context
 * 6. Conversation history (trimmed to fit)
 */
export function assembleExtendedPrompt(params: ExtendedPromptParams): LLMMessage[] {
  const {
    systemPrompt,
    organizationContext,
    knowledgeContext,
    history,
    userMessage,
    runtimeContext,
    maxContextMessages = 20,
    maxTokenBudget,
  } = params;

  const messages: LLMMessage[] = [];

  // ── 1. System Prompt (with optional context sections) ───────────────────
  let fullSystemPrompt = systemPrompt;

  if (organizationContext) {
    fullSystemPrompt += `\n\n## ORGANIZATION CONTEXT\n${organizationContext}`;
  }

  if (knowledgeContext) {
    fullSystemPrompt += `\n\n## RELEVANT KNOWLEDGE\nUse the following information to answer the user's question. If the information doesn't contain the answer, say so honestly.\n\n${knowledgeContext}`;
  }

  if (runtimeContext) {
    fullSystemPrompt += `\n\n## RUNTIME CONTEXT\n${runtimeContext}`;
  }

  messages.push({ role: 'system', content: fullSystemPrompt });

  // ── 2. Calculate remaining token budget for history ──────────────────────
  let remainingBudget: number | undefined;

  if (maxTokenBudget) {
    const systemTokens = estimateTokenCount([messages[0]]);
    const userMsgTokens = estimateTokenCount([
      { role: 'user', content: userMessage },
    ]);
    // Reserve tokens for system prompt + user message + some output buffer
    remainingBudget = maxTokenBudget - systemTokens - userMsgTokens - 512;
  }

  // ── 3. Conversation history (sliding window, token-budget-aware) ────────
  let windowedHistory = history.slice(-maxContextMessages);

  if (remainingBudget !== undefined && remainingBudget > 0) {
    // Trim history to fit within remaining budget
    const fittingHistory: typeof windowedHistory = [];
    let usedTokens = 0;

    for (let i = windowedHistory.length - 1; i >= 0; i--) {
      const entry = windowedHistory[i];
      const entryTokens = estimateTokenCount([
        {
          role: entry.speaker === 'user' ? 'user' : 'assistant',
          content: entry.text,
        },
      ]);

      if (usedTokens + entryTokens > remainingBudget) break;
      usedTokens += entryTokens;
      fittingHistory.unshift(entry);
    }

    windowedHistory = fittingHistory;
  }

  for (const entry of windowedHistory) {
    messages.push({
      role: entry.speaker === 'user' ? 'user' : entry.speaker === 'system' ? 'system' : 'assistant',
      content: entry.text,
    });
  }

  // ── 4. Current user message ─────────────────────────────────────────────
  messages.push({ role: 'user', content: userMessage });

  return messages;
}

// =============================================================================
// BUILD ORGANIZATION CONTEXT
// =============================================================================

/**
 * Build organization context string from RuntimeContext.
 */
export function buildOrganizationContext(org: {
  name: string;
  slug: string;
  plan: string;
  settings: Record<string, unknown>;
}): string {
  const lines: string[] = [
    `Organization: ${org.name}`,
  ];

  // Add any org-specific context from settings
  if (org.settings?.industry) {
    lines.push(`Industry: ${org.settings.industry}`);
  }
  if (org.settings?.description) {
    lines.push(`Description: ${org.settings.description}`);
  }

  return lines.join('\n');
}

// =============================================================================
// BUILD RUNTIME CONTEXT
// =============================================================================

/**
 * Build runtime context string with session metadata.
 */
export function buildRuntimeContext(session: {
  turnCount: number;
  durationSeconds: number;
  startedAt: Date;
}): string {
  const lines: string[] = [
    `Current time: ${new Date().toISOString()}`,
    `Session started: ${session.startedAt.toISOString()}`,
    `Conversation turns so far: ${session.turnCount}`,
    `Session duration: ${session.durationSeconds}s`,
  ];

  return lines.join('\n');
}
