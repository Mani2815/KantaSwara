// =============================================================================
// Provider Abstraction Layer — Type Definitions
// =============================================================================
// All AI providers (STT, LLM, TTS, Telephony) implement these interfaces.
// Providers are swappable at runtime without changing service code.
// =============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// STT (Speech-to-Text) Provider
// ─────────────────────────────────────────────────────────────────────────────

export interface STTResult {
  text: string;
  confidence: number;
  durationMs: number;
  words?: STTWord[];
}

export interface STTWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
}

export interface STTOptions {
  language?: string;
  model?: string;
  /** If true, provider should return interim/partial results */
  interim?: boolean;
}

export interface STTProvider {
  readonly name: string;

  /**
   * Transcribe an audio buffer to text.
   * @param audio - Raw audio data (PCM 16kHz mono or WebM Opus)
   * @param mimeType - MIME type of the audio (e.g. 'audio/webm', 'audio/wav')
   * @param options - Optional configuration
   */
  transcribe(
    audio: Buffer,
    mimeType: string,
    options?: STTOptions
  ): Promise<STTResult>;
}

// ─────────────────────────────────────────────────────────────────────────────
// LLM (Large Language Model) Provider
// ─────────────────────────────────────────────────────────────────────────────

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  text: string;
  finishReason: 'stop' | 'length' | 'content_filter' | 'tool_calls' | null;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMStreamChunk {
  text: string;
  /** True when this is the final chunk */
  done: boolean;
}

export interface LLMOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  /** If provided, called for each streaming chunk */
  onChunk?: (chunk: LLMStreamChunk) => void;
}

export interface LLMProvider {
  readonly name: string;

  /**
   * Generate a completion (non-streaming).
   */
  complete(
    messages: LLMMessage[],
    options?: LLMOptions
  ): Promise<LLMResponse>;

  /**
   * Generate a streaming completion.
   * Returns an async iterable of text chunks.
   */
  stream(
    messages: LLMMessage[],
    options?: LLMOptions
  ): AsyncIterable<LLMStreamChunk>;
}

// ─────────────────────────────────────────────────────────────────────────────
// TTS (Text-to-Speech) Provider
// ─────────────────────────────────────────────────────────────────────────────

export interface TTSResult {
  /** Audio data as a Buffer */
  audio: Buffer;
  /** MIME type of the audio output (e.g. 'audio/mpeg', 'audio/wav') */
  mimeType: string;
  /** Duration in milliseconds */
  durationMs?: number;
}

export interface TTSOptions {
  voice?: string;
  speed?: number;
  /** Output format: 'mp3', 'wav', 'opus', 'pcm' */
  format?: string;
  model?: string;
}

export interface TTSProvider {
  readonly name: string;

  /**
   * Synthesize text to speech audio.
   */
  synthesize(
    text: string,
    options?: TTSOptions
  ): Promise<TTSResult>;

  /**
   * Synthesize text to speech as a stream of audio chunks.
   * Returns an async iterable of audio Buffers.
   */
  synthesizeStream?(
    text: string,
    options?: TTSOptions
  ): AsyncIterable<Buffer>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Telephony Provider (Phase 6 — interface only for now)
// ─────────────────────────────────────────────────────────────────────────────

export interface TelephonyProvider {
  readonly name: string;

  /** Initiate an outbound call */
  makeCall(params: {
    to: string;
    from: string;
    webhookUrl: string;
  }): Promise<{ callSid: string }>;

  /** End an active call */
  endCall(callSid: string): Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider Registry
// ─────────────────────────────────────────────────────────────────────────────

export type ProviderType = 'stt' | 'llm' | 'tts' | 'telephony';

export interface ProviderConfig {
  stt: {
    provider: string;
    apiKey: string;
    options?: STTOptions;
  };
  llm: {
    provider: string;
    apiKey: string;
    options?: LLMOptions;
  };
  tts: {
    provider: string;
    apiKey: string;
    options?: TTSOptions;
  };
}
