// =============================================================================
// Analytics Collector
// =============================================================================
// Records metrics from voice sessions, provider invocations, workflow
// execution, and tool calls. Writes to the VoiceSession and
// VoiceSessionMessage tables (already in Prisma schema).
//
// All writes are fire-and-forget to avoid blocking the voice pipeline.
// =============================================================================

import { prisma } from '@server/lib/prisma';
import { Prisma } from '@prisma/client';
import type { SessionMetrics } from '../runtime/runtime.types';
import type { SessionAnalyticsRecord } from './analytics.types';
import { PROVIDER_COST_MODELS } from './analytics.types';

// ── In-Memory Accumulator (flushed on session end) ──────────────────────────

interface SessionAccumulator {
  organizationId: string;
  agentId: string;
  startedAt: Date;
  turnCount: number;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  totalLatencyMs: number;
  sttLatencyMs: number;
  llmLatencyMs: number;
  ttsLatencyMs: number;
  sttProvider: string;
  llmProvider: string;
  ttsProvider: string;
  failoverEvents: string[];
  toolsUsed: Set<string>;
  errorCount: number;
  workflowId: string | null;
}

const accumulators = new Map<string, SessionAccumulator>();

// =============================================================================
// INITIALIZE SESSION TRACKING
// =============================================================================

export function initSessionTracking(
  sessionId: string,
  organizationId: string,
  agentId: string,
  providers: { stt: string; llm: string; tts: string },
  workflowId?: string | null
): void {
  accumulators.set(sessionId, {
    organizationId,
    agentId,
    startedAt: new Date(),
    turnCount: 0,
    totalTokens: 0,
    promptTokens: 0,
    completionTokens: 0,
    totalLatencyMs: 0,
    sttLatencyMs: 0,
    llmLatencyMs: 0,
    ttsLatencyMs: 0,
    sttProvider: providers.stt,
    llmProvider: providers.llm,
    ttsProvider: providers.tts,
    failoverEvents: [],
    toolsUsed: new Set(),
    errorCount: 0,
    workflowId: workflowId || null,
  });
}

// =============================================================================
// RECORD TURN METRICS
// =============================================================================

/**
 * Record metrics for a single conversation turn.
 * Called after each processMessage() in the voice runtime.
 */
export function recordTurnMetrics(
  sessionId: string,
  metrics: SessionMetrics
): void {
  const acc = accumulators.get(sessionId);
  if (!acc) return;

  acc.turnCount++;
  acc.totalTokens += metrics.totalTokens;
  acc.promptTokens += metrics.promptTokens;
  acc.completionTokens += metrics.completionTokens;
  acc.totalLatencyMs += metrics.totalLatencyMs;
  acc.sttLatencyMs += metrics.sttLatencyMs;
  acc.llmLatencyMs += metrics.llmLatencyMs;
  acc.ttsLatencyMs += metrics.ttsLatencyMs;
}

// =============================================================================
// RECORD PROVIDER FAILOVER
// =============================================================================

export function recordFailover(
  sessionId: string,
  fromProvider: string,
  toProvider: string,
  providerType: string
): void {
  const acc = accumulators.get(sessionId);
  if (!acc) return;

  acc.failoverEvents.push(`${providerType}:${fromProvider}->${toProvider}`);
}

// =============================================================================
// RECORD TOOL USAGE
// =============================================================================

export function recordToolUsage(sessionId: string, toolId: string): void {
  const acc = accumulators.get(sessionId);
  if (!acc) return;

  acc.toolsUsed.add(toolId);
}

// =============================================================================
// RECORD ERROR
// =============================================================================

export function recordError(sessionId: string): void {
  const acc = accumulators.get(sessionId);
  if (!acc) return;

  acc.errorCount++;
}

// =============================================================================
// FLUSH SESSION (on session end)
// =============================================================================

/**
 * Finalize and persist session analytics. Call on session completion.
 * Non-blocking — errors are logged but don't propagate.
 */
export async function flushSessionAnalytics(
  sessionId: string,
  endReason?: string
): Promise<void> {
  const acc = accumulators.get(sessionId);
  if (!acc) return;

  try {
    const endedAt = new Date();
    const durationSeconds = Math.round(
      (endedAt.getTime() - acc.startedAt.getTime()) / 1000
    );
    const estimatedCost = calculateSessionCost(acc);

    // Update the VoiceSession record
    await prisma.voiceSession.update({
      where: { id: sessionId },
      data: {
        endedAt,
        state: 'completed',
        durationSeconds,
        turnCount: acc.turnCount,
        totalTokens: acc.totalTokens,
        estimatedCost,
        avgLatencyMs: acc.turnCount > 0
          ? Math.round(acc.totalLatencyMs / acc.turnCount)
          : 0,
        metadata: {
          sttProvider: acc.sttProvider,
          llmProvider: acc.llmProvider,
          ttsProvider: acc.ttsProvider,
          failoverEvents: acc.failoverEvents,
          toolsUsed: Array.from(acc.toolsUsed),
          errorCount: acc.errorCount,
          endReason: endReason || 'completed',
          promptTokens: acc.promptTokens,
          completionTokens: acc.completionTokens,
          workflowId: acc.workflowId,
        } as unknown as Prisma.InputJsonValue,
      },
    });
  } catch (err) {
    console.error('[AnalyticsCollector] Failed to flush session analytics:', err);
  } finally {
    accumulators.delete(sessionId);
  }
}

// =============================================================================
// COST CALCULATION
// =============================================================================

function calculateSessionCost(acc: SessionAccumulator): number {
  let cost = 0;

  // LLM cost
  const llmModel = PROVIDER_COST_MODELS[acc.llmProvider];
  if (llmModel) {
    cost += (acc.promptTokens / 1000) * llmModel.inputCostPer1k;
    cost += (acc.completionTokens / 1000) * llmModel.outputCostPer1k;
  }

  // STT cost (rough estimate based on turns * avg audio duration)
  const sttModel = PROVIDER_COST_MODELS[acc.sttProvider];
  if (sttModel?.audioCostPerMinute) {
    // Approximate 10s of audio per turn
    const estimatedMinutes = (acc.turnCount * 10) / 60;
    cost += estimatedMinutes * sttModel.audioCostPerMinute;
  }

  // TTS cost (rough estimate based on output tokens)
  const ttsModel = PROVIDER_COST_MODELS[acc.ttsProvider];
  if (ttsModel?.charCostPer1k) {
    // Approximate 4 chars per token
    const estimatedChars = acc.completionTokens * 4;
    cost += (estimatedChars / 1000) * ttsModel.charCostPer1k;
  }

  return Math.round(cost * 10000) / 10000; // 4 decimal places
}

/**
 * Calculate cost for specific token usage.
 */
export function calculateCost(
  providerId: string,
  promptTokens: number,
  completionTokens: number
): number {
  const model = PROVIDER_COST_MODELS[providerId];
  if (!model) return 0;

  const cost =
    (promptTokens / 1000) * model.inputCostPer1k +
    (completionTokens / 1000) * model.outputCostPer1k;

  return Math.round(cost * 10000) / 10000;
}
