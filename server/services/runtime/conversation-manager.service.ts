// =============================================================================
// Conversation Manager
// =============================================================================
// Generalized conversation history management for the voice runtime.
// Works with VoiceSession (runtime) conversations, backed by Prisma.
// The existing conversation.service.ts in voice/ continues to handle
// demo-specific DemoMessage persistence.
// =============================================================================

import { prisma } from '@server/lib/prisma';
import { Prisma } from '@prisma/client';
import type { RuntimeMessage } from './runtime.types';

// ── In-Memory Session Cache ─────────────────────────────────────────────────

const messageCache = new Map<string, RuntimeMessage[]>();

// =============================================================================
// ADD MESSAGE
// =============================================================================

/**
 * Add a message to a voice session conversation and persist to DB.
 */
export async function addMessage(
  sessionId: string,
  speaker: 'user' | 'agent' | 'system',
  text: string,
  extras?: {
    role?: 'user' | 'assistant' | 'system';
    processingMs?: number;
    tokensUsed?: number;
    metadata?: Record<string, unknown>;
  }
): Promise<RuntimeMessage> {
  // Map speaker to LLM role
  const role = extras?.role ?? (speaker === 'user' ? 'user' : speaker === 'agent' ? 'assistant' : 'system');

  // Persist to DB
  const dbMessage = await prisma.voiceSessionMessage.create({
    data: {
      sessionId,
      speaker,
      text,
      role,
      processingMs: extras?.processingMs,
      tokensUsed: extras?.tokensUsed,
      metadata: (extras?.metadata ?? {}) as Prisma.InputJsonValue,
    },
  });

  const message: RuntimeMessage = {
    id: dbMessage.id,
    sessionId,
    speaker,
    text,
    role,
    processingMs: extras?.processingMs,
    tokensUsed: extras?.tokensUsed,
    metadata: extras?.metadata,
    createdAt: dbMessage.createdAt,
  };

  // Update cache
  const cached = messageCache.get(sessionId) || [];
  cached.push(message);
  messageCache.set(sessionId, cached);

  return message;
}

// =============================================================================
// GET HISTORY
// =============================================================================

/**
 * Get the full conversation history for a session.
 */
export async function getHistory(sessionId: string): Promise<RuntimeMessage[]> {
  // Check cache
  const cached = messageCache.get(sessionId);
  if (cached) return cached;

  // Load from DB
  const dbMessages = await prisma.voiceSessionMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
  });

  const messages: RuntimeMessage[] = dbMessages.map((m) => ({
    id: m.id,
    sessionId: m.sessionId,
    speaker: m.speaker as 'user' | 'agent' | 'system',
    text: m.text,
    role: (m.role as 'user' | 'assistant' | 'system') ?? undefined,
    processingMs: m.processingMs ?? undefined,
    tokensUsed: m.tokensUsed ?? undefined,
    metadata: (m.metadata as Record<string, unknown>) ?? undefined,
    createdAt: m.createdAt,
  }));

  messageCache.set(sessionId, messages);
  return messages;
}

// =============================================================================
// GET PROMPT HISTORY
// =============================================================================

/**
 * Get a simplified history suitable for prompt assembly (sliding window).
 */
export async function getPromptHistory(
  sessionId: string,
  maxMessages?: number
): Promise<Array<{ speaker: 'user' | 'agent' | 'system'; text: string }>> {
  const history = await getHistory(sessionId);
  const simplified = history.map((m) => ({
    speaker: m.speaker,
    text: m.text,
  }));

  if (maxMessages && simplified.length > maxMessages) {
    return simplified.slice(-maxMessages);
  }

  return simplified;
}

// =============================================================================
// REPLACE MESSAGES (for summarization)
// =============================================================================

/**
 * Replace older messages with a summary message.
 * Used by MemoryManager when conversation exceeds token budget.
 * Keeps the most recent `keepCount` messages intact.
 */
export async function replaceOlderWithSummary(
  sessionId: string,
  summaryText: string,
  keepCount: number
): Promise<void> {
  const history = await getHistory(sessionId);

  if (history.length <= keepCount + 1) return; // Nothing to summarize

  // Identify messages to summarize (all but the last `keepCount`)
  const toSummarize = history.slice(0, history.length - keepCount);
  const toKeep = history.slice(history.length - keepCount);

  // Delete old messages from DB
  const idsToDelete = toSummarize.map((m) => m.id);
  if (idsToDelete.length > 0) {
    await prisma.voiceSessionMessage.deleteMany({
      where: { id: { in: idsToDelete } },
    });
  }

  // Insert summary message
  const summaryMessage = await prisma.voiceSessionMessage.create({
    data: {
      sessionId,
      speaker: 'system',
      text: summaryText,
      role: 'system',
      metadata: {
        type: 'conversation_summary',
        summarizedCount: toSummarize.length,
      },
    },
  });

  // Rebuild cache with summary + kept messages
  const newCache: RuntimeMessage[] = [
    {
      id: summaryMessage.id,
      sessionId,
      speaker: 'system',
      text: summaryText,
      role: 'system',
      metadata: {
        type: 'conversation_summary',
        summarizedCount: toSummarize.length,
      },
      createdAt: summaryMessage.createdAt,
    },
    ...toKeep,
  ];
  messageCache.set(sessionId, newCache);
}

// =============================================================================
// CLEAR CACHE
// =============================================================================

/**
 * Clear the in-memory cache for a session (call on session end).
 */
export function clearSessionCache(sessionId: string): void {
  messageCache.delete(sessionId);
}

/**
 * Get the number of sessions with cached messages.
 */
export function getActiveCacheCount(): number {
  return messageCache.size;
}
