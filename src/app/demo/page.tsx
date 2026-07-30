'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Phone, PhoneOff, Send, Star, RefreshCw, MessageSquare, Volume2, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useDemo, type TranscriptEntry } from '@/hooks/useDemo';

// ── Format seconds as mm:ss ─────────────────────────────────────────────────
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ── Status badge colors ─────────────────────────────────────────────────────
function getStatusInfo(status: string): { label: string; color: string; pulse: boolean } {
  switch (status) {
    case 'idle': return { label: 'Ready', color: 'bg-gray-400', pulse: false };
    case 'connecting': return { label: 'Connecting...', color: 'bg-amber-400', pulse: true };
    case 'active': return { label: 'Live', color: 'bg-emerald-500', pulse: true };
    case 'processing': return { label: 'Thinking...', color: 'bg-blue-500', pulse: true };
    case 'playing': return { label: 'Speaking', color: 'bg-violet-500', pulse: true };
    case 'error': return { label: 'Error', color: 'bg-red-500', pulse: false };
    case 'ended': return { label: 'Ended', color: 'bg-gray-500', pulse: false };
    default: return { label: status, color: 'bg-gray-400', pulse: false };
  }
}

export default function DemoPage() {
  const [textInput, setTextInput] = useState('');
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('text');
  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const {
    state,
    startSession,
    endSession,
    sendTextMessage,
    startListening,
    stopListening,
    submitFeedback,
    reset,
  } = useDemo();

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.transcript]);

  // ── Handle text submit ──────────────────────────────────────────────────
  const handleSendText = useCallback(async () => {
    if (!textInput.trim() || state.isProcessing) return;
    const msg = textInput;
    setTextInput('');
    await sendTextMessage(msg);
  }, [textInput, state.isProcessing, sendTextMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  }, [handleSendText]);

  // ── Handle feedback ─────────────────────────────────────────────────────
  const handleSubmitFeedback = async () => {
    if (feedbackRating === 0) return;
    await submitFeedback(feedbackRating, feedbackText || undefined);
    setFeedbackSubmitted(true);
  };

  // ── Status info ─────────────────────────────────────────────────────────
  const statusInfo = getStatusInfo(state.status);
  const isSessionActive = state.status === 'active' || state.status === 'processing' || state.status === 'playing';
  const timeRemaining = Math.max(0, state.maxDurationSec - state.elapsedSeconds);

  return (
    <div className="min-h-screen bg-[var(--color-bg-canvas)] p-4 sm:p-6 lg:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between border-b border-[var(--color-border-default)] pb-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <Volume2 className="w-6 h-6 text-[var(--color-primary)]" />
              Live AI Voice Demo
            </h1>
            <p className="text-[var(--color-text-secondary)] mt-1 text-sm">
              Experience a real AI voice agent. Talk to{' '}
              <span className="font-semibold text-[var(--color-text-primary)]">{state.agentName}</span>{' '}
              — powered by KantaSwara.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${statusInfo.color} ${statusInfo.pulse ? 'animate-pulse' : ''}`} />
            <span className="text-xs text-[var(--color-text-muted)]">{statusInfo.label}</span>
          </div>
        </div>

        {/* ── Main Content ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Left Panel: Agent + Controls ──────────────────────────────── */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-4">
            {/* Agent Card */}
            <div className="bg-[var(--color-bg-surface)] rounded-2xl p-8 flex flex-col items-center justify-center shadow-sm border border-[var(--color-border-default)]">
              {/* Avatar */}
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ring-4 transition-all duration-300 ${
                isSessionActive
                  ? 'bg-[var(--color-primary-subtle)] ring-[var(--color-primary)]/30'
                  : state.status === 'ended'
                  ? 'bg-gray-100 ring-gray-200'
                  : 'bg-[var(--color-primary-subtle)] ring-[var(--color-primary)]/10'
              }`}>
                {state.isListening ? (
                  <Mic className="w-10 h-10 text-red-500 animate-pulse" />
                ) : state.isProcessing ? (
                  <div className="w-10 h-10 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <Volume2 className={`w-10 h-10 ${isSessionActive ? 'text-[var(--color-primary)]' : 'text-gray-400'}`} />
                )}
              </div>

              <h2 className="text-[var(--color-text-primary)] text-xl font-bold mb-1">{state.agentName}</h2>
              <p className="text-[var(--color-text-muted)] text-sm mb-2">KantaSwara AI Assistant</p>

              {/* Timer */}
              {isSessionActive && (
                <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] mb-6">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTime(state.elapsedSeconds)}</span>
                  <span className="text-[var(--color-text-muted)]">/ {formatTime(state.maxDurationSec)}</span>
                </div>
              )}

              {/* Main Action Button */}
              {state.status === 'idle' && (
                <button
                  onClick={startSession}
                  className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Phone className="w-4 h-4" /> Start Demo Call
                </button>
              )}

              {state.status === 'connecting' && (
                <button disabled className="w-full bg-[var(--color-primary)]/60 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-wait">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Connecting...
                </button>
              )}

              {isSessionActive && (
                <button
                  onClick={endSession}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <PhoneOff className="w-4 h-4" /> End Demo Call
                </button>
              )}

              {state.status === 'ended' && (
                <button
                  onClick={reset}
                  className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <RefreshCw className="w-4 h-4" /> Try Again
                </button>
              )}

              {state.status === 'error' && (
                <div className="w-full space-y-3">
                  <p className="text-red-600 text-sm text-center">{state.error}</p>
                  <button
                    onClick={reset}
                    className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" /> Try Again
                  </button>
                </div>
              )}

              {state.status === 'idle' && (
                <p className="text-[var(--color-text-muted)] text-xs mt-4 text-center">
                  No login required. Microphone optional — you can also type.
                </p>
              )}
            </div>

            {/* Mode Toggle */}
            {isSessionActive && (
              <div className="bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border-default)] p-3">
                <div className="flex rounded-lg overflow-hidden border border-[var(--color-border-default)]">
                  <button
                    onClick={() => setInputMode('text')}
                    className={`flex-1 py-2 px-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                      inputMode === 'text'
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)]'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Text
                  </button>
                  <button
                    onClick={() => setInputMode('voice')}
                    className={`flex-1 py-2 px-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                      inputMode === 'voice'
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)]'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" /> Voice
                  </button>
                </div>
              </div>
            )}

            {/* Session Stats */}
            {isSessionActive && (
              <div className="bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border-default)] p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[var(--color-text-muted)] text-xs">Turns</p>
                    <p className="text-[var(--color-text-primary)] font-semibold">{state.turnCount}</p>
                  </div>
                  <div>
                    <p className="text-[var(--color-text-muted)] text-xs">Time Left</p>
                    <p className={`font-semibold ${timeRemaining < 60 ? 'text-red-500' : 'text-[var(--color-text-primary)]'}`}>
                      {formatTime(timeRemaining)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Right Panel: Transcript + Input ──────────────────────────── */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">

            {/* Transcript */}
            <div className="bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border-default)] overflow-hidden shadow-sm flex flex-col" style={{ minHeight: '400px', maxHeight: '500px' }}>
              <div className="px-6 py-4 border-b border-[var(--color-border-default)] flex items-center justify-between">
                <h3 className="font-bold text-[var(--color-text-primary)] text-sm">Live Transcript</h3>
                {state.transcript.length > 0 && (
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {state.transcript.length} messages
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--color-bg-base)]">
                {state.transcript.length === 0 && state.status === 'idle' && (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-[var(--color-text-muted)] text-sm text-center">
                      Press <strong>Start Demo Call</strong> to begin your conversation with {state.agentName}
                    </p>
                  </div>
                )}

                {state.transcript.map((entry) => (
                  <div
                    key={entry.id}
                    className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                        entry.speaker === 'user'
                          ? 'bg-[var(--color-primary)] text-white rounded-br-md'
                          : 'bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] rounded-bl-md'
                      }`}
                    >
                      <p className={`text-[10px] font-medium mb-1 ${
                        entry.speaker === 'user' ? 'text-white/70' : 'text-[var(--color-text-muted)]'
                      }`}>
                        {entry.speaker === 'user' ? 'You' : state.agentName}
                      </p>
                      <p className="leading-relaxed">{entry.text}</p>
                    </div>
                  </div>
                ))}

                {/* Processing indicator */}
                {state.isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={transcriptEndRef} />
              </div>
            </div>

            {/* Input Area */}
            {isSessionActive && (
              <div className="bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border-default)] p-3">
                {inputMode === 'text' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your message..."
                      disabled={state.isProcessing}
                      className="flex-1 bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-lg px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] disabled:opacity-50"
                    />
                    <button
                      onClick={handleSendText}
                      disabled={!textInput.trim() || state.isProcessing}
                      className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 rounded-lg transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-2">
                    {state.isListening ? (
                      <button
                        onClick={stopListening}
                        className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-8 rounded-xl flex items-center gap-2 transition-all animate-pulse"
                      >
                        <MicOff className="w-5 h-5" /> Stop Recording
                      </button>
                    ) : (
                      <button
                        onClick={startListening}
                        disabled={state.isProcessing}
                        className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 text-white font-medium py-3 px-8 rounded-xl flex items-center gap-2 transition-all"
                      >
                        <Mic className="w-5 h-5" /> Hold to Speak
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Summary + Feedback (shown after session ends) ────────── */}
            {state.status === 'ended' && (
              <div className="space-y-4">
                {/* Summary */}
                {state.summary && (
                  <div className="bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border-default)] p-6">
                    <h3 className="font-bold text-[var(--color-text-primary)] text-sm mb-3">Conversation Summary</h3>
                    <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">{state.summary}</p>
                  </div>
                )}

                {/* Feedback */}
                {!feedbackSubmitted ? (
                  <div className="bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border-default)] p-6">
                    <h3 className="font-bold text-[var(--color-text-primary)] text-sm mb-3">How was your experience?</h3>
                    <div className="flex items-center gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setFeedbackRating(n)}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-7 h-7 ${n <= feedbackRating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Any comments? (optional)"
                      rows={2}
                      className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-lg px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 mb-3 resize-none"
                    />
                    <button
                      onClick={handleSubmitFeedback}
                      disabled={feedbackRating === 0}
                      className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Submit Feedback
                    </button>
                  </div>
                ) : (
                  <div className="bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border-default)] p-6 text-center">
                    <p className="text-[var(--color-text-primary)] font-medium">Thank you for your feedback! 🙏</p>
                  </div>
                )}

                {/* CTA */}
                <div className="bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-primary)]/5 rounded-xl border border-[var(--color-primary)]/20 p-6 text-center">
                  <h3 className="text-[var(--color-text-primary)] font-bold text-lg mb-2">
                    Impressed? Build your own AI voice agent.
                  </h3>
                  <p className="text-[var(--color-text-secondary)] text-sm mb-4">
                    Get a custom AI voice agent tailored to your business. No coding required.
                  </p>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium py-3 px-6 rounded-xl transition-all shadow-sm"
                  >
                    Get Started <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
