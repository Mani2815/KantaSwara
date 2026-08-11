// =============================================================================
// Session Manager
// =============================================================================
// Manages the lifecycle of all voice sessions (create, validate, update, end).
// Provides in-memory active session tracking backed by Prisma persistence.
// Multi-tenant: every session is bound to an organization + agent.
// =============================================================================

import { prisma } from '@server/lib/prisma';
import type {
  VoiceSession,
  VoiceSessionState,
  RuntimeContext,
} from './runtime.types';
import { ACTIVE_SESSION_STATES, TERMINAL_SESSION_STATES } from './runtime.types';

// ── In-Memory Active Session Cache ──────────────────────────────────────────

const activeSessions = new Map<string, VoiceSession>();
const sessionsByToken = new Map<string, string>(); // token → sessionId

// ── Session Token Generation ────────────────────────────────────────────────

function generateSessionToken(prefix = 'vs'): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = `${prefix}_`;
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// =============================================================================
// CREATE SESSION
// =============================================================================

export async function createSession(
  context: RuntimeContext,
  callerIdentifier?: string
): Promise<VoiceSession> {
  // ── Validate concurrent session limit ───────────────────────────────────
  const activeCount = await prisma.voiceSession.count({
    where: {
      organizationId: context.organization.id,
      state: { in: ACTIVE_SESSION_STATES },
    },
  });

  if (activeCount >= context.usageLimits.maxConcurrentSessions) {
    throw new SessionError(
      'MAX_CONCURRENT_SESSIONS',
      `Maximum concurrent sessions (${context.usageLimits.maxConcurrentSessions}) reached for this organization.`,
      503
    );
  }

  // ── Create in database ──────────────────────────────────────────────────
  const sessionToken = generateSessionToken();
  const dbSession = await prisma.voiceSession.create({
    data: {
      organizationId: context.organization.id,
      agentId: context.agent.id,
      sessionToken,
      state: 'pending',
      callerIdentifier,
    },
  });

  const session: VoiceSession = {
    id: dbSession.id,
    organizationId: dbSession.organizationId,
    agentId: dbSession.agentId,
    sessionToken: dbSession.sessionToken,
    state: dbSession.state as VoiceSessionState,
    callerIdentifier: dbSession.callerIdentifier ?? undefined,
    startedAt: dbSession.startedAt,
    endedAt: null,
    durationSeconds: 0,
    turnCount: 0,
    totalTokens: 0,
    estimatedCost: 0,
    avgLatencyMs: 0,
    summary: null,
    metadata: (dbSession.metadata as Record<string, unknown>) || {},
  };

  // ── Cache active session ────────────────────────────────────────────────
  activeSessions.set(session.id, session);
  sessionsByToken.set(session.sessionToken, session.id);

  return session;
}

// =============================================================================
// GET SESSION
// =============================================================================

export async function getSession(sessionId: string): Promise<VoiceSession | null> {
  // Check cache first
  const cached = activeSessions.get(sessionId);
  if (cached) return cached;

  // Load from DB
  const dbSession = await prisma.voiceSession.findUnique({
    where: { id: sessionId },
  });
  if (!dbSession) return null;

  return mapDbSession(dbSession);
}

export async function getSessionByToken(sessionToken: string): Promise<VoiceSession | null> {
  // Check cache first
  const sessionId = sessionsByToken.get(sessionToken);
  if (sessionId) {
    const cached = activeSessions.get(sessionId);
    if (cached) return cached;
  }

  // Load from DB
  const dbSession = await prisma.voiceSession.findUnique({
    where: { sessionToken },
  });
  if (!dbSession) return null;

  return mapDbSession(dbSession);
}

// =============================================================================
// UPDATE SESSION STATE
// =============================================================================

export async function updateSessionState(
  sessionId: string,
  newState: VoiceSessionState
): Promise<VoiceSession> {
  const session = await getSession(sessionId);
  if (!session) {
    throw new SessionError('SESSION_NOT_FOUND', 'Session not found.', 404);
  }

  // Don't allow transitioning from terminal states
  if (TERMINAL_SESSION_STATES.includes(session.state)) {
    throw new SessionError(
      'SESSION_ENDED',
      `Cannot update session in "${session.state}" state.`,
      410
    );
  }

  await prisma.voiceSession.update({
    where: { id: sessionId },
    data: { state: newState },
  });

  session.state = newState;

  // Update cache
  if (TERMINAL_SESSION_STATES.includes(newState)) {
    activeSessions.delete(sessionId);
    sessionsByToken.delete(session.sessionToken);
  } else {
    activeSessions.set(sessionId, session);
  }

  return session;
}

// =============================================================================
// INCREMENT TURN & TRACK METRICS
// =============================================================================

export async function recordTurn(
  sessionId: string,
  metrics: {
    tokensUsed: number;
    latencyMs: number;
    estimatedCost: number;
  }
): Promise<void> {
  const session = activeSessions.get(sessionId);

  await prisma.voiceSession.update({
    where: { id: sessionId },
    data: {
      turnCount: { increment: 1 },
      totalTokens: { increment: metrics.tokensUsed },
      estimatedCost: { increment: metrics.estimatedCost },
      // Running average for latency
      avgLatencyMs: session
        ? Math.round(
            (session.avgLatencyMs * session.turnCount + metrics.latencyMs) /
              (session.turnCount + 1)
          )
        : metrics.latencyMs,
    },
  });

  // Update cache
  if (session) {
    session.turnCount += 1;
    session.totalTokens += metrics.tokensUsed;
    session.estimatedCost += metrics.estimatedCost;
    session.avgLatencyMs = Math.round(
      (session.avgLatencyMs * (session.turnCount - 1) + metrics.latencyMs) /
        session.turnCount
    );
  }
}

// =============================================================================
// END SESSION
// =============================================================================

export async function endSession(
  sessionId: string,
  reason: string,
  summary?: string
): Promise<VoiceSession> {
  const session = await getSession(sessionId);
  if (!session) {
    throw new SessionError('SESSION_NOT_FOUND', 'Session not found.', 404);
  }

  const endedAt = new Date();
  const durationSeconds = Math.floor(
    (endedAt.getTime() - session.startedAt.getTime()) / 1000
  );

  const finalState: VoiceSessionState =
    reason === 'error' || reason === 'failed' ? 'failed' :
    reason === 'expired' || reason === 'idle_timeout' ? 'expired' :
    'completed';

  await prisma.voiceSession.update({
    where: { id: sessionId },
    data: {
      state: finalState,
      endedAt,
      durationSeconds,
      summary,
      metadata: {
        ...(session.metadata || {}),
        endReason: reason,
      },
    },
  });

  session.state = finalState;
  session.endedAt = endedAt;
  session.durationSeconds = durationSeconds;
  session.summary = summary ?? null;

  // Clean up cache
  activeSessions.delete(sessionId);
  sessionsByToken.delete(session.sessionToken);

  return session;
}

// =============================================================================
// VALIDATE SESSION
// =============================================================================

/**
 * Validate that a session is active, within limits, and belongs to the
 * specified organization. Returns the session if valid.
 */
export async function validateSession(
  sessionId: string,
  constraints: {
    maxDurationSec: number;
    maxTurns: number;
  },
  organizationId?: string
): Promise<VoiceSession> {
  const session = await getSession(sessionId);
  if (!session) {
    throw new SessionError('SESSION_NOT_FOUND', 'Session not found.', 404);
  }

  // Multi-tenant isolation
  if (organizationId && session.organizationId !== organizationId) {
    throw new SessionError('FORBIDDEN', 'Session does not belong to this organization.', 403);
  }

  // Terminal state check
  if (TERMINAL_SESSION_STATES.includes(session.state)) {
    throw new SessionError('SESSION_ENDED', `Session has ended (${session.state}).`, 410);
  }

  // Duration check
  const elapsedSec = Math.floor(
    (Date.now() - session.startedAt.getTime()) / 1000
  );
  if (elapsedSec >= constraints.maxDurationSec) {
    await endSession(sessionId, 'expired');
    throw new SessionError('SESSION_EXPIRED', 'Session time limit reached.', 410);
  }

  // Turn count check
  if (session.turnCount >= constraints.maxTurns) {
    await endSession(sessionId, 'max_turns');
    throw new SessionError('MAX_TURNS', 'Maximum turns reached.', 410);
  }

  return session;
}

// =============================================================================
// UTILITY
// =============================================================================

export function getActiveSessionCount(): number {
  return activeSessions.size;
}

export function getActiveSessionCountForOrg(orgId: string): number {
  let count = 0;
  for (const session of activeSessions.values()) {
    if (session.organizationId === orgId) count++;
  }
  return count;
}

// ── Map DB record to VoiceSession ───────────────────────────────────────────

function mapDbSession(dbSession: {
  id: string;
  organizationId: string;
  agentId: string;
  sessionToken: string;
  state: string;
  callerIdentifier: string | null;
  startedAt: Date;
  endedAt: Date | null;
  durationSeconds: number;
  turnCount: number;
  totalTokens: number;
  estimatedCost: unknown;
  avgLatencyMs: number;
  summary: string | null;
  metadata: unknown;
}): VoiceSession {
  return {
    id: dbSession.id,
    organizationId: dbSession.organizationId,
    agentId: dbSession.agentId,
    sessionToken: dbSession.sessionToken,
    state: dbSession.state as VoiceSessionState,
    callerIdentifier: dbSession.callerIdentifier ?? undefined,
    startedAt: dbSession.startedAt,
    endedAt: dbSession.endedAt,
    durationSeconds: dbSession.durationSeconds,
    turnCount: dbSession.turnCount,
    totalTokens: dbSession.totalTokens,
    estimatedCost: Number(dbSession.estimatedCost) || 0,
    avgLatencyMs: dbSession.avgLatencyMs,
    summary: dbSession.summary,
    metadata: (dbSession.metadata as Record<string, unknown>) || {},
  };
}

// =============================================================================
// Session Error
// =============================================================================

export class SessionError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, message: string, statusCode = 500) {
    super(message);
    this.name = 'SessionError';
    this.code = code;
    this.statusCode = statusCode;
  }
}
