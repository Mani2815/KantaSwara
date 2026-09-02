// =============================================================================
// useDemo Hook — Real-Time Streaming Voice Demo Controller
// =============================================================================
// V2: Complete rewrite for WebSocket + VAD + streaming pipeline.
//
// Architecture:
//   Browser → AudioWorklet → PCM16 → WebSocket → Server Orchestrator
//   Server → Deepgram STT/LLM/Flux TTS → PCM audio → WebSocket → Browser
//   Browser → StreamingAudioPlayer → Speaker
//
// Preserves the same external interface as the original hook for
// backward compatibility with the demo page component.
// =============================================================================

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { DemoDomain } from '@server/services/demo/domain-personas.config';

export type { DemoDomain };

// ── Types ───────────────────────────────────────────────────────────────────

export type DemoStatus =
  | 'idle'
  | 'connecting'
  | 'active'
  | 'processing'
  | 'playing'
  | 'error'
  | 'ended';

export interface TranscriptEntry {
  id: string;
  speaker: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

export interface DemoState {
  status: DemoStatus;
  sessionToken: string | null;
  sessionId: string | null;
  agentName: string;
  domain: DemoDomain | null;
  transcript: TranscriptEntry[];
  isListening: boolean;
  isProcessing: boolean;
  isPlaying: boolean;
  turnCount: number;
  elapsedSeconds: number;
  error: string | null;
  summary: string | null;
  maxDurationSec: number;
  timeWarning: boolean;
  voiceSupported: boolean;
  /** Live partial transcript (during speech) */
  partialTranscript: string;
  /** Live accumulated LLM response (streaming) */
  streamingResponse: string;
}

// ── Initial state ───────────────────────────────────────────────────────────

const INITIAL_STATE: DemoState = {
  status: 'idle',
  sessionToken: null,
  sessionId: null,
  agentName: '',
  domain: null,
  transcript: [],
  isListening: false,
  isProcessing: false,
  isPlaying: false,
  turnCount: 0,
  elapsedSeconds: 0,
  error: null,
  summary: null,
  maxDurationSec: 300,
  timeWarning: false,
  voiceSupported: true,
  partialTranscript: '',
  streamingResponse: '',
};

// ── Hook ────────────────────────────────────────────────────────────────────

export function useDemo() {
  const [state, setState] = useState<DemoState>(INITIAL_STATE);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Refs for persistent objects
  const wsRef = useRef<WebSocket | null>(null);
  const audioPlayerRef = useRef<import('@/lib/audio-player').StreamingAudioPlayer | null>(null);
  const audioPipelineRef = useRef<import('@/lib/audio-pipeline').AudioPipeline | null>(null);
  const vadRef = useRef<import('@/lib/vad').VADWrapper | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastServerSeqRef = useRef(-1);

  // ── State updater ──────────────────────────────────────────────────────

  const update = useCallback((patch: Partial<DemoState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const addTranscriptEntry = useCallback(
    (speaker: 'user' | 'agent', text: string) => {
      const entry: TranscriptEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        speaker,
        text,
        timestamp: new Date(),
      };
      setState((prev) => ({
        ...prev,
        transcript: [...prev.transcript, entry],
      }));
    },
    []
  );

  // Update the last agent transcript entry (for streaming response)
  const updateLastAgentEntry = useCallback((text: string) => {
    setState((prev) => {
      const entries = [...prev.transcript];
      const lastIdx = entries.length - 1;
      if (lastIdx >= 0 && entries[lastIdx].speaker === 'agent') {
        entries[lastIdx] = { ...entries[lastIdx], text };
      }
      return { ...prev, transcript: entries };
    });
  }, []);

  // ── Timer ──────────────────────────────────────────────────────────────

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setState((prev) => {
        const next = prev.elapsedSeconds + 1;
        const remaining = prev.maxDurationSec - next;
        return {
          ...prev,
          elapsedSeconds: next,
          timeWarning: remaining <= 30 && remaining > 0,
        };
      });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // ── WebSocket message handler ──────────────────────────────────────────

  const handleServerMessage = useCallback(
    (msg: Record<string, unknown>) => {
      // Track sequence for reconnect
      if (typeof msg.seq === 'number') {
        lastServerSeqRef.current = msg.seq as number;
      }

      switch (msg.type) {
        case 'session_created':
          update({
            status: 'active',
            sessionId: msg.sessionId as string,
            agentName: msg.agentName as string,
            domain: msg.domain as DemoDomain,
            isListening: true,
          });
          addTranscriptEntry('agent', msg.greeting as string);
          startTimer();
          break;

        case 'transcript_partial':
          update({ partialTranscript: msg.text as string });
          break;

        case 'transcript_final':
          update({ partialTranscript: '' });
          // Add user message to transcript (if not already there)
          addTranscriptEntry('user', msg.text as string);
          break;

        case 'thinking':
          update({ status: 'processing', isProcessing: true, streamingResponse: '' });
          // Create a placeholder agent entry for streaming
          addTranscriptEntry('agent', '...');
          break;

        case 'llm_token':
          update({
            streamingResponse: msg.accumulated as string,
            status: 'processing',
          });
          // Update the last agent transcript entry with accumulated text
          updateLastAgentEntry(msg.accumulated as string);
          break;

        case 'turn_complete':
          update({
            status: 'active',
            isProcessing: false,
            isPlaying: false,
            isListening: true,
            streamingResponse: '',
            turnCount: msg.turnCount as number,
          });
          break;

        case 'interrupted':
          // Flush audio immediately on barge-in
          audioPlayerRef.current?.flush();
          update({
            status: 'active',
            isProcessing: false,
            isPlaying: false,
            isListening: true,
            streamingResponse: '',
          });
          break;

        case 'error':
          console.error(`[useDemo] Server error: ${msg.code} - ${msg.message}`);
          update({ error: `${msg.code}: ${msg.message}`, status: 'error' });
          break;

        case 'session_ended':
          stopTimer();
          update({
            status: 'ended',
            isListening: false,
            isProcessing: false,
            isPlaying: false,
            turnCount: (msg.turnCount as number) ?? stateRef.current.turnCount,
          });
          break;

        case 'resumed':
          console.log(`[useDemo] Session resumed from seq ${msg.fromSeq}`);
          update({ status: 'active', isListening: true });
          break;
      }
    },
    [update, addTranscriptEntry, updateLastAgentEntry, startTimer, stopTimer]
  );

  // ── Handle binary audio from server (TTS output) ──────────────────────

  const handleBinaryAudio = useCallback((data: ArrayBuffer) => {
    if (!audioPlayerRef.current) return;

    // Convert ArrayBuffer to Int16Array (PCM16 at 24kHz)
    const pcm16 = new Int16Array(data);
    audioPlayerRef.current.enqueue(pcm16);

    // Update playing state
    if (!stateRef.current.isPlaying) {
      update({ isPlaying: true, status: 'playing' });
    }
  }, [update]);

  // ── Start session ──────────────────────────────────────────────────────

  const startSession = useCallback(
    async (domain: DemoDomain) => {
      update({ status: 'connecting' });

      try {
        // Dynamically import client-side modules to avoid SSR issues
        const [
          { StreamingAudioPlayer },
          { AudioPipeline },
          { VADWrapper },
        ] = await Promise.all([
          import('@/lib/audio-player'),
          import('@/lib/audio-pipeline'),
          import('@/lib/vad'),
        ]);

        // 1. Initialize audio player (24kHz for Flux TTS output)
        const player = new StreamingAudioPlayer();
        await player.init();
        audioPlayerRef.current = player;

        // 2. Build WebSocket URL
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/v1/demo/ws`;

        // 3. Connect WebSocket
        const ws = new WebSocket(wsUrl);
        ws.binaryType = 'arraybuffer';
        wsRef.current = ws;

        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('WebSocket connection timeout')), 10000);

          ws.onopen = () => {
            clearTimeout(timeout);
            resolve();
          };

          ws.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('WebSocket connection failed'));
          };
        });

        // 4. Set up WebSocket message handler
        ws.onmessage = (event: MessageEvent) => {
          if (event.data instanceof ArrayBuffer) {
            handleBinaryAudio(event.data);
          } else {
            try {
              const msg = JSON.parse(event.data as string);
              handleServerMessage(msg);
            } catch (err) {
              console.error('[useDemo] Failed to parse message:', err);
            }
          }
        };

        ws.onclose = () => {
          console.log('[useDemo] WebSocket closed');
          // TODO: Implement reconnection with lastServerSeqRef.current
        };

        ws.onerror = (e) => {
          console.error('[useDemo] WebSocket error:', e);
          update({ error: 'Connection error', status: 'error' });
        };

        // 5. Initialize VAD
        let vadStarted = false;
        try {
          const vad = new VADWrapper({
            onSpeechStart: () => {
              // Send speech_start to server (triggers interrupt if agent is speaking)
              if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: 'vad_speech_start' }));
              }
              // Flush local audio playback immediately for barge-in
              audioPlayerRef.current?.flush();
              update({ isListening: true, isPlaying: false });
            },
            onSpeechEnd: () => {
              // Send speech_end to server
              if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: 'vad_speech_end' }));
              }
            },
            onFrameProcessed: () => {
              // Could use for waveform — currently handled by AudioPipeline
            },
          });
          await vad.start();
          vadRef.current = vad;
          vadStarted = true;
        } catch (vadErr) {
          console.warn('[useDemo] VAD init failed, falling back to text-only:', vadErr);
          update({ voiceSupported: false });
        }

        // 6. Initialize audio pipeline (only if VAD succeeded)
        if (vadStarted) {
          try {
            const pipeline = new AudioPipeline({
              onPCMFrame: (pcm16: Int16Array) => {
                // Send raw PCM16 audio frames to server for STT
                if (wsRef.current?.readyState === WebSocket.OPEN) {
                  wsRef.current.send(pcm16.buffer);
                }
              },
              onAudioLevel: () => {
                // Audio level for waveform — handled by VAD/analyser
              },
              onError: (err) => {
                console.error('[useDemo] Audio pipeline error:', err);
              },
            });
            await pipeline.start();
            audioPipelineRef.current = pipeline;
          } catch (pipelineErr) {
            console.warn('[useDemo] Audio pipeline failed:', pipelineErr);
            update({ voiceSupported: false });
          }
        }

        // 7. Send start message
        ws.send(JSON.stringify({ type: 'start', domain }));

      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to start session';
        console.error('[useDemo] Start error:', msg);
        update({ error: msg, status: 'error' });
      }
    },
    [update, handleServerMessage, handleBinaryAudio]
  );

  // ── End session ────────────────────────────────────────────────────────

  const endSession = useCallback(() => {
    // Send end message to server
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'end' }));
    }

    // Cleanup
    stopTimer();
    audioPipelineRef.current?.stop();
    audioPipelineRef.current = null;
    vadRef.current?.destroy();
    vadRef.current = null;
    audioPlayerRef.current?.destroy();
    audioPlayerRef.current = null;
    wsRef.current?.close();
    wsRef.current = null;

    update({
      status: 'ended',
      isListening: false,
      isProcessing: false,
      isPlaying: false,
    });
  }, [update, stopTimer]);

  // ── Send text message (keyboard input) ─────────────────────────────────

  const sendTextMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !wsRef.current) return;

      addTranscriptEntry('user', text.trim());
      update({ isProcessing: true, status: 'processing' });

      wsRef.current.send(
        JSON.stringify({ type: 'text', text: text.trim() })
      );
    },
    [update, addTranscriptEntry]
  );

  // ── Voice controls (backward compat — now continuous via VAD) ──────────

  const startListening = useCallback(() => {
    vadRef.current?.resume();
    update({ isListening: true });
  }, [update]);

  const stopListening = useCallback(() => {
    vadRef.current?.pause();
    update({ isListening: false });
  }, [update]);

  const stopAudioPlayback = useCallback(() => {
    audioPlayerRef.current?.flush();
    update({ isPlaying: false });

    // Tell server to interrupt
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'interrupt' }));
    }
  }, [update]);

  // ── Feedback ───────────────────────────────────────────────────────────

  const submitFeedback = useCallback(
    async (rating: number, comment?: string) => {
      if (!stateRef.current.sessionId) return;

      try {
        await fetch('/api/v1/demo/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: stateRef.current.sessionId,
            rating,
            comment,
          }),
        });
      } catch (err) {
        console.error('[useDemo] Feedback submit error:', err);
      }
    },
    []
  );

  // ── Error handling ─────────────────────────────────────────────────────

  const dismissError = useCallback(() => {
    update({ error: null, status: stateRef.current.sessionId ? 'active' : 'idle' });
  }, [update]);

  // ── Reset ──────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    endSession();
    setState(INITIAL_STATE);
    lastServerSeqRef.current = -1;
  }, [endSession]);

  // ── Analyser (for waveform visualization — backward compat) ────────────

  const getAnalyser = useCallback(() => {
    // The old hook returned a Web Audio AnalyserNode.
    // In the new pipeline, VAD handles its own microphone.
    // Return null — the demo page shows VoicePoweredOrb instead.
    return null;
  }, []);

  // ── Cleanup on unmount ─────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      stopTimer();
      audioPipelineRef.current?.stop();
      vadRef.current?.destroy();
      audioPlayerRef.current?.destroy();
      wsRef.current?.close();
    };
  }, [stopTimer]);

  return {
    state,
    startSession,
    endSession,
    sendTextMessage,
    startListening,
    stopListening,
    stopAudioPlayback,
    submitFeedback,
    dismissError,
    reset,
    getAnalyser,
  };
}
