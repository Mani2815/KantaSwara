// =============================================================================
// useDemo — routes text sessions to Vercel REST and voice sessions to Railway WS
// =============================================================================
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { DemoDomain } from '@server/services/demo/domain-personas.config';
import { RealtimeVoiceClient, getRealtimeVoiceUrl } from '@/lib/realtime-voice-client';

export type { DemoDomain };
export type DemoMode = 'text' | 'voice';
export type DemoStatus = 'idle' | 'connecting' | 'active' | 'processing' | 'playing' | 'error' | 'ended';

export interface TranscriptEntry {
  id: string;
  speaker: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

export interface DemoState {
  status: DemoStatus;
  mode: DemoMode;
  sessionToken: string | null;
  sessionId: string | null;
  agentName: string;
  domain: DemoDomain | null;
  transcript: TranscriptEntry[];
  isListening: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  isPlaying: boolean;
  turnCount: number;
  elapsedSeconds: number;
  error: string | null;
  summary: string | null;
  maxDurationSec: number;
  timeWarning: boolean;
  /** True only when Railway has been configured and the browser supports voice. */
  voiceSupported: boolean;
  partialTranscript: string;
  streamingResponse: string;
}

const RAILWAY_UNAVAILABLE = 'Real-Time Voice is temporarily unavailable.';
const INITIAL_STATE: DemoState = {
  status: 'idle', mode: 'text', sessionToken: null, sessionId: null, agentName: '', domain: null,
  transcript: [], isListening: false, isRecording: false, isProcessing: false, isPlaying: false, turnCount: 0,
  elapsedSeconds: 0, error: null, summary: null, maxDurationSec: 300, timeWarning: false,
  voiceSupported: Boolean(getRealtimeVoiceUrl()), partialTranscript: '', streamingResponse: '',
};

function entry(speaker: TranscriptEntry['speaker'], text: string): TranscriptEntry {
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, speaker, text, timestamp: new Date() };
}

export function useDemo() {
  const [state, setState] = useState<DemoState>(INITIAL_STATE);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  const wsRef = useRef<RealtimeVoiceClient | null>(null);
  const audioPlayerRef = useRef<import('@/lib/audio-player').StreamingAudioPlayer | null>(null);
  const audioPipelineRef = useRef<import('@/lib/audio-pipeline').AudioPipeline | null>(null);
  const vadRef = useRef<import('@/lib/vad').VADWrapper | null>(null);
  // REST text-mode TTS is a complete MP3/WAV response, unlike the PCM stream
  // used by the Railway voice session.
  const restAudioRef = useRef<HTMLAudioElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const update = useCallback((patch: Partial<DemoState>) => setState((previous) => ({ ...previous, ...patch })), []);
  const addTranscriptEntry = useCallback((speaker: TranscriptEntry['speaker'], text: string) => {
    setState((previous) => ({ ...previous, transcript: [...previous.transcript, entry(speaker, text)] }));
  }, []);
  const updateLastAgentEntry = useCallback((text: string) => {
    setState((previous) => {
      const transcript = [...previous.transcript];
      const index = transcript.length - 1;
      if (index >= 0 && transcript[index].speaker === 'agent') transcript[index] = { ...transcript[index], text };
      return { ...previous, transcript };
    });
  }, []);
  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => setState((previous) => {
      const elapsedSeconds = previous.elapsedSeconds + 1;
      const remaining = previous.maxDurationSec - elapsedSeconds;
      return { ...previous, elapsedSeconds, timeWarning: remaining <= 30 && remaining > 0 };
    }), 1000);
  }, []);
  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);
  const cleanupVoice = useCallback(() => {
    audioPipelineRef.current?.stop(); audioPipelineRef.current = null;
    vadRef.current?.destroy(); vadRef.current = null;
    audioPlayerRef.current?.destroy(); audioPlayerRef.current = null;
    wsRef.current?.close(); wsRef.current = null;
    restAudioRef.current?.pause();
    restAudioRef.current = null;
    recorderRef.current?.stop();
    recorderRef.current = null;
  }, []);

  const playRestAudio = useCallback((audio?: string, mimeType?: string) => {
    if (!audio) return;
    restAudioRef.current?.pause();
    const player = new Audio(`data:${mimeType || 'audio/mpeg'};base64,${audio}`);
    player.onended = () => update({ isPlaying: false, status: 'active' });
    player.onerror = () => update({ isPlaying: false });
    restAudioRef.current = player;
    update({ isPlaying: true, status: 'playing' });
    player.play().catch(() => {
      // The transcript is still available if a browser blocks autoplay.
      update({ isPlaying: false, status: 'active' });
    });
  }, [update]);

  const handleServerMessage = useCallback((message: Record<string, unknown>) => {
    switch (message.type) {
      case 'session_created':
        update({ status: 'active', sessionId: message.sessionId as string, agentName: message.agentName as string,
          domain: message.domain as DemoDomain, isListening: true });
        addTranscriptEntry('agent', message.greeting as string); startTimer(); break;
      case 'transcript_partial': update({ partialTranscript: message.text as string }); break;
      case 'transcript_final': update({ partialTranscript: '' }); addTranscriptEntry('user', message.text as string); break;
      case 'thinking': update({ status: 'processing', isProcessing: true, streamingResponse: '' }); addTranscriptEntry('agent', '...'); break;
      case 'llm_token': update({ streamingResponse: message.accumulated as string, status: 'processing' }); updateLastAgentEntry(message.accumulated as string); break;
      case 'turn_complete': update({ status: 'active', isProcessing: false, isPlaying: false, isListening: true,
          streamingResponse: '', turnCount: message.turnCount as number }); break;
      case 'interrupted': audioPlayerRef.current?.flush(); update({ status: 'active', isProcessing: false, isPlaying: false, isListening: true, streamingResponse: '' }); break;
      case 'error': update({ error: `${message.code}: ${message.message}`, status: 'error' }); break;
      case 'session_ended': stopTimer(); update({ status: 'ended', isListening: false, isProcessing: false, isPlaying: false,
          turnCount: (message.turnCount as number) ?? stateRef.current.turnCount }); break;
    }
  }, [addTranscriptEntry, startTimer, stopTimer, update, updateLastAgentEntry]);

  const startTextSession = useCallback(async (domain: DemoDomain) => {
    const response = await fetch('/api/v1/demo/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ domain }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to start text demo');
    update({ status: 'active', mode: 'text', sessionToken: result.sessionToken, sessionId: result.sessionId,
      agentName: result.agentName, domain: result.domain, maxDurationSec: result.maxDurationSec, isListening: false });
    addTranscriptEntry('agent', result.greeting); playRestAudio(result.greetingAudio, 'audio/mpeg'); startTimer();
  }, [addTranscriptEntry, playRestAudio, startTimer, update]);

  const startVoiceSession = useCallback(async (domain: DemoDomain) => {
    if (!getRealtimeVoiceUrl()) { update({ status: 'error', voiceSupported: false, error: RAILWAY_UNAVAILABLE }); return; }
    const [{ StreamingAudioPlayer }, { AudioPipeline }, { VADWrapper }] = await Promise.all([
      import('@/lib/audio-player'), import('@/lib/audio-pipeline'), import('@/lib/vad'),
    ]);
    const player = new StreamingAudioPlayer(); await player.init(); audioPlayerRef.current = player;
    let resolveConnection: (() => void) | null = null;
    let rejectConnection: ((reason?: Error) => void) | null = null;
    const ws = new RealtimeVoiceClient({
      onOpen: () => {
        if (ws.hasSession) ws.sendResume();
        resolveConnection?.();
      },
      onMessage: handleServerMessage,
      onBinaryMessage: (data) => {
        audioPlayerRef.current?.enqueue(new Int16Array(data as ArrayBuffer));
        if (!stateRef.current.isPlaying) update({ isPlaying: true, status: 'playing' });
      },
      // ReconnectWS retries transient disconnects before it calls onError.
      onDisconnect: () => undefined,
      onError: (error) => rejectConnection?.(error),
    });
    wsRef.current = ws;
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error(RAILWAY_UNAVAILABLE)), 10_000);
      resolveConnection = () => { clearTimeout(timeout); resolve(); };
      rejectConnection = (error) => { clearTimeout(timeout); reject(error || new Error(RAILWAY_UNAVAILABLE)); };
      ws.connect();
    });
    const vad = new VADWrapper({
      onSpeechStart: () => { ws.sendJSON({ type: 'vad_speech_start' }); audioPlayerRef.current?.flush(); update({ isListening: true, isPlaying: false }); },
      onSpeechEnd: () => { ws.sendJSON({ type: 'vad_speech_end' }); },
      onFrameProcessed: () => undefined,
    });
    try { await vad.start(); vadRef.current = vad; } catch { update({ voiceSupported: false }); }
    const pipeline = new AudioPipeline({ onPCMFrame: (pcm16) => ws.sendBinary(pcm16.buffer as ArrayBuffer), onAudioLevel: () => undefined, onError: () => undefined });
    await pipeline.start(); audioPipelineRef.current = pipeline;
    ws.sendJSON({ type: 'start', domain });
  }, [handleServerMessage, update]);

  const startSession = useCallback(async (domain: DemoDomain, mode: DemoMode = 'text') => {
    update({ status: 'connecting', error: null, mode });
    try { if (mode === 'text') await startTextSession(domain); else await startVoiceSession(domain); }
    catch (error) { cleanupVoice(); update({ error: mode === 'voice' ? RAILWAY_UNAVAILABLE : (error instanceof Error ? error.message : 'Failed to start demo'), status: 'error', voiceSupported: mode === 'voice' ? false : stateRef.current.voiceSupported }); }
  }, [cleanupVoice, startTextSession, startVoiceSession, update]);

  const sendTextMessage = useCallback(async (text: string) => {
    const value = text.trim(); if (!value) return;
    if (stateRef.current.mode === 'voice') { if (wsRef.current?.connected) { addTranscriptEntry('user', value); update({ isProcessing: true, status: 'processing' }); wsRef.current.sendJSON({ type: 'text', text: value }); } return; }
    const token = stateRef.current.sessionToken; if (!token) return;
    addTranscriptEntry('user', value); update({ isProcessing: true, status: 'processing' });
    try {
      const response = await fetch('/api/v1/demo/message', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionToken: token, text: value }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.message || 'Failed to send message');
      addTranscriptEntry('agent', result.text);
      update({ status: 'active', isProcessing: false, turnCount: result.turnCount });
      playRestAudio(result.audio, result.audioMimeType);
    } catch (error) { update({ error: error instanceof Error ? error.message : 'Failed to send message', status: 'error', isProcessing: false }); }
  }, [addTranscriptEntry, playRestAudio, update]);

  const startRecording = useCallback(async () => {
    if (stateRef.current.mode !== 'text' || stateRef.current.isProcessing || !navigator.mediaDevices?.getUserMedia) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = MediaRecorder.isTypeSupported('audio/webm')
        ? new MediaRecorder(stream, { mimeType: 'audio/webm' })
        : new MediaRecorder(stream);
      recordedChunksRef.current = [];
      recorder.ondataavailable = (event) => { if (event.data.size) recordedChunksRef.current.push(event.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType });
        update({ isRecording: false });
        if (!blob.size || !stateRef.current.sessionToken) return;
        update({ isProcessing: true, status: 'processing' });
        try {
          const audio = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result as string).split(',')[1] || '');
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(blob);
          });
          const response = await fetch('/api/v1/demo/message', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionToken: stateRef.current.sessionToken, audio, audioMimeType: blob.type }) });
          const result = await response.json();
          if (!response.ok) throw new Error(result.message || 'Failed to process recording');
          addTranscriptEntry('user', result.userText);
          addTranscriptEntry('agent', result.text);
          update({ status: 'active', isProcessing: false, turnCount: result.turnCount });
          playRestAudio(result.audio, result.audioMimeType);
        } catch (error) {
          update({ error: error instanceof Error ? error.message : 'Failed to process recording', status: 'error', isProcessing: false });
        }
      };
      recorder.start();
      recorderRef.current = recorder;
      update({ isRecording: true });
    } catch (error) {
      update({ error: error instanceof Error ? error.message : 'Microphone access is required to record.', status: 'active' });
    }
  }, [addTranscriptEntry, playRestAudio, update]);
  const stopRecording = useCallback(() => recorderRef.current?.state === 'recording' && recorderRef.current.stop(), []);

  const endSession = useCallback(async () => {
    const token = stateRef.current.sessionToken;
    if (stateRef.current.mode === 'text' && token) {
      try { const response = await fetch('/api/v1/demo/end', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionToken: token }) }); if (response.ok) { const result = await response.json(); update({ summary: result.summary }); } } catch { /* ending is best effort */ }
    } else if (wsRef.current?.connected) wsRef.current.sendJSON({ type: 'end' });
    stopTimer(); cleanupVoice(); update({ status: 'ended', isListening: false, isProcessing: false, isPlaying: false });
  }, [cleanupVoice, stopTimer, update]);
  const startListening = useCallback(() => { vadRef.current?.resume(); update({ isListening: true }); }, [update]);
  const stopListening = useCallback(() => { vadRef.current?.pause(); update({ isListening: false }); }, [update]);
  const stopAudioPlayback = useCallback(() => {
    audioPlayerRef.current?.flush();
    restAudioRef.current?.pause();
    restAudioRef.current = null;
    if (wsRef.current?.connected) wsRef.current.sendJSON({ type: 'interrupt' });
    update({ isPlaying: false, status: 'active' });
  }, [update]);
  const submitFeedback = useCallback(async (rating: number, comment?: string) => { const token = stateRef.current.sessionToken; if (!token) return; await fetch('/api/v1/demo/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionToken: token, rating, feedback: comment }) }); }, []);
  const dismissError = useCallback(() => update({ error: null, status: stateRef.current.sessionId ? 'active' : 'idle' }), [update]);
  const reset = useCallback(() => { stopTimer(); cleanupVoice(); setState(INITIAL_STATE); }, [cleanupVoice, stopTimer]);
  useEffect(() => () => { stopTimer(); cleanupVoice(); }, [cleanupVoice, stopTimer]);

  return { state, startSession, endSession, sendTextMessage, startRecording, stopRecording, startListening, stopListening, stopAudioPlayback, submitFeedback, dismissError, reset, getAnalyser: () => null };
}
