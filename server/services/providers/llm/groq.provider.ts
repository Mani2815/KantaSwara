// =============================================================================
// Groq LLM Provider
// =============================================================================
// Implements the LLMProvider interface using Groq's API.
// Compatible models: llama-3.1-8b-instant, mixtral-8x7b-32768, etc.
// Groq uses the OpenAI-compatible API format.
// =============================================================================

import type {
  LLMProvider,
  LLMMessage,
  LLMResponse,
  LLMStreamChunk,
  LLMOptions,
} from '../types';
import { handleHttpError } from '../errors';

const DEFAULT_MODEL = 'llama-3.1-8b-instant';
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 512;

export class GroqLLMProvider implements LLMProvider {
  readonly name = 'groq';
  private apiKey: string;
  private baseUrl = 'https://api.groq.com/openai/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GROQ_API_KEY || '';
    if (!this.apiKey) {
      console.warn('[GroqLLMProvider] No API key. Set GROQ_API_KEY env var.');
    }
  }

  async complete(
    messages: LLMMessage[],
    options?: LLMOptions
  ): Promise<LLMResponse> {
    const model = options?.model || DEFAULT_MODEL;
    const temperature = options?.temperature ?? DEFAULT_TEMPERATURE;
    const maxTokens = options?.maxTokens ?? DEFAULT_MAX_TOKENS;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        top_p: options?.topP,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      handleHttpError('groq', response.status, errorText);
    }

    const data = await response.json();
    const choice = data.choices?.[0];

    return {
      text: choice?.message?.content || '',
      finishReason: choice?.finish_reason || null,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
    };
  }

  async *stream(
    messages: LLMMessage[],
    options?: LLMOptions
  ): AsyncIterable<LLMStreamChunk> {
    const model = options?.model || DEFAULT_MODEL;
    const temperature = options?.temperature ?? DEFAULT_TEMPERATURE;
    const maxTokens = options?.maxTokens ?? DEFAULT_MAX_TOKENS;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        top_p: options?.topP,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      handleHttpError('groq', response.status, errorText);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const data = trimmed.slice(6);
          if (data === '[DONE]') {
            yield { text: '', done: true };
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            const finishReason = parsed.choices?.[0]?.finish_reason;

            if (delta) {
              const chunk: LLMStreamChunk = {
                text: delta,
                done: finishReason === 'stop',
              };
              if (options?.onChunk) options.onChunk(chunk);
              yield chunk;
            } else if (finishReason === 'stop') {
              yield { text: '', done: true };
            }
          } catch {
            // Skip malformed JSON lines
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
