// =============================================================================
// OpenAI Whisper STT Provider
// =============================================================================
// Implements the STTProvider interface using OpenAI's Audio Transcriptions API.
// Uses whisper-1 model for speech-to-text conversion.
// =============================================================================

import type { STTProvider, STTResult, STTOptions } from '../types';

const DEFAULT_MODEL = 'whisper-1';

export class OpenAIWhisperSTTProvider implements STTProvider {
  readonly name = 'openai-whisper';
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    this.baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

    if (!this.apiKey) {
      console.warn('[OpenAIWhisperSTTProvider] No API key. Set OPENAI_API_KEY.');
    }
  }

  async transcribe(
    audio: Buffer,
    mimeType: string,
    options?: STTOptions
  ): Promise<STTResult> {
    const startTime = Date.now();

    // Determine file extension from MIME type
    const extMap: Record<string, string> = {
      'audio/webm': 'webm',
      'audio/webm;codecs=opus': 'webm',
      'audio/wav': 'wav',
      'audio/mpeg': 'mp3',
      'audio/mp4': 'mp4',
      'audio/ogg': 'ogg',
      'audio/flac': 'flac',
    };
    const ext = extMap[mimeType] || 'webm';

    // Build multipart form data
    const formData = new FormData();
    const blob = new Blob([audio], { type: mimeType });
    formData.append('file', blob, `audio.${ext}`);
    formData.append('model', options?.model || DEFAULT_MODEL);
    formData.append('response_format', 'verbose_json');

    if (options?.language) {
      formData.append('language', options.language);
    }

    const response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI Whisper API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    const durationMs = Date.now() - startTime;

    return {
      text: data.text || '',
      confidence: 1.0, // Whisper doesn't return confidence scores
      durationMs,
      words: data.words?.map((w: any) => ({
        word: w.word,
        start: w.start,
        end: w.end,
        confidence: 1.0,
      })),
    };
  }
}
