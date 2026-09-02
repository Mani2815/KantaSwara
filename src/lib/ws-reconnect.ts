// =============================================================================
// WebSocket Reconnection Client
// =============================================================================
// Manages a WebSocket connection with automatic reconnection and resume.
// Implements the reconnect/resume protocol from the implementation plan:
// - Tracks server sequence numbers for resume
// - Exponential backoff on disconnect
// - Multiplexed binary (PCM audio) and JSON (control) messages
// =============================================================================

export interface ReconnectWSCallbacks {
  /** Called when connection is established (initial or reconnect) */
  onOpen: () => void;
  /** Called with JSON control messages from server */
  onMessage: (msg: Record<string, unknown>) => void;
  /** Called with binary audio data from server */
  onBinaryMessage: (data: ArrayBuffer) => void;
  /** Called when connection is lost */
  onDisconnect: () => void;
  /** Called on unrecoverable error */
  onError: (error: Error) => void;
}

export interface ReconnectWSOptions {
  url: string;
  maxRetries?: number;
  initialBackoffMs?: number;
  maxBackoffMs?: number;
}

export class ReconnectWS {
  private ws: WebSocket | null = null;
  private lastServerSeq = -1;
  private sessionId: string | null = null;
  private sessionToken: string | null = null;
  private retryCount = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private _connected = false;
  private _intentionallyClosed = false;

  private maxRetries: number;
  private initialBackoffMs: number;
  private maxBackoffMs: number;

  constructor(
    private options: ReconnectWSOptions,
    private callbacks: ReconnectWSCallbacks,
  ) {
    this.maxRetries = options.maxRetries ?? 10;
    this.initialBackoffMs = options.initialBackoffMs ?? 200;
    this.maxBackoffMs = options.maxBackoffMs ?? 3000;
  }

  /**
   * Connect to the WebSocket server.
   */
  connect(): void {
    this._intentionallyClosed = false;
    this.createSocket();
  }

  private createSocket(): void {
    try {
      this.ws = new WebSocket(this.options.url);
      this.ws.binaryType = 'arraybuffer';

      this.ws.onopen = () => {
        this._connected = true;
        this.retryCount = 0;
        console.log('[ReconnectWS] Connected');
        this.callbacks.onOpen();
      };

      this.ws.onmessage = (event: MessageEvent) => {
        if (event.data instanceof ArrayBuffer) {
          // Binary = PCM audio from TTS
          this.callbacks.onBinaryMessage(event.data);
        } else {
          // JSON = control message
          try {
            const msg = JSON.parse(event.data as string);

            // Track sequence numbers for reconnect/resume
            if (typeof msg.seq === 'number') {
              this.lastServerSeq = msg.seq;
            }

            // Track session info for resume
            if (msg.type === 'session_created') {
              this.sessionId = msg.sessionId as string;
            }

            this.callbacks.onMessage(msg);
          } catch (err) {
            console.error('[ReconnectWS] Failed to parse message:', err);
          }
        }
      };

      this.ws.onclose = () => {
        this._connected = false;
        this.callbacks.onDisconnect();

        if (!this._intentionallyClosed) {
          this.attemptReconnect();
        }
      };

      this.ws.onerror = (event: Event) => {
        console.error('[ReconnectWS] WebSocket error:', event);
      };
    } catch (err) {
      this.callbacks.onError(
        err instanceof Error ? err : new Error('Failed to create WebSocket')
      );
    }
  }

  private attemptReconnect(): void {
    if (this.retryCount >= this.maxRetries) {
      console.error(`[ReconnectWS] Max retries (${this.maxRetries}) exceeded`);
      this.callbacks.onError(new Error('WebSocket reconnection failed'));
      return;
    }

    const backoff = Math.min(
      this.initialBackoffMs * Math.pow(2, this.retryCount),
      this.maxBackoffMs
    );
    this.retryCount++;

    console.log(`[ReconnectWS] Reconnecting in ${backoff}ms (attempt ${this.retryCount})`);

    this.retryTimer = setTimeout(() => {
      this.createSocket();
    }, backoff);
  }

  /**
   * Send a resume message after reconnection.
   * Called from the hook after onOpen fires on a reconnection.
   */
  sendResume(): void {
    if (!this.sessionId || !this._connected) return;
    this.sendJSON({
      type: 'resume',
      sessionId: this.sessionId,
      sessionToken: this.sessionToken,
      lastServerSeq: this.lastServerSeq,
    });
  }

  /**
   * Send a JSON control message.
   */
  sendJSON(msg: Record<string, unknown>): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify(msg));
  }

  /**
   * Send binary audio data (PCM16 frames).
   */
  sendBinary(data: ArrayBuffer | Int16Array): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(data);
  }

  /**
   * Intentionally close the connection (no reconnect).
   */
  close(): void {
    this._intentionallyClosed = true;
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this._connected = false;
  }

  get connected(): boolean {
    return this._connected;
  }

  get hasSession(): boolean {
    return this.sessionId !== null;
  }

  setSessionToken(token: string): void {
    this.sessionToken = token;
  }
}
