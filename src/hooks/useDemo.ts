// =============================================================================
// useDemo Hook — Client-side Demo Voice Call Controller
// =============================================================================
// Phase 2 & 3: Full rewrite with cross-browser support, audio queue,
// recording limits, session cleanup, and reliability improvements.
//
// Declaration order:
//   update → addTranscriptEntry → startTimer/stopTimer → ensureAudioContext
//   → enqueueAudio → stopListening → endSession → sendTextMessage
//   → sendAudioMessage → startListening → submitFeedback → reset → dismissError
// =============================================================================

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

// ── Types ───────────────────────────────────────────────────────────────────

export type DemoStatus =
  | 'idle'
  | 'connecting'
  | 'active'
  | 'processing'
  | 'playing'
  | 'error'
  | 'ended';

import type { DemoDomain } from '@server/services/demo/domain-personas.config';
export type { DemoDomain };

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
  /** Whether voice recording is available in this browser */
  voiceSupported: boolean;
}

interface DemoCallbacks {
  onSessionStart?: () => void;
  onSessionEnd?: (summary: string) => void;
  onError?: (error: string) => void;
  onTranscriptUpdate?: (entry: TranscriptEntry) => void;
}

const API_BASE = '/api/v1/demo';

// ── Constants ───────────────────────────────────────────────────────────────

/** Maximum recording duration in ms (60 seconds) */
const MAX_RECORDING_DURATION_MS = 60_000;
/** Maximum audio blob size in bytes (5 MB) */
const MAX_AUDIO_BLOB_SIZE = 5 * 1024 * 1024;
/** Minimum time between messages in ms (3 seconds) */
const MESSAGE_THROTTLE_MS = 3_000;

// ── Browser Capability Detection ────────────────────────────────────────────

/**
 * Detect the best supported audio MIME type for MediaRecorder.
 * Falls back to null if no recording is supported (text-only mode).
 */
function detectSupportedMimeType(): string | null {
  if (typeof window === 'undefined' || !window.MediaRecorder) return null;

  // Priority order: opus in webm, opus in ogg, mp4 audio, webm default
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
    'audio/mp4;codecs=aac',
  ];

  for (const mimeType of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        return mimeType;
      }
    } catch {
      // isTypeSupported might throw in some browsers
    }
  }

  // Some browsers (especially iOS Safari) support MediaRecorder
  // without any specific MIME type — try with empty options
  try {
    if (typeof MediaRecorder !== 'undefined') {
      return ''; // Use browser default
    }
  } catch {
    // MediaRecorder not available
  }

  return null;
}

// =============================================================================
// HOOK
// =============================================================================

export function useDemo(callbacks?: DemoCallbacks) {
  // ── Browser capability detection (runs once) ───────────────────────────
  const supportedMimeRef = useRef<string | null>(null);
  const [voiceSupported, setVoiceSupported] = useState(true);

  useEffect(() => {
    const mime = detectSupportedMimeType();
    supportedMimeRef.current = mime;
    setVoiceSupported(mime !== null);
  }, []);

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
    voiceSupported: true,
  });

  // Keep voiceSupported in sync
  useEffect(() => {
    setState((prev) => ({ ...prev, voiceSupported }));
  }, [voiceSupported]);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioContextUnlockedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionTokenRef = useRef<string | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMessageTimeRef = useRef<number>(0);
  const activeStreamRef = useRef<MediaStream | null>(null);

  // ── Audio Queue Refs ──────────────────────────────────────────────────────
  const audioQueueRef = useRef<Array<{ base64: string; mimeType: string }>>([]);
  const isPlayingQueueRef = useRef(false);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const update = useCallback((partial: Partial<DemoState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const addTranscriptEntry = useCallback(
    (speaker: 'user' | 'agent', text: string) => {
      const entry: TranscriptEntry = {
        id: `${speaker}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
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

  // ── AudioContext Management ───────────────────────────────────────────────

  /**
   * Ensures AudioContext is created and unlocked (especially for iOS Safari).
   * Must be called from a user gesture handler.
   */
  const ensureAudioContext = useCallback((): AudioContext => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
    }

    const ctx = audioContextRef.current;

    // iOS Safari suspends AudioContext until a user gesture resumes it
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {
        // Non-fatal — will retry on next interaction
      });
    }

    audioContextUnlockedRef.current = true;
    return ctx;
  }, []);

  // ── Audio Queue ───────────────────────────────────────────────────────────

  /**
   * Process the audio queue: plays items sequentially, one at a time.
   */
  const processAudioQueue = useCallback(async () => {
    if (isPlayingQueueRef.current) return;
    isPlayingQueueRef.current = true;

    while (audioQueueRef.current.length > 0) {
      const item = audioQueueRef.current.shift()!;
      update({ isPlaying: true });

      try {
        const ctx = ensureAudioContext();
        const audioData = Uint8Array.from(atob(item.base64), (c) =>
          c.charCodeAt(0)
        );

        const decoded = await ctx.decodeAudioData(audioData.buffer.slice(0));
        const source = ctx.createBufferSource();
        source.buffer = decoded;
        source.connect(ctx.destination);
        currentSourceRef.current = source;

        await new Promise<void>((resolve) => {
          source.onended = () => {
            currentSourceRef.current = null;
            resolve();
          };
          source.start(0);
        });
      } catch (err) {
        console.error('[useDemo] Audio playback error:', err);
        currentSourceRef.current = null;
      }
    }

    isPlayingQueueRef.current = false;
    update({ isPlaying: false });
  }, [update, ensureAudioContext]);

  /**
   * Enqueue audio for sequential playback.
   */
  const enqueueAudio = useCallback(
    (base64Audio: string, mimeType: string = 'audio/mpeg') => {
      audioQueueRef.current.push({ base64: base64Audio, mimeType });
      processAudioQueue();
    },
    [processAudioQueue]
  );

  /**
   * Stop currently playing audio and clear the queue.
   */
  const stopAudioPlayback = useCallback(() => {
    audioQueueRef.current = [];
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch {
        // Already stopped
      }
      currentSourceRef.current = null;
    }
    isPlayingQueueRef.current = false;
    update({ isPlaying: false });
  }, [update]);

  // ── Message Throttle ──────────────────────────────────────────────────────

  const checkThrottle = useCallback((): boolean => {
    const now = Date.now();
    const elapsed = now - lastMessageTimeRef.current;
    if (elapsed < MESSAGE_THROTTLE_MS) {
      const waitSec = Math.ceil((MESSAGE_THROTTLE_MS - elapsed) / 1000);
      update({
        error: `Please wait ${waitSec} second${waitSec > 1 ? 's' : ''} before sending another message.`,
      });
      return false;
    }
    lastMessageTimeRef.current = now;
    return true;
  }, [update]);

  // ── Start Session ─────────────────────────────────────────────────────────
  const startSession = useCallback(
    async (domain: DemoDomain) => {
      try {
        update({ status: 'connecting', error: null });

        // Unlock AudioContext from user gesture (critical for iOS)
        ensureAudioContext();

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
        lastMessageTimeRef.current = 0; // Reset throttle
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
          timeWarning: false,
        });

        // Add greeting to transcript
        addTranscriptEntry('agent', data.greeting);

        // Play greeting audio via queue
        if (data.greetingAudio) {
          enqueueAudio(data.greetingAudio);
        }

        // Start timer
        startTimer();

        callbacks?.onSessionStart?.();
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to start demo session';
        update({
          status: 'error',
          error: message,
        });
        callbacks?.onError?.(message);
      }
    },
    [update, addTranscriptEntry, enqueueAudio, startTimer, ensureAudioContext, callbacks]
  );

  // ── Stop Listening ────────────────────────────────────────────────────────
  const stopListening = useCallback(() => {
    // Clear recording duration timer
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
    }

    // Release active mic stream
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((t) => t.stop());
      activeStreamRef.current = null;
    }

    update({ isListening: false });
  }, [update]);

  // ── End Session ───────────────────────────────────────────────────────────
  const endSession = useCallback(async () => {
    if (!sessionTokenRef.current) return;

    try {
      stopTimer();
      stopListening();
      stopAudioPlayback();

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
  }, [update, stopTimer, stopListening, stopAudioPlayback, callbacks]);

  // ── Send Text Message ─────────────────────────────────────────────────────
  const sendTextMessage = useCallback(
    async (text: string) => {
      if (!sessionTokenRef.current || !text.trim()) return;
      if (!checkThrottle()) return;

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

        // Enqueue audio response (plays sequentially)
        if (data.audio) {
          enqueueAudio(data.audio, data.audioMimeType);
        }

        // Auto-end if session is truly over (not just a time warning)
        if (data.shouldEnd && data.endReason !== 'time_warning') {
          await endSession();
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to send message';
        update({
          isProcessing: false,
          status: 'active',
          error: message,
        });
        callbacks?.onError?.(message);
      }
    },
    [update, addTranscriptEntry, enqueueAudio, endSession, checkThrottle, callbacks]
  );

  // ── Send Audio Message ────────────────────────────────────────────────────
  const sendAudioMessage = useCallback(
    async (audioBlob: Blob) => {
      if (!sessionTokenRef.current) return;
      if (!checkThrottle()) return;

      // ── Recording size limit ──────────────────────────────────────────
      if (audioBlob.size > MAX_AUDIO_BLOB_SIZE) {
        update({
          error: `Recording too large (${(audioBlob.size / 1024 / 1024).toFixed(1)}MB). Max ${MAX_AUDIO_BLOB_SIZE / 1024 / 1024}MB. Try a shorter message.`,
        });
        return;
      }

      try {
        update({
          isProcessing: true,
          status: 'processing',
          isListening: false,
          error: null,
        });

        // Convert blob to base64
        const arrayBuffer = await audioBlob.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);

        // btoa with Uint8Array — handle large buffers in chunks
        let binary = '';
        const chunkSize = 8192;
        for (let i = 0; i < uint8.length; i += chunkSize) {
          const chunk = uint8.subarray(i, i + chunkSize);
          binary += String.fromCharCode(...chunk);
        }
        const base64 = btoa(binary);

        const res = await fetch(`${API_BASE}/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionToken: sessionTokenRef.current,
            audio: base64,
            audioMimeType: audioBlob.type || supportedMimeRef.current || 'audio/webm',
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Failed to process audio');
        }

        const data = await res.json();

        // Show actual transcribed user text from the server
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

        // Enqueue audio for sequential playback
        if (data.audio) {
          enqueueAudio(data.audio, data.audioMimeType);
        }

        // Auto-end if session is truly over (not just a time warning)
        if (data.shouldEnd && data.endReason !== 'time_warning') {
          await endSession();
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to process audio';
        update({
          isProcessing: false,
          status: 'active',
          error: message,
        });
        callbacks?.onError?.(message);
      }
    },
    [update, addTranscriptEntry, enqueueAudio, endSession, checkThrottle, callbacks]
  );

  // ── Microphone Control ────────────────────────────────────────────────────
  const startListening = useCallback(async () => {
    const mimeType = supportedMimeRef.current;
    if (mimeType === null) {
      update({
        error:
          'Voice recording is not supported in your browser. Please use text input instead.',
      });
      return;
    }

    try {
      // Unlock AudioContext on user gesture
      ensureAudioContext();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      activeStreamRef.current = stream;

      // Build MediaRecorder options
      const recorderOptions: MediaRecorderOptions = {};
      if (mimeType) {
        recorderOptions.mimeType = mimeType;
      }

      const mediaRecorder = new MediaRecorder(stream, recorderOptions);
      const actualMime = mediaRecorder.mimeType || mimeType || 'audio/webm';

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Clear recording timer
        if (recordingTimerRef.current) {
          clearTimeout(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }

        // Release mic tracks
        stream.getTracks().forEach((t) => t.stop());
        activeStreamRef.current = null;

        const audioBlob = new Blob(audioChunksRef.current, {
          type: actualMime,
        });

        if (audioBlob.size > 0) {
          await sendAudioMessage(audioBlob);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      update({ isListening: true, error: null });

      // ── Auto-stop recording after max duration ──────────────────────
      recordingTimerRef.current = setTimeout(() => {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state !== 'inactive'
        ) {
          update({
            error: `Recording stopped — maximum ${MAX_RECORDING_DURATION_MS / 1000}s reached. Your audio has been sent.`,
          });
          mediaRecorderRef.current.stop();
        }
      }, MAX_RECORDING_DURATION_MS);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      let message: string;

      if (error.name === 'NotAllowedError') {
        message =
          'Microphone access denied. Please allow microphone access in your browser settings to use voice mode.';
      } else if (error.name === 'NotFoundError') {
        message =
          'No microphone found. Please connect a microphone or switch to text mode.';
      } else if (error.name === 'NotReadableError') {
        message =
          'Your microphone is in use by another application. Close it and try again.';
      } else {
        message = 'Failed to access microphone. Please try text input instead.';
      }

      update({ error: message, isListening: false });
      callbacks?.onError?.(message);
    }
  }, [update, sendAudioMessage, ensureAudioContext, callbacks]);

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
    // Clean up all resources
    stopTimer();
    stopListening();
    stopAudioPlayback();

    // Clear recording timer
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    // Close AudioContext
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
      audioContextUnlockedRef.current = false;
    }

    sessionTokenRef.current = null;
    lastMessageTimeRef.current = 0;

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
      voiceSupported: voiceSupported,
    });
  }, [stopTimer, stopListening, stopAudioPlayback, voiceSupported]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      // Stop all timers
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);

      // Stop media
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== 'inactive'
      ) {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          /* already stopped */
        }
      }

      // Release mic
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      // Stop audio playback
      if (currentSourceRef.current) {
        try {
          currentSourceRef.current.stop();
        } catch {
          /* already stopped */
        }
      }

      // Close AudioContext
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

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
