// =============================================================================
// VAD (Voice Activity Detection) Wrapper
// =============================================================================
// Client-side VAD using @ricky0123/vad-web (Silero ONNX model).
// Detects speech start/end for turn management.
//
// KEY: VAD ≠ end-of-turn. VAD only tells us "is the user speaking?"
// End-of-turn combines VAD silence + STT is_final + linguistic check + 700ms escape hatch.
//
// Configuration:
// - redemptionMs: 500ms (tolerant of pauses; STT+linguistic check add safety)
// - Runs continuously — does NOT pause while agent speaks
// - Browser AEC handles echo cancellation for barge-in
// =============================================================================

import { MicVAD } from '@ricky0123/vad-web';

export interface VADCallbacks {
  /** User started speaking (triggers interrupt if agent is talking) */
  onSpeechStart: () => void;
  /** User stopped speaking (signals orchestrator to check end-of-turn) */
  onSpeechEnd: (audio: Float32Array) => void;
  /** Per-frame speech probability for waveform visualization */
  onFrameProcessed: (probability: number) => void;
}

export class VADWrapper {
  private vad: MicVAD | null = null;
  private _active = false;

  constructor(private callbacks: VADCallbacks) {}

  /**
   * Initialize and start the VAD.
   * Must be called after a user gesture (getUserMedia).
   */
  async start(): Promise<void> {
    try {

      this.vad = await MicVAD.new({
        // ── Speech detection thresholds ────────────────────────────
        positiveSpeechThreshold: 0.6,
        negativeSpeechThreshold: 0.35,

        // ── Adaptive endpointing ──────────────────────────────────
        // 500ms silence before declaring speech end.
        // Generous enough to tolerate brief pauses, gasps, and
        // mid-sentence thinking — STT is_final + linguistic check
        // + 700ms escape hatch handle the actual end-of-turn decision.
        redemptionMs: 500,

        // Catch the beginning of words that start before model fires
        preSpeechPadMs: 250,

        // Minimum speech to prevent coughs/clicks from triggering
        minSpeechMs: 250,

        // We handle end-of-turn ourselves (not auto-submit)
        submitUserSpeechOnPause: false,

        // Use v5 model for better accuracy
        model: 'v5',

        // ── Asset paths ───────────────────────────────────────────
        // Serve VAD model + worklet from public/vad/
        baseAssetPath: '/vad/',
        // Serve ONNX Runtime WASM binaries from public/wasm/
        // (copied there by scripts/copy-ort-wasm.mjs prebuild step).
        // Without this, ORT defaults to './' which makes the bundler
        // try to resolve WASM as JS chunks → 404 in production.
        onnxWASMBasePath: '/wasm/',

        // ── Callbacks ─────────────────────────────────────────────
        onSpeechStart: () => {
          this.callbacks.onSpeechStart();
        },

        onSpeechEnd: (audio: Float32Array) => {
          this.callbacks.onSpeechEnd(audio);
        },

        onFrameProcessed: (probabilities: { isSpeech: number }) => {
          this.callbacks.onFrameProcessed(probabilities.isSpeech);
        },
      });

      this.vad.start();
      this._active = true;
      console.log('[VAD] Started');
    } catch (err) {
      console.error('[VAD] Failed to initialize:', err);
      throw err;
    }
  }

  /**
   * Pause VAD processing (keeps mic open).
   */
  pause(): void {
    this.vad?.pause();
    this._active = false;
  }

  /**
   * Resume VAD processing.
   */
  resume(): void {
    this.vad?.start();
    this._active = true;
  }

  /**
   * Stop and destroy the VAD instance.
   */
  destroy(): void {
    this.vad?.destroy();
    this.vad = null;
    this._active = false;
    console.log('[VAD] Destroyed');
  }

  get active(): boolean {
    return this._active;
  }
}
