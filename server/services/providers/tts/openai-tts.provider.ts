// =============================================================================
// OpenAI TTS Provider
// =============================================================================
// Implements the TTSProvider interface using OpenAI's Audio Speech API.
// Uses tts-1 model for text-to-speech synthesis (optimized for low latency).
// =============================================================================

import type { TTSProvider, TTSResult, TTSOptions } from '../types';

const DEFAULT_MODEL = 'tts-1';
const DEFAULT_VOICE = 'nova'; // Natural, warm female voice — good for Rani
const DEFAULT_FORMAT = 'mp3';

export class OpenAITTSProvider implements TTSProvider {
  readonly name = 'openai-tts';
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    this.baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

    if (!this.apiKey) {
      console.warn('[OpenAITTSProvider] No API key. Set OPENAI_API_KEY.');
    }
  }

  async synthesize(
    text: string,
    options?: TTSOptions
  ): Promise<TTSResult> {
    const model = options?.model || DEFAULT_MODEL;
    const voice = options?.voice || DEFAULT_VOICE;
    const format = options?.format || DEFAULT_FORMAT;
    const speed = options?.speed ?? 1.0;

    const response = await fetch(`${this.baseUrl}/audio/speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: text,
        voice,
        response_format: format,
        speed,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI TTS API error (${response.status}): ${error}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const audio = Buffer.from(arrayBuffer);

    const mimeMap: Record<string, string> = {
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      opus: 'audio/opus',
      aac: 'audio/aac',
      flac: 'audio/flac',
      pcm: 'audio/pcm',
    };

    return {
      audio,
      mimeType: mimeMap[format] || 'audio/mpeg',
    };
  }

  async *synthesizeStream(
    text: string,
    options?: TTSOptions
  ): AsyncIterable<Buffer> {
    const model = options?.model || DEFAULT_MODEL;
    const voice = options?.voice || DEFAULT_VOICE;
    const format = options?.format || DEFAULT_FORMAT;
    const speed = options?.speed ?? 1.0;

    const response = await fetch(`${this.baseUrl}/audio/speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: text,
        voice,
        response_format: format,
        speed,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI TTS API error (${response.status}): ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body for TTS stream');

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        yield Buffer.from(value);
      }
    } finally {
      reader.releaseLock();
    }
  }
}
