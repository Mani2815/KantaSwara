// =============================================================================
// Conversation Service
// =============================================================================
// Manages conversation message history, context windows, and persistence.
// Provides an in-memory session cache backed by Prisma for durability.
// =============================================================================

import { prisma } from '@server/lib/prisma';

export interface ConversationMessage {
  id: string;
  speaker: 'user' | 'agent';
  text: string;
  processingMs?: number;
  tokensUsed?: number;
  createdAt: Date;
}

// ── In-Memory Session Cache ─────────────────────────────────────────────────
// Keeps active session messages in memory for fast access.
// Flushed to DB on each message and on session end.

const sessionCache = new Map<string, ConversationMessage[]>();

/**
 * Get the conversation history for a demo session (from cache or DB).
 */
export async function getConversationHistory(
  sessionId: string
): Promise<ConversationMessage[]> {
  // Check cache first
  const cached = sessionCache.get(sessionId);
  if (cached) return cached;

  // Load from DB
  const messages = await prisma.demoMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
  });

  const history: ConversationMessage[] = messages.map((m) => ({
    id: m.id,
    speaker: m.speaker as 'user' | 'agent',
    text: m.text,
    processingMs: m.processingMs ?? undefined,
    tokensUsed: m.tokensUsed ?? undefined,
    createdAt: m.createdAt,
  }));

  sessionCache.set(sessionId, history);
  return history;
}

/**
 * Add a message to the conversation and persist to DB.
 */
export async function addMessage(
  sessionId: string,
  speaker: 'user' | 'agent',
  text: string,
  extras?: {
    processingMs?: number;
    tokensUsed?: number;
    confidence?: number;
  }
): Promise<ConversationMessage> {
  // Persist to DB
  const dbMessage = await prisma.demoMessage.create({
    data: {
      sessionId,
      speaker,
      text,
      processingMs: extras?.processingMs,
      tokensUsed: extras?.tokensUsed,
      confidence: extras?.confidence,
    },
  });

  const message: ConversationMessage = {
    id: dbMessage.id,
    speaker,
    text,
    processingMs: extras?.processingMs,
    tokensUsed: extras?.tokensUsed,
    createdAt: dbMessage.createdAt,
  };

  // Update cache
  const cached = sessionCache.get(sessionId) || [];
  cached.push(message);
  sessionCache.set(sessionId, cached);

  // Update turn count on the session
  if (speaker === 'user') {
    await prisma.demoSession.update({
      where: { id: sessionId },
      data: { turnCount: { increment: 1 } },
    });
  }

  return message;
}

/**
 * Get a simplified history array suitable for prompt assembly.
 */
export async function getPromptHistory(
  sessionId: string
): Promise<Array<{ speaker: 'user' | 'agent'; text: string }>> {
  const history = await getConversationHistory(sessionId);
  return history.map((m) => ({ speaker: m.speaker, text: m.text }));
}

/**
 * Clear the in-memory cache for a session (call on session end).
 */
export function clearSessionCache(sessionId: string): void {
  sessionCache.delete(sessionId);
}

/**
 * Get the number of active sessions in cache.
 */
export function getActiveCacheCount(): number {
  return sessionCache.size;
}
