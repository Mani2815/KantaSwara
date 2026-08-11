// =============================================================================
// Memory Manager
// =============================================================================
// Sliding window memory with token budgeting.
// When conversation history exceeds configured limits, automatically
// summarizes older messages to preserve context without losing information.
// Provider-independent — works with any LLMProvider for summarization.
// =============================================================================

import type { LLMProvider, LLMMessage } from '../providers/types';
import * as conversationManager from './conversation-manager.service';
import { estimateTokenCount } from '../voice/prompt.service';

// ── Configuration ───────────────────────────────────────────────────────────

export interface MemoryConfig {
  /** Maximum number of messages before triggering summarization */
  maxMessages: number;
  /** Maximum token budget for conversation context */
  maxTokens: number;
  /** Number of recent messages to always keep (not summarized) */
  keepRecentCount: number;
  /** Minimum messages before summarization is considered */
  summarizeThreshold: number;
}

const DEFAULT_CONFIG: MemoryConfig = {
  maxMessages: 20,
  maxTokens: 4096,
  keepRecentCount: 6,
  summarizeThreshold: 10,
};

// =============================================================================
// GET CONTEXT WINDOW
// =============================================================================

/**
 * Get conversation messages within the token budget.
 * Returns the most recent messages that fit within the budget.
 */
export async function getContextWindow(
  sessionId: string,
  config: Partial<MemoryConfig> = {}
): Promise<Array<{ speaker: 'user' | 'agent' | 'system'; text: string }>> {
  const { maxMessages, maxTokens } = { ...DEFAULT_CONFIG, ...config };

  const history = await conversationManager.getPromptHistory(sessionId);

  // Apply message count limit
  let windowed = history;
  if (windowed.length > maxMessages) {
    windowed = windowed.slice(-maxMessages);
  }

  // Apply token budget
  const withinBudget: typeof windowed = [];
  let tokenCount = 0;

  // Work backwards from most recent to ensure we keep the latest messages
  for (let i = windowed.length - 1; i >= 0; i--) {
    const msg = windowed[i];
    const msgTokens = estimateTokenCount([
      { role: msg.speaker === 'user' ? 'user' : 'assistant', content: msg.text },
    ]);

    if (tokenCount + msgTokens > maxTokens) break;

    tokenCount += msgTokens;
    withinBudget.unshift(msg);
  }

  return withinBudget;
}

// =============================================================================
// SHOULD SUMMARIZE
// =============================================================================

/**
 * Check if the conversation history should be summarized.
 */
export async function shouldSummarize(
  sessionId: string,
  config: Partial<MemoryConfig> = {}
): Promise<boolean> {
  const { summarizeThreshold, maxTokens } = { ...DEFAULT_CONFIG, ...config };

  const history = await conversationManager.getHistory(sessionId);

  // Check message count threshold
  if (history.length < summarizeThreshold) return false;

  // Check if any existing summary is already present as the first message
  if (
    history.length > 0 &&
    history[0].speaker === 'system' &&
    (history[0].metadata as Record<string, unknown>)?.type === 'conversation_summary'
  ) {
    // Already summarized — check if we need to re-summarize
    // Only re-summarize if messages since last summary exceed threshold
    const messagesSinceSummary = history.length - 1;
    if (messagesSinceSummary < summarizeThreshold) return false;
  }

  // Check token budget
  const allMessages: LLMMessage[] = history.map((m) => ({
    role: (m.speaker === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
    content: m.text,
  }));
  const totalTokens = estimateTokenCount(allMessages);

  return totalTokens > maxTokens * 0.8; // Summarize when >80% of budget used
}

// =============================================================================
// SUMMARIZE OLDER MESSAGES
// =============================================================================

/**
 * Summarize older messages using the provided LLM provider.
 * Replaces older messages with a system summary, keeping recent ones intact.
 */
export async function summarizeOlderMessages(
  sessionId: string,
  llmProvider: LLMProvider,
  config: Partial<MemoryConfig> = {}
): Promise<void> {
  const { keepRecentCount } = { ...DEFAULT_CONFIG, ...config };

  const history = await conversationManager.getHistory(sessionId);

  if (history.length <= keepRecentCount + 1) return;

  // Get the messages to summarize
  const toSummarize = history.slice(0, history.length - keepRecentCount);

  // Build summary prompt
  const transcript = toSummarize
    .map((m) => `${m.speaker === 'user' ? 'User' : m.speaker === 'agent' ? 'Agent' : 'System'}: ${m.text}`)
    .join('\n');

  const summaryMessages: LLMMessage[] = [
    {
      role: 'system',
      content:
        'You are a conversation summarizer. Create a concise summary of the following conversation that preserves all key information, decisions, and context. ' +
        'The summary will be used as context for continuing the conversation, so include: ' +
        '1) Main topics discussed ' +
        '2) Any questions asked and answers given ' +
        '3) Any decisions or preferences expressed ' +
        '4) Important details mentioned ' +
        'Keep the summary concise but complete. Write in third person.',
    },
    { role: 'user', content: `Summarize this conversation:\n\n${transcript}` },
  ];

  try {
    const response = await llmProvider.complete(summaryMessages, {
      model: 'gpt-4o-mini',
      maxTokens: 300,
      temperature: 0.3,
    });

    const summaryText = `[Conversation Summary] ${response.text}`;

    await conversationManager.replaceOlderWithSummary(
      sessionId,
      summaryText,
      keepRecentCount
    );

    console.log(
      `[MemoryManager] Summarized ${toSummarize.length} messages for session ${sessionId}`
    );
  } catch (err) {
    console.error('[MemoryManager] Failed to summarize:', err);
    // Non-fatal — conversation continues without summarization
  }
}
