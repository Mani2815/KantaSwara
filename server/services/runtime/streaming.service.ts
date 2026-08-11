// =============================================================================
// Streaming Service
// =============================================================================
// Bridges LLM streaming output to SSE events for real-time transcript delivery.
// Accumulates full response text for post-processing (TTS, storage).
// Emits partial transcript events as LLM chunks arrive.
// =============================================================================

import type { LLMProvider, LLMMessage, LLMOptions } from '../providers/types';

// ── Types ───────────────────────────────────────────────────────────────────

export interface SSEController {
  push(eventType: string, data: unknown): void;
  isOpen(): boolean;
}

export interface StreamingResult {
  /** The complete accumulated text from the LLM */
  fullText: string;
  /** Whether the stream completed successfully */
  completed: boolean;
  /** Total tokens used (if available from final chunk) */
  tokensUsed?: number;
}

// =============================================================================
// STREAM LLM RESPONSE
// =============================================================================

/**
 * Stream an LLM response, pushing partial transcript events to the SSE controller.
 * Accumulates the full response text for downstream use (TTS, storage).
 *
 * SSE Events emitted:
 * - `thinking` with `{ status: 'generating' }` at start
 * - `transcript` with `{ speaker: 'agent', text: chunk, partial: true }` per chunk
 * - `transcript` with `{ speaker: 'agent', text: fullText, partial: false }` at end
 */
export async function streamLLMResponse(
  messages: LLMMessage[],
  llmProvider: LLMProvider,
  options: LLMOptions,
  sse: SSEController
): Promise<StreamingResult> {
  let fullText = '';
  let completed = false;

  // Notify frontend that generation has started
  sse.push('thinking', { status: 'generating' });

  try {
    const stream = llmProvider.stream(messages, options);

    for await (const chunk of stream) {
      if (!sse.isOpen()) {
        // Client disconnected — stop generating
        break;
      }

      if (chunk.text) {
        fullText += chunk.text;

        // Push partial transcript event
        sse.push('transcript', {
          speaker: 'agent',
          text: chunk.text,
          partial: true,
          timestamp: new Date().toISOString(),
        });
      }

      if (chunk.done) {
        completed = true;
      }
    }

    // Push final transcript event with complete text
    if (sse.isOpen() && fullText) {
      sse.push('transcript', {
        speaker: 'agent',
        text: fullText,
        partial: false,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error('[StreamingService] LLM streaming error:', err);

    if (sse.isOpen()) {
      sse.push('error', {
        code: 'LLM_STREAM_ERROR',
        message: 'Failed to generate response.',
      });
    }

    // If we got partial text, return it
    return { fullText, completed: false };
  }

  return { fullText, completed };
}

// =============================================================================
// NON-STREAMING FALLBACK
// =============================================================================

/**
 * Generate a complete LLM response without streaming.
 * Pushes a single transcript event when complete.
 * Used when streaming is disabled or unavailable.
 */
export async function generateNonStreaming(
  messages: LLMMessage[],
  llmProvider: LLMProvider,
  options: LLMOptions,
  sse?: SSEController
): Promise<StreamingResult> {
  if (sse) {
    sse.push('thinking', { status: 'generating' });
  }

  try {
    const response = await llmProvider.complete(messages, options);

    if (sse?.isOpen()) {
      sse.push('transcript', {
        speaker: 'agent',
        text: response.text,
        partial: false,
        timestamp: new Date().toISOString(),
      });
    }

    return {
      fullText: response.text,
      completed: true,
      tokensUsed: response.usage.totalTokens,
    };
  } catch (err) {
    console.error('[StreamingService] LLM non-streaming error:', err);

    if (sse?.isOpen()) {
      sse.push('error', {
        code: 'LLM_ERROR',
        message: 'Failed to generate response.',
      });
    }

    return { fullText: '', completed: false };
  }
}
