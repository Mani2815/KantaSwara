// =============================================================================
// Demo Service
// =============================================================================
// Orchestrates the public demo voice call flow:
// Session creation → Message processing → Session termination
//
// This is the main entry point for all demo API routes.
// It coordinates: rate limiting, session management, STT → LLM → TTS pipeline,
// conversation persistence, and summary generation.
//
// REFACTORED (Milestone 2): Now uses ProviderRegistry from the runtime layer
// instead of direct provider instantiation. Demo behavior is 100% preserved —
// same DemoSession/DemoMessage tables, same rate limiting, same API responses.
// =============================================================================

import { prisma } from '@server/lib/prisma';
import { checkRateLimit } from '@server/utils/rate-limiter';
import { DEMO_AGENT_CONFIG } from './demo.config';
import { getDomainPersona, type DemoDomain } from './domain-personas.config';
import { assemblePrompt } from '../voice/prompt.service';
import {
  addMessage,
  getPromptHistory,
  clearSessionCache,
} from '../voice/conversation.service';
import {
  getSTTProvider,
  getLLMProvider,
  getTTSProvider,
} from '../runtime/provider-registry.service';
import type {
  StartDemoResponse,
  DemoMessageResponse,
  EndDemoResponse,
} from './demo.types';

// =============================================================================
// TIMEOUT HELPER
// =============================================================================

/**
 * Wraps a promise with an AbortSignal-based timeout.
 * Throws a DemoError with a user-friendly message if the timeout is exceeded.
 */
async function withTimeout<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
  errorCode: string,
  errorMessage: string
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const result = await fn(controller.signal);
    clearTimeout(timer);
    return result;
  } catch (err: unknown) {
    clearTimeout(timer);
    if (
      err instanceof Error &&
      (err.name === 'AbortError' || controller.signal.aborted)
    ) {
      throw new DemoError(errorCode, errorMessage, 504);
    }
    throw err;
  }
}

// =============================================================================
// RETRY HELPER (1x retry only)
// =============================================================================

/**
 * Wraps a function with a single retry on failure.
 * The errorMapper converts raw errors into DemoErrors on final failure.
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  errorCode: string,
  errorMessage: string,
  statusCode: number = 502
): Promise<T> {
  try {
    return await fn();
  } catch (firstErr) {
    // If it's already a DemoError from validation (not a provider error), rethrow
    if (
      firstErr instanceof DemoError &&
      ['EMPTY_AUDIO', 'SESSION_NOT_FOUND', 'SESSION_ENDED', 'SESSION_EXPIRED', 'MAX_TURNS', 'EMPTY_INPUT', 'MESSAGE_RATE_LIMITED'].includes(firstErr.code)
    ) {
      throw firstErr;
    }

    console.warn(`[DemoService] ${errorCode} — retrying once...`, firstErr instanceof Error ? firstErr.message : firstErr);

    try {
      return await fn();
    } catch (retryErr) {
      // If retry also fails, throw user-friendly error
      if (retryErr instanceof DemoError) throw retryErr;
      throw new DemoError(errorCode, errorMessage, statusCode);
    }
  }
}

// =============================================================================
// PER-SESSION MESSAGE RATE LIMITER
// =============================================================================

const sessionMessageTimestamps = new Map<string, number>();

/**
 * Checks if a session is sending messages too fast.
 * Max 1 message per 2 seconds per session.
 */
function checkSessionMessageRate(sessionId: string): void {
  const now = Date.now();
  const lastTime = sessionMessageTimestamps.get(sessionId) || 0;

  if (now - lastTime < 2000) {
    throw new DemoError(
      'MESSAGE_RATE_LIMITED',
      'Please wait a moment before sending another message.',
      429
    );
  }

  sessionMessageTimestamps.set(sessionId, now);
}


// ── Provider Resolution (via Registry instead of hardcoded singletons) ───────
function getDemoSTT() {
  return getSTTProvider(DEMO_AGENT_CONFIG.providers.stt);
}

function getDemoLLM() {
  return getLLMProvider(DEMO_AGENT_CONFIG.providers.llm);
}

function getDemoTTS() {
  return getTTSProvider(DEMO_AGENT_CONFIG.providers.tts);
}

// ── Session Token Generation ────────────────────────────────────────────────
function generateSessionToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = 'demo_';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// =============================================================================
// START DEMO SESSION
// =============================================================================

export async function startDemoSession(
  ipAddress: string,
  userAgent: string | null,
  domain: DemoDomain = 'healthcare'
): Promise<StartDemoResponse> {
  const config = DEMO_AGENT_CONFIG;
  const persona = getDomainPersona(domain);

  // ── Rate limiting ───────────────────────────────────────────────────────
  const rateResult = checkRateLimit(
    `demo:${ipAddress}`,
    config.constraints.rateLimitPerIP,
    config.constraints.rateLimitWindowSec
  );

  if (!rateResult.allowed) {
    throw new DemoError(
      'RATE_LIMITED',
      `You've reached the demo limit. Please try again in ${rateResult.retryAfterSec} seconds.`,
      429
    );
  }

  // ── Concurrent session check ────────────────────────────────────────────
  const activeSessions = await prisma.demoSession.count({
    where: { status: 'active' },
  });

  if (activeSessions >= config.constraints.maxConcurrentSessions) {
    throw new DemoError(
      'MAX_SESSIONS',
      'Our demo is experiencing high demand. Please try again in a few minutes.',
      503
    );
  }

  // ── Create session ──────────────────────────────────────────────────────
  const sessionToken = generateSessionToken();
  const session = await prisma.demoSession.create({
    data: {
      sessionToken,
      ipAddress,
      userAgent,
      status: 'active',
      metadata: { domain },
    },
  });

  // ── Store greeting as first agent message ───────────────────────────────
  await addMessage(session.id, 'agent', persona.greeting);

  // ── Generate greeting audio (optional, async) ───────────────────────────
  let greetingAudio: string | undefined;
  try {
    const ttsResult = await getDemoTTS().synthesize(persona.greeting, {
      voice: persona.ttsVoice,
      speed: config.tts.speed,
      format: config.tts.format,
    });
    greetingAudio = ttsResult.audio.toString('base64');
  } catch (err) {
    // TTS failure is non-fatal — text greeting still works
    console.error('[DemoService] Greeting TTS failed:', err);
  }

  return {
    sessionId: session.id,
    sessionToken,
    greeting: persona.greeting,
    greetingAudio,
    agentName: persona.name,
    domain,
    maxDurationSec: config.constraints.maxSessionDurationSec,
  };
}

// =============================================================================
// PROCESS DEMO MESSAGE
// =============================================================================

export async function processDemoMessage(
  sessionToken: string,
  input: { text?: string; audio?: string; audioMimeType?: string }
): Promise<DemoMessageResponse> {
  const startTime = Date.now();
  const config = DEMO_AGENT_CONFIG;

  // ── Validate session ────────────────────────────────────────────────────
  const session = await prisma.demoSession.findUnique({
    where: { sessionToken },
  });

  if (!session) {
    throw new DemoError('SESSION_NOT_FOUND', 'Invalid session token.', 404);
  }

  if (session.status !== 'active') {
    throw new DemoError('SESSION_ENDED', 'This demo session has ended.', 410);
  }

  // ── Resolve domain persona ──────────────────────────────────────────────
  const sessionMeta = (session.metadata as Record<string, unknown>) || {};
  const domain = (sessionMeta.domain as string) || 'healthcare';
  const persona = getDomainPersona(domain);

  // ── Check session limits ────────────────────────────────────────────────
  const elapsed = Math.floor((Date.now() - session.startedAt.getTime()) / 1000);
  if (elapsed >= config.constraints.maxSessionDurationSec) {
    await endSession(session.id, 'max_duration');
    throw new DemoError(
      'SESSION_EXPIRED',
      'The demo session time limit has been reached. Thank you for trying KantaSwara!',
      410
    );
  }

  if (session.turnCount >= config.constraints.maxTurns) {
    await endSession(session.id, 'max_turns');
    throw new DemoError(
      'MAX_TURNS',
      'You\'ve reached the maximum number of exchanges for this demo.',
      410
    );
  }

  // ── Per-session message rate limit ──────────────────────────────────────
  checkSessionMessageRate(session.id);

  // ── Get user text (from text input or audio transcription) ──────────────
  let userText = input.text || '';

  if (input.audio && !userText) {
    const audioBuffer = Buffer.from(input.audio, 'base64');

    const sttResult = await withRetry(
      () =>
        withTimeout(
          (_signal) =>
            getDemoSTT().transcribe(audioBuffer, input.audioMimeType || 'audio/webm'),
          15_000,
          'STT_TIMEOUT',
          "I'm having trouble processing your audio right now. Please try speaking again or switch to text mode."
        ),
      'STT_ERROR',
      "I couldn't transcribe your audio. Please try again or switch to text input."
    );

    userText = sttResult.text;

    if (!userText.trim()) {
      throw new DemoError(
        'EMPTY_AUDIO',
        "I couldn't catch that. Could you please speak again?",
        400
      );
    }
  }

  if (!userText.trim()) {
    throw new DemoError('EMPTY_INPUT', 'Please provide text or audio input.', 400);
  }

  // ── Store user message ──────────────────────────────────────────────────
  await addMessage(session.id, 'user', userText);

  // ── Assemble prompt ─────────────────────────────────────────────────────
  const history = await getPromptHistory(session.id);
  // Remove the last entry since it's the user message we just added
  // and we pass it separately to assemblePrompt
  const historyWithoutCurrent = history.slice(0, -1);

  const messages = assemblePrompt({
    systemPrompt: persona.systemPrompt,
    history: historyWithoutCurrent,
    userMessage: userText,
    maxContextMessages: config.constraints.maxContextMessages,
  });

  // ── Generate LLM response (with 1x retry) ─────────────────────────────
  const llmResponse = await withRetry(
    () =>
      withTimeout(
        (_signal) =>
          getDemoLLM().complete(messages, {
            model: config.llm.model,
            temperature: config.llm.temperature,
            maxTokens: config.llm.maxTokens,
            topP: config.llm.topP,
          }),
        30_000,
        'LLM_TIMEOUT',
        "I'm taking a moment to think. Please try your message again."
      ),
    'LLM_ERROR',
    "I had trouble generating a response. Please try again."
  );

  const agentText = llmResponse.text;

  // ── Store agent message ─────────────────────────────────────────────────
  const processingMs = Date.now() - startTime;
  await addMessage(session.id, 'agent', agentText, {
    processingMs,
    tokensUsed: llmResponse.usage.totalTokens,
  });

  // ── Generate TTS audio ────────────────────────────────────────────────
  let audioBase64: string | undefined;
  let audioMimeType: string | undefined;
  try {
    const ttsResult = await withTimeout(
      (_signal) =>
        getDemoTTS().synthesize(agentText, {
          voice: persona.ttsVoice,
          speed: config.tts.speed,
          format: config.tts.format,
        }),
      15_000,
      'TTS_TIMEOUT',
      'TTS timeout'
    );
    audioBase64 = ttsResult.audio.toString('base64');
    audioMimeType = ttsResult.mimeType;
  } catch (err) {
    // TTS failure is non-fatal — text response still works
    console.error('[DemoService] TTS failed (non-fatal):', err);
  }

  // ── Check if session should auto-end ────────────────────────────────────
  const updatedSession = await prisma.demoSession.findUnique({
    where: { id: session.id },
    select: { turnCount: true },
  });
  const newTurnCount = updatedSession?.turnCount || session.turnCount + 1;
  const newElapsed = Math.floor((Date.now() - session.startedAt.getTime()) / 1000);

  const shouldEnd =
    newTurnCount >= config.constraints.maxTurns ||
    newElapsed >= config.constraints.maxSessionDurationSec - 30; // warn 30s before end

  let endReason: string | undefined;
  if (newTurnCount >= config.constraints.maxTurns) endReason = 'max_turns';
  if (newElapsed >= config.constraints.maxSessionDurationSec - 30) endReason = 'time_warning';

  return {
    messageId: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    text: agentText,
    userText,
    audio: audioBase64,
    audioMimeType,
    processingMs: Date.now() - startTime,
    turnCount: newTurnCount,
    shouldEnd,
    endReason,
  };
}

// =============================================================================
// END DEMO SESSION
// =============================================================================

export async function endDemoSession(
  sessionToken: string
): Promise<EndDemoResponse> {
  const session = await prisma.demoSession.findUnique({
    where: { sessionToken },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!session) {
    throw new DemoError('SESSION_NOT_FOUND', 'Invalid session token.', 404);
  }

  // Resolve persona name for summary
  const sessionMeta = (session.metadata as Record<string, unknown>) || {};
  const domain = (sessionMeta.domain as string) || 'healthcare';
  const persona = getDomainPersona(domain);

  // Generate summary using LLM
  const summary = await generateSummary(session.messages, persona.name);

  // Update session
  const durationSeconds = Math.floor(
    (Date.now() - session.startedAt.getTime()) / 1000
  );

  await prisma.demoSession.update({
    where: { id: session.id },
    data: {
      status: 'completed',
      endedAt: new Date(),
      durationSeconds,
      summary,
    },
  });

  // Clean up caches
  clearSessionCache(session.id);
  sessionMessageTimestamps.delete(session.id);

  return {
    summary,
    durationSeconds,
    turnCount: session.turnCount,
    transcript: session.messages.map((m) => ({
      speaker: m.speaker as 'user' | 'agent',
      text: m.text,
      timestamp: m.createdAt.toISOString(),
    })),
  };
}

// =============================================================================
// SUBMIT FEEDBACK
// =============================================================================

export async function submitFeedback(
  sessionToken: string,
  rating: number,
  feedback?: string
): Promise<void> {
  const session = await prisma.demoSession.findUnique({
    where: { sessionToken },
  });

  if (!session) {
    throw new DemoError('SESSION_NOT_FOUND', 'Invalid session token.', 404);
  }

  await prisma.demoSession.update({
    where: { id: session.id },
    data: {
      feedbackRating: rating,
      feedbackText: feedback,
    },
  });
}

// =============================================================================
// INTERNAL HELPERS
// =============================================================================

async function endSession(sessionId: string, reason: string): Promise<void> {
  try {
    // Fetch existing metadata to merge — avoids overwriting domain and other fields
    const existing = await prisma.demoSession.findUnique({
      where: { id: sessionId },
      select: { metadata: true },
    });
    const existingMeta =
      (existing?.metadata as Record<string, unknown>) ?? {};

    await prisma.demoSession.update({
      where: { id: sessionId },
      data: {
        status: 'completed',
        endedAt: new Date(),
        metadata: { ...existingMeta, endReason: reason },
      },
    });
    clearSessionCache(sessionId);
    sessionMessageTimestamps.delete(sessionId);
  } catch {
    // Non-fatal
  }
}

async function generateSummary(
  messages: Array<{ speaker: string; text: string }>,
  agentName: string = 'Agent'
): Promise<string> {
  if (messages.length === 0) return 'No conversation recorded.';

  const transcript = messages
    .map((m) => `${m.speaker === 'user' ? 'Visitor' : agentName}: ${m.text}`)
    .join('\n');

  try {
    const response = await getDemoLLM().complete(
      [
        {
          role: 'system',
          content:
            `You are a conversation summarizer. Generate a brief 2-3 sentence summary of the following demo conversation between a visitor and ${agentName} (KantaSwara AI agent). Focus on what the visitor was interested in and any next steps mentioned.`,
        },
        { role: 'user', content: transcript },
      ],
      { model: 'gpt-4o-mini', maxTokens: 150, temperature: 0.3 }
    );
    return response.text;
  } catch {
    return 'Demo conversation completed. Visit our platform to learn more about KantaSwara.';
  }
}

// =============================================================================
// DEMO ERROR CLASS
// =============================================================================

export class DemoError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, message: string, statusCode: number = 500) {
    super(message);
    this.name = 'DemoError';
    this.code = code;
    this.statusCode = statusCode;
  }
}
