// =============================================================================
// Voice Runtime Orchestrator
// =============================================================================
// The single orchestration layer for the full voice pipeline:
//   audio/text → STT → conversation update → knowledge retrieval →
//   prompt assembly → LLM → TTS → stream response
//
// Every step is modular and replaceable. Uses ProviderRegistry to resolve
// providers from RuntimeContext. Tracks metrics per step.
// =============================================================================

import type {
  RuntimeContext,
  RuntimeMessageInput,
  RuntimeMessageOutput,
  SessionMetrics,
} from './runtime.types';
import type { SSEController } from './streaming.service';

import * as sessionManager from './session-manager.service';
import * as conversationManager from './conversation-manager.service';
import * as memoryManager from './memory-manager.service';
import {
  assembleExtendedPrompt,
  buildOrganizationContext,
  buildRuntimeContext,
} from './prompt-assembler.service';
import { streamLLMResponse, generateNonStreaming } from './streaming.service';
import { getSTTProvider, getLLMProvider, getTTSProvider } from './provider-registry.service';

// =============================================================================
// PROCESS MESSAGE (Non-Streaming)
// =============================================================================

/**
 * Process a single message through the full voice pipeline.
 * Returns the complete response with audio.
 */
export async function processMessage(
  sessionId: string,
  input: RuntimeMessageInput,
  context: RuntimeContext
): Promise<RuntimeMessageOutput> {
  const startTime = Date.now();
  const metrics: SessionMetrics = {
    sttLatencyMs: 0,
    llmLatencyMs: 0,
    ttsLatencyMs: 0,
    totalLatencyMs: 0,
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    estimatedCost: 0,
  };

  // ── Validate session ────────────────────────────────────────────────────
  await sessionManager.validateSession(sessionId, {
    maxDurationSec: context.usageLimits.maxSessionDurationSec,
    maxTurns: context.usageLimits.maxTurns,
  }, context.organization.id);

  await sessionManager.updateSessionState(sessionId, 'listening');

  // ── Step 1: STT (if audio input) ────────────────────────────────────────
  let userText = input.text || '';

  if (input.audio && !userText) {
    const sttStart = Date.now();
    const sttProvider = getSTTProvider(context.providers.stt.provider);
    const audioBuffer = Buffer.from(input.audio, 'base64');
    const sttResult = await sttProvider.transcribe(
      audioBuffer,
      input.audioMimeType || 'audio/webm',
      context.providers.stt.options
    );
    userText = sttResult.text;
    metrics.sttLatencyMs = Date.now() - sttStart;

    if (!userText.trim()) {
      throw new RuntimeError(
        'EMPTY_AUDIO',
        "I couldn't catch that. Could you please speak again?",
        400
      );
    }
  }

  if (!userText.trim()) {
    throw new RuntimeError('EMPTY_INPUT', 'Please provide text or audio input.', 400);
  }

  // ── Step 2: Store user message ──────────────────────────────────────────
  await conversationManager.addMessage(sessionId, 'user', userText);

  await sessionManager.updateSessionState(sessionId, 'thinking');

  // ── Step 3: Memory management ───────────────────────────────────────────
  const llmProvider = getLLMProvider(context.providers.llm.provider);

  if (context.features.memorySummarization) {
    const needsSummary = await memoryManager.shouldSummarize(sessionId, {
      summarizeThreshold: context.constraints.summarizeAfterMessages,
      maxTokens: context.constraints.maxContextTokens,
    });

    if (needsSummary) {
      await memoryManager.summarizeOlderMessages(sessionId, llmProvider, {
        keepRecentCount: 6,
      });
    }
  }

  // ── Step 4: Knowledge retrieval (future) ────────────────────────────────
  let knowledgeContext: string | undefined;

  if (context.features.knowledgeEnabled && context.agent.knowledgeBaseIds.length > 0) {
    // Knowledge retrieval will be wired in Phase 4
    // For now, this is a placeholder
    knowledgeContext = undefined;
  }

  // ── Step 5: Prompt assembly ─────────────────────────────────────────────
  const session = await sessionManager.getSession(sessionId);
  const history = await conversationManager.getPromptHistory(
    sessionId,
    context.constraints.maxContextMessages
  );

  // Remove the last entry (the user message we just added) since we pass it separately
  const historyWithoutCurrent = history.slice(0, -1);

  const messages = assembleExtendedPrompt({
    systemPrompt: context.agent.systemPrompt,
    organizationContext: buildOrganizationContext(context.organization),
    knowledgeContext,
    history: historyWithoutCurrent,
    userMessage: userText,
    runtimeContext: session
      ? buildRuntimeContext({
          turnCount: session.turnCount,
          durationSeconds: session.durationSeconds,
          startedAt: session.startedAt,
        })
      : undefined,
    maxContextMessages: context.constraints.maxContextMessages,
    maxTokenBudget: context.constraints.maxContextTokens,
  });

  // ── Step 6: LLM response ───────────────────────────────────────────────
  const llmStart = Date.now();
  const llmResponse = await llmProvider.complete(messages, {
    ...context.providers.llm.options,
  });
  const agentText = llmResponse.text;
  metrics.llmLatencyMs = Date.now() - llmStart;
  metrics.promptTokens = llmResponse.usage.promptTokens;
  metrics.completionTokens = llmResponse.usage.completionTokens;
  metrics.totalTokens = llmResponse.usage.totalTokens;

  // ── Step 7: Store agent message ─────────────────────────────────────────
  const processingMs = Date.now() - startTime;
  await conversationManager.addMessage(sessionId, 'agent', agentText, {
    processingMs,
    tokensUsed: llmResponse.usage.totalTokens,
  });

  // ── Step 8: TTS synthesis ───────────────────────────────────────────────
  await sessionManager.updateSessionState(sessionId, 'speaking');

  let audioBase64: string | undefined;
  let audioMimeType: string | undefined;

  try {
    const ttsStart = Date.now();
    const ttsProvider = getTTSProvider(context.providers.tts.provider);
    const ttsResult = await ttsProvider.synthesize(agentText, {
      voice: context.agent.voiceConfig.voice,
      speed: context.agent.voiceConfig.speed,
      format: context.agent.voiceConfig.format,
    });
    audioBase64 = ttsResult.audio.toString('base64');
    audioMimeType = ttsResult.mimeType;
    metrics.ttsLatencyMs = Date.now() - ttsStart;
  } catch (err) {
    console.error('[VoiceRuntime] TTS failed:', err);
    // Non-fatal — text response still works
  }

  // ── Step 9: Track metrics ───────────────────────────────────────────────
  metrics.totalLatencyMs = Date.now() - startTime;

  await sessionManager.recordTurn(sessionId, {
    tokensUsed: metrics.totalTokens,
    latencyMs: metrics.totalLatencyMs,
    estimatedCost: metrics.estimatedCost,
  });

  await sessionManager.updateSessionState(sessionId, 'listening');

  // ── Check if session should auto-end ────────────────────────────────────
  const updatedSession = await sessionManager.getSession(sessionId);
  const currentTurnCount = updatedSession?.turnCount || 0;
  const currentElapsed = updatedSession
    ? Math.floor((Date.now() - updatedSession.startedAt.getTime()) / 1000)
    : 0;

  const shouldEnd =
    currentTurnCount >= context.usageLimits.maxTurns ||
    currentElapsed >= context.usageLimits.maxSessionDurationSec - 30;

  let endReason: string | undefined;
  if (currentTurnCount >= context.usageLimits.maxTurns) endReason = 'max_turns';
  if (currentElapsed >= context.usageLimits.maxSessionDurationSec - 30) endReason = 'time_warning';

  return {
    messageId: `msg_${Date.now()}`,
    userText,
    agentText,
    audio: audioBase64,
    audioMimeType,
    metrics,
    turnCount: currentTurnCount,
    shouldEnd,
    endReason,
  };
}

// =============================================================================
// PROCESS MESSAGE (Streaming — SSE)
// =============================================================================

/**
 * Process a message with streaming LLM output via SSE.
 * Partial transcript events are pushed as LLM generates tokens.
 * TTS is triggered after full text is accumulated.
 */
export async function processMessageStreaming(
  sessionId: string,
  input: RuntimeMessageInput,
  context: RuntimeContext,
  sse: SSEController
): Promise<void> {
  const startTime = Date.now();

  try {
    // ── Validate session ──────────────────────────────────────────────────
    await sessionManager.validateSession(sessionId, {
      maxDurationSec: context.usageLimits.maxSessionDurationSec,
      maxTurns: context.usageLimits.maxTurns,
    }, context.organization.id);

    await sessionManager.updateSessionState(sessionId, 'listening');

    // ── STT ───────────────────────────────────────────────────────────────
    let userText = input.text || '';

    if (input.audio && !userText) {
      sse.push('thinking', { status: 'processing' });
      const sttProvider = getSTTProvider(context.providers.stt.provider);
      const audioBuffer = Buffer.from(input.audio, 'base64');
      const sttResult = await sttProvider.transcribe(
        audioBuffer,
        input.audioMimeType || 'audio/webm',
        context.providers.stt.options
      );
      userText = sttResult.text;

      // Push user transcript
      sse.push('transcript', {
        speaker: 'user',
        text: userText,
        partial: false,
        timestamp: new Date().toISOString(),
      });

      if (!userText.trim()) {
        sse.push('error', {
          code: 'EMPTY_AUDIO',
          message: "I couldn't catch that. Could you please speak again?",
        });
        sse.push('done', {});
        return;
      }
    }

    if (!userText.trim()) {
      sse.push('error', {
        code: 'EMPTY_INPUT',
        message: 'Please provide text or audio input.',
      });
      sse.push('done', {});
      return;
    }

    // ── Store user message ────────────────────────────────────────────────
    await conversationManager.addMessage(sessionId, 'user', userText);
    await sessionManager.updateSessionState(sessionId, 'thinking');

    // ── Memory management ─────────────────────────────────────────────────
    const llmProvider = getLLMProvider(context.providers.llm.provider);

    if (context.features.memorySummarization) {
      const needsSummary = await memoryManager.shouldSummarize(sessionId, {
        summarizeThreshold: context.constraints.summarizeAfterMessages,
        maxTokens: context.constraints.maxContextTokens,
      });
      if (needsSummary) {
        await memoryManager.summarizeOlderMessages(sessionId, llmProvider);
      }
    }

    // ── Knowledge retrieval ───────────────────────────────────────────────
    let knowledgeContext: string | undefined;
    if (context.features.knowledgeEnabled && context.agent.knowledgeBaseIds.length > 0) {
      knowledgeContext = undefined; // Phase 4 wiring
    }

    // ── Prompt assembly ───────────────────────────────────────────────────
    const session = await sessionManager.getSession(sessionId);
    const history = await conversationManager.getPromptHistory(
      sessionId,
      context.constraints.maxContextMessages
    );
    const historyWithoutCurrent = history.slice(0, -1);

    const messages = assembleExtendedPrompt({
      systemPrompt: context.agent.systemPrompt,
      organizationContext: buildOrganizationContext(context.organization),
      knowledgeContext,
      history: historyWithoutCurrent,
      userMessage: userText,
      runtimeContext: session
        ? buildRuntimeContext({
            turnCount: session.turnCount,
            durationSeconds: session.durationSeconds,
            startedAt: session.startedAt,
          })
        : undefined,
      maxContextMessages: context.constraints.maxContextMessages,
      maxTokenBudget: context.constraints.maxContextTokens,
    });

    // ── Streaming LLM ─────────────────────────────────────────────────────
    const streamResult = await streamLLMResponse(
      messages,
      llmProvider,
      { ...context.providers.llm.options },
      sse
    );

    const agentText = streamResult.fullText;

    if (!agentText) {
      sse.push('error', {
        code: 'EMPTY_RESPONSE',
        message: 'The agent did not generate a response.',
      });
      sse.push('done', {});
      return;
    }

    // ── Store agent message ───────────────────────────────────────────────
    const processingMs = Date.now() - startTime;
    await conversationManager.addMessage(sessionId, 'agent', agentText, {
      processingMs,
      tokensUsed: streamResult.tokensUsed,
    });

    // ── TTS ───────────────────────────────────────────────────────────────
    await sessionManager.updateSessionState(sessionId, 'speaking');
    sse.push('thinking', { status: 'synthesizing' });

    try {
      const ttsProvider = getTTSProvider(context.providers.tts.provider);
      const ttsResult = await ttsProvider.synthesize(agentText, {
        voice: context.agent.voiceConfig.voice,
        speed: context.agent.voiceConfig.speed,
        format: context.agent.voiceConfig.format,
      });

      sse.push('audio', {
        audio: ttsResult.audio.toString('base64'),
        mimeType: ttsResult.mimeType,
        final: true,
      });
    } catch (err) {
      console.error('[VoiceRuntime] TTS failed:', err);
      // Non-fatal — transcript was already sent
    }

    // ── Track metrics ─────────────────────────────────────────────────────
    const totalLatency = Date.now() - startTime;
    await sessionManager.recordTurn(sessionId, {
      tokensUsed: streamResult.tokensUsed || 0,
      latencyMs: totalLatency,
      estimatedCost: 0,
    });

    await sessionManager.updateSessionState(sessionId, 'listening');

    // ── Done ──────────────────────────────────────────────────────────────
    sse.push('done', {
      turnCount: (await sessionManager.getSession(sessionId))?.turnCount || 0,
    });
  } catch (err) {
    console.error('[VoiceRuntime] Streaming pipeline error:', err);
    if (sse.isOpen()) {
      sse.push('error', {
        code: 'PIPELINE_ERROR',
        message: err instanceof Error ? err.message : 'An unexpected error occurred.',
      });
      sse.push('done', {});
    }
  }
}

// =============================================================================
// Runtime Error
// =============================================================================

export class RuntimeError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, message: string, statusCode = 500) {
    super(message);
    this.name = 'RuntimeError';
    this.code = code;
    this.statusCode = statusCode;
  }
}
