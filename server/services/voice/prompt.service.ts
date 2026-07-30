// =============================================================================
// Prompt Service
// =============================================================================
// Assembles LLM prompts from system prompt, conversation history, and context.
// Used by both demo and production voice runtime.
// =============================================================================

import type { LLMMessage } from '../providers/types';

export interface PromptAssemblyParams {
  /** System prompt defining agent persona and behavior */
  systemPrompt: string;
  /** Conversation history (oldest first) */
  history: Array<{ speaker: 'user' | 'agent'; text: string }>;
  /** Current user message */
  userMessage: string;
  /** Maximum number of history messages to include (sliding window) */
  maxContextMessages?: number;
  /** Additional context to inject (e.g., knowledge base results) */
  additionalContext?: string;
}

/**
 * Assemble a complete LLM message array from system prompt + history + user input.
 *
 * Uses a sliding window to keep context within token budget while preserving
 * conversation coherence. Always keeps the system prompt and latest user message.
 */
export function assemblePrompt(params: PromptAssemblyParams): LLMMessage[] {
  const {
    systemPrompt,
    history,
    userMessage,
    maxContextMessages = 20,
    additionalContext,
  } = params;

  const messages: LLMMessage[] = [];

  // 1. System prompt (always first)
  let fullSystemPrompt = systemPrompt;
  if (additionalContext) {
    fullSystemPrompt += `\n\n## ADDITIONAL CONTEXT\n${additionalContext}`;
  }
  messages.push({ role: 'system', content: fullSystemPrompt });

  // 2. Conversation history (sliding window, keep most recent)
  const windowedHistory = history.slice(-maxContextMessages);
  for (const entry of windowedHistory) {
    messages.push({
      role: entry.speaker === 'user' ? 'user' : 'assistant',
      content: entry.text,
    });
  }

  // 3. Current user message
  messages.push({ role: 'user', content: userMessage });

  return messages;
}

/**
 * Estimate token count for a message array (rough approximation).
 * Uses ~4 characters per token as a heuristic.
 */
export function estimateTokenCount(messages: LLMMessage[]): number {
  const totalChars = messages.reduce((sum, m) => sum + m.content.length, 0);
  return Math.ceil(totalChars / 4);
}
