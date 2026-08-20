// =============================================================================
// ElevenLabs TTS Provider
// =============================================================================
// Implements the TTSProvider interface using ElevenLabs' text-to-speech API.
// Default voice: Rachel (21m00Tcm4TlvDq8ikWAM)
// =============================================================================

import type {
  TTSProvider,
  TTSResult,
  TTSOptions,
} from '../types';

const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel
const DEFAULT_MODEL = 'eleven_turbo_v2_5';

export class ElevenLabsTTSProvider implements TTSProvider {
  readonly name = 'elevenlabs';
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ELEVENLABS_API_KEY || '';
    if (!this.apiKey) {
      console.warn('[ElevenLabsTTSProvider] No API key. Set ELEVENLABS_API_KEY env var.');
    }
  }

  async synthesize(
    text: string,
    options?: TTSOptions
  ): Promise<TTSResult> {
    const startTime = Date.now();
    const voiceId = options?.voice || DEFAULT_VOICE_ID;
    const model = options?.model || DEFAULT_MODEL;

    // Map speed to ElevenLabs stability/similarity (inverted relationship)
    const speed = options?.speed ?? 1.0;

    // Determine output format
    const outputFormat = mapFormat(options?.format);

    const response = await fetch(
      `${this.baseUrl}/text-to-speech/${voiceId}?output_format=${outputFormat}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: model,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            speed,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ElevenLabs API error (${response.status}): ${error}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const audio = Buffer.from(arrayBuffer);

    return {
      audio,
      mimeType: getMimeType(outputFormat),
      durationMs: Date.now() - startTime,
    };
  }
}

// =============================================================================
// HELPERS
// =============================================================================

function mapFormat(format?: string): string {
  switch (format) {
    case 'mp3': return 'mp3_44100_128';
    case 'wav': return 'pcm_44100';
    case 'opus': return 'opus_48000';
    default: return 'mp3_44100_128';
  }
}

function getMimeType(outputFormat: string): string {
  if (outputFormat.startsWith('mp3')) return 'audio/mpeg';
  if (outputFormat.startsWith('pcm')) return 'audio/wav';
  if (outputFormat.startsWith('opus')) return 'audio/opus';
  return 'audio/mpeg';
}
