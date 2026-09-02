// =============================================================================
// Deepgram Live Streaming STT Client
// =============================================================================
// Persistent WebSocket connection to Deepgram's live transcription API.
// Receives PCM16 audio frames and emits partial + final transcripts.
//
// Key features:
// - Streaming STT (transcription happens while user is speaking)
// - interim_results for live partial transcripts
// - Deepgram-side endpointing as backup signal
// - KeepAlive to prevent timeout during silence
// =============================================================================

import WebSocket from 'ws';

export interface DeepgramLiveSTTOptions {
  apiKey: string;
  model?: string;
  language?: string;
  sampleRate?: number;
  endpointingMs?: number;
  utteranceEndMs?: number;
}

export interface DeepgramLiveSTTCallbacks {
  onPartial: (text: string) => void;
  onFinal: (text: string, confidence: number) => void;
  onError: (error: Error) => void;
  onClose: () => void;
}

export class DeepgramLiveSTT {
  private ws: WebSocket | null = null;
  private keepAliveInterval: ReturnType<typeof setInterval> | null = null;
  private _connected = false;

  constructor(
    private options: DeepgramLiveSTTOptions,
    private callbacks: DeepgramLiveSTTCallbacks,
  ) {}

  /**
   * Open the WebSocket connection to Deepgram Live STT.
   * Resolves when the connection is established.
   */
  async connect(): Promise<void> {
    const params = new URLSearchParams({
      model: this.options.model || 'nova-2',
      language: this.options.language || 'en',
      smart_format: 'true',
      punctuate: 'true',
      interim_results: 'true',
      endpointing: String(this.options.endpointingMs ?? 300),
      utterance_end_ms: String(this.options.utteranceEndMs ?? 1200),
      vad_events: 'true',
      encoding: 'linear16',
      sample_rate: String(this.options.sampleRate ?? 16000),
      channels: '1',
    });

    const url = `wss://api.deepgram.com/v1/listen?${params.toString()}`;

    return new Promise<void>((resolve, reject) => {
      this.ws = new WebSocket(url, {
        headers: { Authorization: `Token ${this.options.apiKey}` },
      });

      const connectTimeout = setTimeout(() => {
        reject(new Error('Deepgram Live STT connection timeout (10s)'));
        this.ws?.close();
      }, 10000);

      this.ws.on('open', () => {
        clearTimeout(connectTimeout);
        this._connected = true;
        console.log('[DeepgramLiveSTT] Connected');

        // Send KeepAlive every 8s to prevent Deepgram from closing idle connections
        this.keepAliveInterval = setInterval(() => {
          this.keepAlive();
        }, 8000);

        resolve();
      });

      this.ws.on('message', (data: WebSocket.RawData) => {
        try {
          const msg = JSON.parse(data.toString());
          this.handleMessage(msg);
        } catch (err) {
          console.error('[DeepgramLiveSTT] Failed to parse message:', err);
        }
      });

      this.ws.on('error', (err: Error) => {
        clearTimeout(connectTimeout);
        console.error('[DeepgramLiveSTT] WebSocket error:', err.message);
        this.callbacks.onError(err);
      });

      this.ws.on('close', () => {
        clearTimeout(connectTimeout);
        this._connected = false;
        this.clearKeepAlive();
        console.log('[DeepgramLiveSTT] Connection closed');
        this.callbacks.onClose();
      });
    });
  }

  /**
   * Handle incoming Deepgram messages.
   */
  private handleMessage(msg: Record<string, unknown>): void {
    if (msg.type === 'Results') {
      const channel = msg.channel as Record<string, unknown> | undefined;
      const alternatives = (channel?.alternatives as Array<Record<string, unknown>>) ?? [];
      const alt = alternatives[0];

      if (alt && typeof alt.transcript === 'string' && alt.transcript.trim()) {
        const isFinal = Boolean(msg.is_final);
        const confidence = typeof alt.confidence === 'number' ? alt.confidence : 0;

        if (isFinal) {
          this.callbacks.onFinal(alt.transcript, confidence);
        } else {
          this.callbacks.onPartial(alt.transcript);
        }
      }
    }
    // UtteranceEnd is handled by the orchestrator's end-of-turn logic
  }

  /**
   * Send raw PCM16 audio frame to Deepgram.
   * @param pcm16 - Buffer containing signed 16-bit linear PCM audio
   */
  sendAudio(pcm16: Buffer): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(pcm16);
    }
  }

  /**
   * Send KeepAlive to prevent Deepgram from closing the connection during silence.
   */
  keepAlive(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'KeepAlive' }));
    }
  }

  /**
   * Gracefully close the connection.
   */
  close(): void {
    this.clearKeepAlive();
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'CloseStream' }));
      this.ws.close();
    }
    this._connected = false;
  }

  get connected(): boolean {
    return this._connected;
  }

  private clearKeepAlive(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }
}
