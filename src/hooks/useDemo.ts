// =============================================================================
// useDemo Hook — Client-side Demo Voice Call Controller
// =============================================================================
// Manages the complete demo session lifecycle from the browser:
// - Session start/stop
// - Microphone capture (MediaRecorder API)
// - Audio playback (AudioContext)
// - Text fallback mode
// - API communication
// - State management
// =============================================================================

'use client';

import { useState, useRef, useCallback } from 'react';

// ── Types ───────────────────────────────────────────────────────────────────

export type DemoStatus =
  | 'idle'
  | 'connecting'
  | 'active'
  | 'processing'
  | 'playing'
  | 'error'
  | 'ended';

export type DemoDomain = 'healthcare' | 'education' | 'banking';

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
  /** True when session is 30s from ending — triggers a UI warning */
  timeWarning: boolean;
}

interface DemoCallbacks {
  onSessionStart?: () => void;
  onSessionEnd?: (summary: string) => void;
  onError?: (error: string) => void;
  onTranscriptUpdate?: (entry: TranscriptEntry) => void;
}

const API_BASE = '/api/v1/demo';

// =============================================================================
// HOOK
// =============================================================================

export function useDemo(callbacks?: DemoCallbacks) {
  // ── State ─────────────────────────────────────────────────────────────────
  const [state, setState] = useState<DemoState>({
    status: 'idle',
    sessionToken: null,
    sessionId: null,
    agentName: 'Agent',
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
  });

  // ── Refs ──────────────────────────────────────────────────────────────────
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionTokenRef = useRef<string | null>(null);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const update = useCallback((partial: Partial<DemoState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const addTranscriptEntry = useCallback(
    (speaker: 'user' | 'agent', text: string) => {
      const entry: TranscriptEntry = {
        id: `${speaker}_${Date.now()}`,
        speaker,
        text,
        timestamp: new Date(),
      };
      setState((prev) => ({
        ...prev,
        transcript: [...prev.transcript, entry],
      }));
      callbacks?.onTranscriptUpdate?.(entry);
      return entry;
    },
    [callbacks]
  );

  // ── Start Timer ───────────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setState((prev) => ({
        ...prev,
        elapsedSeconds: prev.elapsedSeconds + 1,
      }));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // ── Audio Playback ────────────────────────────────────────────────────────
  const playAudio = useCallback(
    async (base64Audio: string, mimeType: string = 'audio/mpeg') => {
      try {
        update({ isPlaying: true });
        const audioData = Uint8Array.from(atob(base64Audio), (c) =>
          c.charCodeAt(0)
        );
        const audioBuffer = audioData.buffer;

        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
        }
        const ctx = audioContextRef.current;

        const decoded = await ctx.decodeAudioData(audioBuffer.slice(0));
        const source = ctx.createBufferSource();
        source.buffer = decoded;
        source.connect(ctx.destination);

        return new Promise<void>((resolve) => {
          source.onended = () => {
            update({ isPlaying: false });
            resolve();
          };
          source.start(0);
        });
      } catch (err) {
        console.error('[useDemo] Audio playback error:', err);
        update({ isPlaying: false });
      }
    },
    [update]
  );

  // ── Start Session ─────────────────────────────────────────────────────────
  const startSession = useCallback(async (domain: DemoDomain) => {
    try {
      update({ status: 'connecting', error: null });

      const res = await fetch(`${API_BASE}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to start demo');
      }

      const data = await res.json();

      sessionTokenRef.current = data.sessionToken;
      update({
        status: 'active',
        sessionToken: data.sessionToken,
        sessionId: data.sessionId,
        agentName: data.agentName || 'Agent',
        domain: data.domain || domain,
        maxDurationSec: data.maxDurationSec || 300,
        transcript: [],
        turnCount: 0,
        elapsedSeconds: 0,
        summary: null,
      });

      // Add greeting to transcript
      addTranscriptEntry('agent', data.greeting);

      // Play greeting audio
      if (data.greetingAudio) {
        await playAudio(data.greetingAudio);
      }

      // Start timer
      startTimer();

      callbacks?.onSessionStart?.();
    } catch (err: any) {
      update({
        status: 'error',
        error: err.message || 'Failed to start demo session',
      });
      callbacks?.onError?.(err.message);
    }
  }, [update, addTranscriptEntry, playAudio, startTimer, callbacks]);

  // ── Stop Listening ────────────────────────────────────────────────────────
  // Defined before endSession so it can be referenced in endSession's dep array.
  const stopListening = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
      update({ isListening: false });
    }
  }, [update]);

  // ── End Session ───────────────────────────────────────────────────────────
  // Defined here (before sendTextMessage / sendAudioMessage) so both
  // can safely include it in their useCallback dependency arrays.
  const endSession = useCallback(async () => {
    if (!sessionTokenRef.current) return;

    try {
      stopTimer();
      stopListening();

      update({ status: 'ended', isListening: false, isProcessing: false });

      const res = await fetch(`${API_BASE}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken: sessionTokenRef.current }),
      });

      if (res.ok) {
        const data = await res.json();
        update({ summary: data.summary });
        callbacks?.onSessionEnd?.(data.summary);
      }
    } catch (err) {
      console.error('[useDemo] End session error:', err);
    }
  }, [update, stopTimer, stopListening, callbacks]);

  // ── Send Text Message ─────────────────────────────────────────────────────
  const sendTextMessage = useCallback(
    async (text: string) => {
      if (!sessionTokenRef.current || !text.trim()) return;

      try {
        update({ isProcessing: true, status: 'processing', error: null });
        addTranscriptEntry('user', text);

        const res = await fetch(`${API_BASE}/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionToken: sessionTokenRef.current,
            text,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Failed to process message');
        }

        const data = await res.json();

        addTranscriptEntry('agent', data.text);
        update({
          isProcessing: false,
          status: 'active',
          turnCount: data.turnCount,
          timeWarning: data.shouldEnd && data.endReason === 'time_warning',
        });

        // Play audio response
        if (data.audio) {
          await playAudio(data.audio, data.audioMimeType);
        }

        // Auto-end if session is truly over (not just a time warning)
        if (data.shouldEnd && data.endReason !== 'time_warning') {
          await endSession();
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to send message';
        update({
          isProcessing: false,
          status: 'active',
          error: message,
        });
        callbacks?.onError?.(message);
      }
    },
    [update, addTranscriptEntry, playAudio, endSession, callbacks]
  );

  // ── Send Audio Message ────────────────────────────────────────────────────
  const sendAudioMessage = useCallback(
    async (audioBlob: Blob) => {
      if (!sessionTokenRef.current) return;

      try {
        update({ isProcessing: true, status: 'processing', isListening: false, error: null });

        // Convert blob to base64
        const arrayBuffer = await audioBlob.arrayBuffer();
        const base64 = btoa(
          String.fromCharCode(...new Uint8Array(arrayBuffer))
        );

        const res = await fetch(`${API_BASE}/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionToken: sessionTokenRef.current,
            audio: base64,
            audioMimeType: audioBlob.type || 'audio/webm;codecs=opus',
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Failed to process audio');
        }

        const data = await res.json();

        // Show actual transcribed user text returned from the server (not an emoji placeholder)
        if (data.userText) {
          addTranscriptEntry('user', data.userText);
        }
        addTranscriptEntry('agent', data.text);
        update({
          isProcessing: false,
          status: 'active',
          turnCount: data.turnCount,
          timeWarning: data.shouldEnd && data.endReason === 'time_warning',
        });

        if (data.audio) {
          await playAudio(data.audio, data.audioMimeType);
        }

        // Auto-end if session is truly over (not just a time warning)
        if (data.shouldEnd && data.endReason !== 'time_warning') {
          await endSession();
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to process audio';
        update({
          isProcessing: false,
          status: 'active',
          error: message,
        });
        callbacks?.onError?.(message);
      }
    },
    [update, addTranscriptEntry, playAudio, endSession, callbacks]
  );

  // ── Microphone Control ────────────────────────────────────────────────────
  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm;codecs=opus',
        });
        // Stop all tracks to release mic
        stream.getTracks().forEach((t) => t.stop());

        if (audioBlob.size > 0) {
          await sendAudioMessage(audioBlob);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      update({ isListening: true });
    } catch (err: any) {
      const message =
        err.name === 'NotAllowedError'
          ? 'Microphone access denied. Please allow microphone access to use voice mode.'
          : 'Failed to access microphone.';
      update({ error: message });
      callbacks?.onError?.(message);
    }
  }, [update, sendAudioMessage, callbacks]);



  // ── Submit Feedback ───────────────────────────────────────────────────────
  const submitFeedback = useCallback(
    async (rating: number, feedback?: string) => {
      if (!sessionTokenRef.current) return;

      try {
        await fetch(`${API_BASE}/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionToken: sessionTokenRef.current,
            rating,
            feedback,
          }),
        });
      } catch {
        // Non-fatal
      }
    },
    []
  );

  // ── Reset ─────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    stopTimer();
    stopListening();
    sessionTokenRef.current = null;
    audioContextRef.current?.close();
    audioContextRef.current = null;

    setState({
      status: 'idle',
      sessionToken: null,
      sessionId: null,
      agentName: 'Agent',
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
    });
  }, [stopTimer, stopListening]);

  // ── Dismiss Error ──────────────────────────────────────────────────────────
  const dismissError = useCallback(() => {
    update({ error: null });
  }, [update]);

  return {
    state,
    startSession,
    endSession,
    sendTextMessage,
    startListening,
    stopListening,
    submitFeedback,
    dismissError,
    reset,
  };
}
