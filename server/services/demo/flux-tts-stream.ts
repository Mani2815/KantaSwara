// =============================================================================
// Deepgram Flux TTS Streaming Client
// =============================================================================
// Persistent WebSocket connection to Deepgram's Flux TTS API (/v2/speak).
// Designed for conversational voice agents:
// - Stream LLM text progressively via speak()
// - Receive PCM audio chunks in real time
// - Native interruption via interrupt() (reports text_spoken/text_remaining)
// - Maintains tone/prosody across turns
//
// Flux handles clause/sentence boundary detection internally.
// We send text progressively; Flux decides when to start generating audio.
// =============================================================================

import WebSocket from 'ws';

// ── Streaming TTS Provider Interface ──────────────────────────────────────────
// Abstraction for swappable TTS backends (Flux primary, Aura fallback)

export interface StreamingTTSProvider {
  connect(): Promise<void>;
  speak(text: string): void;
  flush(): void;
  interrupt(): void;
  clear(): void;
  isHealthy(): boolean;
  close(): void;
}

// ── Flux TTS Events (server → client) ────────────────────────────────────────

export interface FluxInterruptReport {
  textSpoken: string;
  textRemaining: string;
}

export interface FluxTTSCallbacks {
  onAudio: (pcmChunk: Buffer) => void;
  onInterruptReport: (report: FluxInterruptReport) => void;
  onSpeechStarted: () => void;
  onError: (error: Error) => void;
  onClose: () => void;
}

// ── Flux TTS Stream Implementation ───────────────────────────────────────────

export class FluxTTSStream implements StreamingTTSProvider {
  private ws: WebSocket | null = null;
  private _connected = false;

  constructor(
    private apiKey: string,
    private voice: string,
    private callbacks: FluxTTSCallbacks,
    private sampleRate: number = 24000,
  ) {}

  /**
   * Open the WebSocket connection to Deepgram Flux TTS.
   */
  async connect(): Promise<void> {
    const params = new URLSearchParams({
      model: this.voice,
      encoding: 'linear16',
      sample_rate: String(this.sampleRate),
    });

    const url = `wss://api.deepgram.com/v2/speak?${params.toString()}`;

    return new Promise<void>((resolve, reject) => {
      this.ws = new WebSocket(url, {
        headers: { Authorization: `Token ${this.apiKey}` },
      });

      const connectTimeout = setTimeout(() => {
        reject(new Error('Deepgram Flux TTS connection timeout (10s)'));
        this.ws?.close();
      }, 10000);

      this.ws.on('open', () => {
        clearTimeout(connectTimeout);
        this._connected = true;
        console.log(`[FluxTTS] Connected (voice: ${this.voice})`);
        resolve();
      });

      this.ws.on('message', (data: WebSocket.RawData, isBinary: boolean) => {
        if (isBinary) {
          // Binary = PCM audio chunk → forward to browser
          this.callbacks.onAudio(Buffer.from(data as ArrayBuffer));
        } else {
          // JSON = control event
          try {
            const msg = JSON.parse(data.toString());
            this.handleControlMessage(msg);
          } catch (err) {
            console.error('[FluxTTS] Failed to parse control message:', err);
          }
        }
      });

      this.ws.on('error', (err: Error) => {
        clearTimeout(connectTimeout);
        console.error('[FluxTTS] WebSocket error:', err.message);
        this.callbacks.onError(err);
      });

      this.ws.on('close', () => {
        clearTimeout(connectTimeout);
        this._connected = false;
        console.log('[FluxTTS] Connection closed');
        this.callbacks.onClose();
      });
    });
  }

  /**
   * Handle Flux control messages.
   */
  private handleControlMessage(msg: Record<string, unknown>): void {
    switch (msg.type) {
      case 'SpeechStarted':
        this.callbacks.onSpeechStarted();
        break;

      case 'Interrupt':
        this.callbacks.onInterruptReport({
          textSpoken: (msg.text_spoken as string) ?? '',
          textRemaining: (msg.text_remaining as string) ?? '',
        });
        break;

      case 'SpeechMetadata':
        // Turn metadata — can be used for analytics/logging
        break;

      case 'Error':
        this.callbacks.onError(
          new Error(`Flux TTS error: ${msg.message ?? 'unknown'}`)
        );
        break;
    }
  }

  /**
   * Stream text progressively into Flux.
   * Flux handles speech segmentation internally — we don't need to send
   * complete sentences. Send text as soon as it's available from the LLM.
   */
  speak(text: string): void {
    if (!this._connected || !this.ws) return;
    this.ws.send(JSON.stringify({ type: 'Speak', text }));
  }

  /**
   * Signal end of current turn's text.
   * Flux will finish generating audio for any remaining buffered text.
   */
  flush(): void {
    if (!this._connected || !this.ws) return;
    this.ws.send(JSON.stringify({ type: 'Flush' }));
  }

  /**
   * Interrupt the current turn.
   * Cancels active generation and reports text_spoken / text_remaining.
   * Use this for barge-in (user starts speaking while agent is talking).
   */
  interrupt(): void {
    if (!this._connected || !this.ws) return;
    this.ws.send(JSON.stringify({ type: 'Interrupt' }));
  }

  /**
   * Clear buffered content without interrupt semantics.
   * Use for cleanup, not for barge-in.
   */
  clear(): void {
    if (!this._connected || !this.ws) return;
    this.ws.send(JSON.stringify({ type: 'Clear' }));
  }

  isHealthy(): boolean {
    return this._connected;
  }

  close(): void {
    if (this.ws) {
      this.ws.close();
    }
    this._connected = false;
  }
}
