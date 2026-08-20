// =============================================================================
// Deepgram STT Provider
// =============================================================================
// Implements the STTProvider interface using Deepgram's pre-recorded API.
// Default model: nova-2 (high accuracy, fast)
// =============================================================================

import type {
  STTProvider,
  STTResult,
  STTOptions,
} from '../types';

const DEFAULT_MODEL = 'nova-2';

export class DeepgramSTTProvider implements STTProvider {
  readonly name = 'deepgram';
  private apiKey: string;
  private baseUrl = 'https://api.deepgram.com/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.DEEPGRAM_API_KEY || '';
    if (!this.apiKey) {
      console.warn('[DeepgramSTTProvider] No API key. Set DEEPGRAM_API_KEY env var.');
    }
  }

  async transcribe(
    audio: Buffer,
    mimeType: string,
    options?: STTOptions
  ): Promise<STTResult> {
    const startTime = Date.now();
    const model = options?.model || DEFAULT_MODEL;
    const language = options?.language || 'en';

    const queryParams = new URLSearchParams({
      model,
      language,
      punctuate: 'true',
      smart_format: 'true',
    });

    const response = await fetch(
      `${this.baseUrl}/listen?${queryParams.toString()}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${this.apiKey}`,
          'Content-Type': mimeType,
        },
        body: new Uint8Array(audio),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Deepgram API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    const alt = data.results?.channels?.[0]?.alternatives?.[0];

    const words = alt?.words?.map((w: { word: string; start: number; end: number; confidence: number }) => ({
      word: w.word,
      start: w.start,
      end: w.end,
      confidence: w.confidence,
    })) || [];

    return {
      text: alt?.transcript || '',
      confidence: alt?.confidence || 0,
      durationMs: Date.now() - startTime,
      words,
    };
  }
}
