/**
 * PCM16 AudioWorklet Processor
 * 
 * Runs in the AudioWorklet thread. Converts Float32 audio samples from
 * the microphone into Int16 PCM frames and posts them to the main thread.
 * 
 * These frames are sent both to the WebSocket (for Deepgram STT) and
 * to the VAD (for speech detection) simultaneously.
 * 
 * Sample rate: 16kHz (resampled from mic's native rate by AudioContext)
 * Frame size: 128 samples per process() call (~8ms at 16kHz)
 * Output: Int16Array transferred via postMessage
 */
class PCMProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0]?.[0]; // mono channel
    if (!input || input.length === 0) return true;

    // Convert Float32 [-1, 1] to Int16 [-32768, 32767]
    const pcm16 = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      pcm16[i] = s < 0 ? s * 32768 : s * 32767;
    }

    // Transfer the buffer to the main thread (zero-copy)
    this.port.postMessage(pcm16.buffer, [pcm16.buffer]);

    return true; // Keep processor alive
  }
}

registerProcessor('pcm-processor', PCMProcessor);
