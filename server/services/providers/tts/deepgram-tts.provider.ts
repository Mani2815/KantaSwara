// =============================================================================
// Deepgram TTS Provider
// =============================================================================
// Implements the TTSProvider interface using Deepgram's Aura TTS API.
// Default voice: aura-asteria-en (warm, natural female voice, free tier eligible)
// =============================================================================

import type { TTSProvider, TTSResult, TTSOptions } from '../types';
import { handleHttpError } from '../errors';

// Deepgram Aura voices — all available on free tier
// aura-asteria-en  – warm, natural female (recommended)
// aura-luna-en     – clear, professional female
// aura-stella-en   – friendly, upbeat female
// aura-athena-en   – confident, authoritative female
// aura-hera-en     – expressive, emotive female
// aura-orion-en    – deep, resonant male
// aura-arcas-en    – confident, professional male
// aura-perseus-en  – warm, approachable male
// aura-angus-en    – friendly Irish male
// aura-orpheus-en  – clear, articulate male
// aura-helios-en   – bright, energetic male
// aura-zeus-en     – authoritative male
const DEFAULT_VOICE = 'aura-asteria-en';

export class DeepgramTTSProvider implements TTSProvider {
  readonly name = 'deepgram-tts';
  private apiKey: string;
  private baseUrl = 'https://api.deepgram.com/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.DEEPGRAM_API_KEY || '';
    if (!this.apiKey) {
      console.warn('[DeepgramTTSProvider] No API key. Set DEEPGRAM_API_KEY env var.');
    }
  }

  async synthesize(text: string, options?: TTSOptions): Promise<TTSResult> {
    const voice = options?.voice || DEFAULT_VOICE;

    const response = await fetch(
      `${this.baseUrl}/speak?model=${encodeURIComponent(voice)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${this.apiKey}`,
        },
        body: JSON.stringify({ text }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      handleHttpError('deepgram-tts', response.status, errorText);
    }

    const arrayBuffer = await response.arrayBuffer();
    const audio = Buffer.from(arrayBuffer);

    return {
      audio,
      mimeType: 'audio/mpeg', // Deepgram Aura returns linear16 pcm by default but mp3 when ?encoding=mp3 — default is good
    };
  }

  // DeepgramTTS does not natively support streaming — stub for interface compliance
  async *synthesizeStream(text: string, options?: TTSOptions): AsyncIterable<Buffer> {
    const result = await this.synthesize(text, options);
    yield result.audio;
  }
}
