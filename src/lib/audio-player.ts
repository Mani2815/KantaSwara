// =============================================================================
// Streaming Audio Player (Jitter Buffer)
// =============================================================================
// Plays continuous PCM16 audio chunks from Flux TTS via WebSocket.
// Uses Web Audio API with scheduled playback for gapless audio.
//
// Key features:
// - 80ms jitter buffer for smooth playback over variable network
// - Explicit AudioBufferSourceNode tracking for barge-in (source.stop())
// - 24kHz sample rate matching Flux TTS output
// - AudioContext unlock handling for iOS/Safari
// =============================================================================

export class StreamingAudioPlayer {
  private ctx: AudioContext | null = null;
  private scheduledTime = 0;
  private bufferDuration = 0.08; // 80ms jitter buffer
  private activeSources = new Set<AudioBufferSourceNode>();
  private _playing = false;

  // TTS output at 24kHz for better speech quality.
  // STT input remains 16kHz (separate AudioContext in AudioPipeline).
  static readonly TTS_SAMPLE_RATE = 24000;

  /**
   * Initialize the AudioContext. Must be called after a user gesture
   * to satisfy browser autoplay policies.
   */
  async init(): Promise<void> {
    if (this.ctx) return;

    this.ctx = new AudioContext({
      sampleRate: StreamingAudioPlayer.TTS_SAMPLE_RATE,
    });

    // Unlock AudioContext (required on iOS/Safari)
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    this.scheduledTime = this.ctx.currentTime;
    console.log(`[AudioPlayer] Initialized (${StreamingAudioPlayer.TTS_SAMPLE_RATE}Hz)`);
  }

  /**
   * Enqueue a PCM16 chunk for seamless gapless playback.
   * Chunks are scheduled back-to-back with the jitter buffer offset.
   */
  enqueue(pcm16: Int16Array): void {
    if (!this.ctx) return;

    // Convert Int16 to Float32
    const float32 = new Float32Array(pcm16.length);
    for (let i = 0; i < pcm16.length; i++) {
      float32[i] = pcm16[i] / 32768;
    }

    const buffer = this.ctx.createBuffer(
      1,
      float32.length,
      StreamingAudioPlayer.TTS_SAMPLE_RATE
    );
    buffer.getChannelData(0).set(float32);

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.ctx.destination);

    // Track for explicit cleanup on interrupt
    this.activeSources.add(source);
    source.onended = () => {
      this.activeSources.delete(source);
      if (this.activeSources.size === 0) {
        this._playing = false;
      }
    };

    // Schedule for seamless gapless playback
    const now = this.ctx.currentTime;
    const startTime = Math.max(now + this.bufferDuration, this.scheduledTime);
    source.start(startTime);
    this.scheduledTime = startTime + buffer.duration;
    this._playing = true;
  }

  /**
   * Flush all scheduled and playing audio.
   * Critical for barge-in — stops all audio immediately.
   */
  flush(): void {
    for (const source of this.activeSources) {
      try {
        source.stop();
      } catch {
        // Source may have already ended
      }
    }
    this.activeSources.clear();
    this._playing = false;

    if (this.ctx) {
      this.scheduledTime = this.ctx.currentTime;
    }
  }

  /**
   * Whether audio is currently playing or scheduled.
   */
  get playing(): boolean {
    return this._playing;
  }

  /**
   * Clean up the AudioContext.
   */
  destroy(): void {
    this.flush();
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close().catch(() => {});
    }
    this.ctx = null;
  }
}
