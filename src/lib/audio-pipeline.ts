// =============================================================================
// Browser Audio Pipeline
// =============================================================================
// Captures microphone audio via AudioWorklet, produces raw PCM16 frames.
// Frames are sent to both the WebSocket (for Deepgram STT) and VAD.
//
// Mic → getUserMedia → AudioContext (16kHz) → AudioWorklet → PCM16 frames
//                                           → AnalyserNode → Waveform (UI)
//
// Uses browser's built-in echo cancellation, noise suppression, and AGC
// to prevent agent's audio from triggering VAD (for barge-in support).
// =============================================================================

export interface AudioPipelineCallbacks {
  /** Called with each PCM16 frame (~128 samples, ~8ms at 16kHz) */
  onPCMFrame: (pcm16: Int16Array) => void;
  /** Called with audio level for waveform visualization */
  onAudioLevel: (level: number) => void;
  /** Called on error */
  onError: (error: Error) => void;
}

export class AudioPipeline {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private animationFrame: number | null = null;
  private _active = false;

  constructor(private callbacks: AudioPipelineCallbacks) {}

  /**
   * Initialize the audio pipeline.
   * Requests microphone access and sets up AudioWorklet.
   */
  async start(): Promise<void> {
    try {
      // Request microphone with echo cancellation for barge-in support
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000, // Hint — browser may not honor this exactly
          channelCount: 1,
        },
      });

      // Create AudioContext at 16kHz for STT-optimal sample rate
      this.audioContext = new AudioContext({ sampleRate: 16000 });

      // Load the PCM processor worklet
      await this.audioContext.audioWorklet.addModule('/audio/pcm-processor.js');

      // Create source from microphone
      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);

      // Create worklet node
      this.workletNode = new AudioWorkletNode(this.audioContext, 'pcm-processor');
      this.workletNode.port.onmessage = (event: MessageEvent) => {
        const pcm16 = new Int16Array(event.data);
        this.callbacks.onPCMFrame(pcm16);
      };

      // Create analyser for waveform visualization
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 256;

      // Connect: source → worklet (for PCM frames)
      //          source → analyser (for visualization)
      this.sourceNode.connect(this.workletNode);
      this.sourceNode.connect(this.analyserNode);

      // Start waveform animation loop
      this.startVisualization();

      this._active = true;
      console.log('[AudioPipeline] Started');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start audio pipeline');
      this.callbacks.onError(error);
      throw error;
    }
  }

  /**
   * Stop the audio pipeline and release resources.
   */
  stop(): void {
    this._active = false;

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    this.workletNode?.disconnect();
    this.sourceNode?.disconnect();
    this.analyserNode?.disconnect();

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
    }

    this.workletNode = null;
    this.sourceNode = null;
    this.analyserNode = null;
    this.audioContext = null;

    console.log('[AudioPipeline] Stopped');
  }

  get active(): boolean {
    return this._active;
  }

  /**
   * Continuously sample the analyser for waveform visualization.
   */
  private startVisualization(): void {
    if (!this.analyserNode) return;

    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);

    const tick = () => {
      if (!this._active || !this.analyserNode) return;

      this.analyserNode.getByteTimeDomainData(dataArray);

      // Calculate RMS audio level (0-1)
      let sumSquares = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const normalized = (dataArray[i] - 128) / 128;
        sumSquares += normalized * normalized;
      }
      const rms = Math.sqrt(sumSquares / dataArray.length);
      this.callbacks.onAudioLevel(rms);

      this.animationFrame = requestAnimationFrame(tick);
    };

    this.animationFrame = requestAnimationFrame(tick);
  }
}
