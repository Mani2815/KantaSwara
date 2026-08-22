'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Send,
  Star,
  RefreshCw,
  MessageSquare,
  Volume2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Home,
  GraduationCap,
  Car,
  Sparkles,
  AlertTriangle,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemo, type DemoDomain } from '@/hooks/useDemo';

// ── Domain Card Data ────────────────────────────────────────────────────────

interface DomainCardData {
  domain: DemoDomain;
  title: string;
  agent: string;
  role: string;
  description: string;
  topics: string[];
  gradient: string;
  iconBg: string;
  accent: string;
  accentLight: string;
  borderAccent: string;
}

const DOMAINS: DomainCardData[] = [
  {
    domain: 'real_estate',
    title: 'Real Estate',
    agent: 'Arjun',
    role: 'Property Sales Assistant',
    description:
      'AI property sales assistant qualifying buyers, recommending properties, and booking site visits.',
    topics: ['Property availability', 'Budget & pricing', 'Location guide', 'Site visit booking', 'Home loan info'],
    gradient: 'from-orange-500/10 to-amber-500/10',
    iconBg: 'bg-orange-500/15',
    accent: 'text-orange-500',
    accentLight: 'text-orange-400',
    borderAccent: 'border-orange-500/30',
  },
  {
    domain: 'edtech',
    title: 'EdTech',
    agent: 'Kavitha',
    role: 'Admission Counselor',
    description:
      'AI admission counselor verifying eligibility, explaining courses, and scheduling free demo sessions.',
    topics: ['Available courses', 'Eligibility check', 'Fees & EMI plans', 'Free demo class', 'Placement support'],
    gradient: 'from-blue-500/10 to-indigo-500/10',
    iconBg: 'bg-blue-500/15',
    accent: 'text-blue-500',
    accentLight: 'text-blue-400',
    borderAccent: 'border-blue-500/30',
  },
  {
    domain: 'automobile',
    title: 'Automobile',
    agent: 'Rohan',
    role: 'Vehicle Sales Consultant',
    description:
      'AI vehicle consultant analyzing buyer needs, comparing models, and confirming test drives.',
    topics: ['Model comparison', 'Pricing & EMI', 'Fuel type options', 'Book test drive', 'Exchange offers'],
    gradient: 'from-violet-500/10 to-purple-500/10',
    iconBg: 'bg-violet-500/15',
    accent: 'text-violet-500',
    accentLight: 'text-violet-400',
    borderAccent: 'border-violet-500/30',
  },
];

function getDomainIcon(domain: DemoDomain, className: string = 'w-6 h-6') {
  switch (domain) {
    case 'real_estate':
      return <Home className={className} />;
    case 'edtech':
      return <GraduationCap className={className} />;
    case 'automobile':
      return <Car className={className} />;
  }
}

function getDomainData(domain: DemoDomain): DomainCardData {
  return DOMAINS.find((d) => d.domain === domain)!;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function getStatusInfo(status: string): { label: string; color: string; pulse: boolean } {
  switch (status) {
    case 'idle':
      return { label: 'Ready', color: 'bg-gray-400', pulse: false };
    case 'connecting':
      return { label: 'Connecting...', color: 'bg-amber-400', pulse: true };
    case 'active':
      return { label: 'Live', color: 'bg-emerald-500', pulse: true };
    case 'processing':
      return { label: 'Thinking...', color: 'bg-blue-500', pulse: true };
    case 'playing':
      return { label: 'Speaking', color: 'bg-violet-500', pulse: true };
    case 'error':
      return { label: 'Error', color: 'bg-red-500', pulse: false };
    case 'ended':
      return { label: 'Ended', color: 'bg-gray-500', pulse: false };
    default:
      return { label: status, color: 'bg-gray-400', pulse: false };
  }
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function DemoPage() {
  const [selectedDomain, setSelectedDomain] = useState<DemoDomain | null>(null);
  const [phase, setPhase] = useState<'select' | 'session'>('select');
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
    dismissError,
    reset,
  } = useDemo();

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.transcript]);

  // Force text mode if voice is not supported in this browser
  useEffect(() => {
    if (!state.voiceSupported && inputMode === 'voice') {
      setInputMode('text');
    }
  }, [state.voiceSupported, inputMode]);

  // ── Start demo with selected domain ─────────────────────────────────────
  const handleStartDemo = useCallback(async () => {
    if (!selectedDomain) return;
    setPhase('session');
    await startSession(selectedDomain);
  }, [selectedDomain, startSession]);

  // ── Back to domain selection ────────────────────────────────────────────
  const handleBackToSelection = useCallback(() => {
    reset();
    setPhase('select');
    setSelectedDomain(null);
    setFeedbackRating(0);
    setFeedbackText('');
    setFeedbackSubmitted(false);
    setTextInput('');
  }, [reset]);

  // ── Handle text submit ──────────────────────────────────────────────────
  const handleSendText = useCallback(async () => {
    if (!textInput.trim() || state.isProcessing) return;
    const msg = textInput;
    setTextInput('');
    await sendTextMessage(msg);
  }, [textInput, state.isProcessing, sendTextMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendText();
      }
    },
    [handleSendText]
  );

  // ── Handle feedback ─────────────────────────────────────────────────────
  const handleSubmitFeedback = async () => {
    if (feedbackRating === 0) return;
    await submitFeedback(feedbackRating, feedbackText || undefined);
    setFeedbackSubmitted(true);
  };

  // ── Status info ─────────────────────────────────────────────────────────
  const statusInfo = getStatusInfo(state.status);
  const isSessionActive =
    state.status === 'active' || state.status === 'processing' || state.status === 'playing';
  const timeRemaining = Math.max(0, state.maxDurationSec - state.elapsedSeconds);

  // ── Domain selection phase ──────────────────────────────────────────────
  if (phase === 'select') {
    return (
      <div className="min-h-screen bg-[var(--color-bg-canvas)]">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 via-transparent to-[var(--color-primary)]/3" />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-12 pb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Live AI Voice Demo
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] mb-3 tracking-tight">
                Experience AI Voice Agents in Action
              </h1>
              <p className="text-[var(--color-text-secondary)] text-base sm:text-lg max-w-2xl mx-auto mb-2">
                Choose a business domain below and talk to a real AI voice agent.
                No login required — just pick a domain and start.
              </p>
              <p className="text-[var(--color-text-muted)] text-sm">
                Powered by{' '}
                <span className="font-semibold text-[var(--color-text-primary)]">KantaSwara</span>
              </p>
            </motion.div>
          </div>
        </div>

        {/* Domain Cards */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {DOMAINS.map((d, index) => {
              const isSelected = selectedDomain === d.domain;

              return (
                <motion.button
                  key={d.domain}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  onClick={() => setSelectedDomain(d.domain)}
                  className={`relative text-left rounded-2xl border-2 p-6 transition-all duration-300 group cursor-pointer
                    ${
                      isSelected
                        ? `${d.borderAccent} bg-gradient-to-br ${d.gradient} shadow-lg scale-[1.02]`
                        : 'border-[var(--color-border-default)] bg-[var(--color-bg-surface)] hover:border-[var(--color-border-emphasis)] hover:shadow-md'
                    }
                  `}
                >
                  {/* Selected indicator */}
                  {isSelected && (
                    <motion.div
                      layoutId="selected-indicator"
                      className={`absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center ${d.iconBg}`}
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-current" style={{ color: 'var(--color-primary)' }} />
                    </motion.div>
                  )}

                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                      isSelected ? d.iconBg : 'bg-[var(--color-bg-base)]'
                    }`}
                  >
                    <span className={isSelected ? d.accent : 'text-[var(--color-text-muted)]'}>
                      {getDomainIcon(d.domain, 'w-6 h-6')}
                    </span>
                  </div>

                  {/* Title + Agent */}
                  <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">
                    {d.title}
                  </h3>
                  <p className={`text-sm font-medium mb-2 ${isSelected ? d.accent : 'text-[var(--color-text-muted)]'}`}>
                    {d.agent} — {d.role}
                  </p>

                  {/* Description */}
                  <p className="text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed">
                    {d.description}
                  </p>

                  {/* Topics */}
                  <div className="flex flex-wrap gap-1.5">
                    {d.topics.map((topic) => (
                      <span
                        key={topic}
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors ${
                          isSelected
                            ? `${d.iconBg} ${d.accent}`
                            : 'bg-[var(--color-bg-base)] text-[var(--color-text-muted)]'
                        }`}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Start Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center gap-3"
          >
            <button
              id="start-demo-button"
              onClick={handleStartDemo}
              disabled={!selectedDomain}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-10 rounded-xl flex items-center gap-2.5 transition-all shadow-lg shadow-[var(--color-primary)]/20 hover:shadow-xl hover:shadow-[var(--color-primary)]/30 text-base"
            >
              <Phone className="w-5 h-5" />
              {selectedDomain
                ? `Start ${getDomainData(selectedDomain).title} Demo`
                : 'Select a domain to begin'}
            </button>
            <p className="text-[var(--color-text-muted)] text-xs">
              No login required • Microphone optional — you can also type
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Voice session phase ────────────────────────────────────────────────
  const domainData = selectedDomain ? getDomainData(selectedDomain) : null;

  return (
    <div className="min-h-screen bg-[var(--color-bg-canvas)] p-4 sm:p-6 lg:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between border-b border-[var(--color-border-default)] pb-4">
          <div className="flex items-start gap-3">
            {/* Back button */}
            {(state.status === 'idle' || state.status === 'ended' || state.status === 'error') && (
              <button
                onClick={handleBackToSelection}
                className="mt-1 p-1.5 rounded-lg hover:bg-[var(--color-bg-surface)] transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                title="Back to domain selection"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                {domainData && (
                  <span className={domainData.accent}>
                    {getDomainIcon(selectedDomain!, 'w-6 h-6')}
                  </span>
                )}
                {domainData?.title} AI Demo
              </h1>
              <p className="text-[var(--color-text-secondary)] mt-1 text-sm">
                Talk to{' '}
                <span className="font-semibold text-[var(--color-text-primary)]">{state.agentName}</span>
                {domainData && (
                  <span className="text-[var(--color-text-muted)]"> — {domainData.role}</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${statusInfo.color} ${
                statusInfo.pulse ? 'animate-pulse' : ''
              }`}
            />
            <span className="text-xs text-[var(--color-text-muted)]">{statusInfo.label}</span>
          </div>
        </div>

        {/* ── Time Warning Banner ─────────────────────────────────────────── */}
        {state.timeWarning && isSessionActive && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-600 rounded-xl px-4 py-3 text-sm font-medium"
          >
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Your demo session ends in about 30 seconds. Wrap up your conversation!</span>
          </motion.div>
        )}

        {/* ── Dismissable Error Banner ────────────────────────────────────── */}
        {state.error && isSessionActive && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-2.5 bg-red-500/10 border border-red-500/30 text-red-600 rounded-xl px-4 py-3 text-sm"
          >
            <span>{state.error}</span>
            <button
              onClick={dismissError}
              className="flex-shrink-0 p-0.5 rounded hover:bg-red-500/10 transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* ── Main Content ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── Left Panel: Agent + Controls ──────────────────────────────── */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-4">
            {/* Agent Card */}
            <div className="bg-[var(--color-bg-surface)] rounded-2xl p-8 flex flex-col items-center justify-center shadow-sm border border-[var(--color-border-default)]">
              {/* Avatar */}
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ring-4 transition-all duration-300 ${
                  isSessionActive
                    ? `${domainData?.iconBg || 'bg-[var(--color-primary-subtle)]'} ring-[var(--color-primary)]/30`
                    : state.status === 'ended'
                    ? 'bg-gray-100 ring-gray-200'
                    : `${domainData?.iconBg || 'bg-[var(--color-primary-subtle)]'} ring-[var(--color-primary)]/10`
                }`}
              >
                {state.isListening ? (
                  <Mic className="w-10 h-10 text-red-500 animate-pulse" />
                ) : state.isProcessing ? (
                  <div className="w-10 h-10 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : state.isPlaying ? (
                  <Volume2 className={`w-10 h-10 ${domainData?.accent || 'text-[var(--color-primary)]'} animate-pulse`} />
                ) : (
                  <span className={domainData?.accent || 'text-[var(--color-primary)]'}>
                    {selectedDomain
                      ? getDomainIcon(selectedDomain, 'w-10 h-10')
                      : <Volume2 className="w-10 h-10" />}
                  </span>
                )}
              </div>

              <h2 className="text-[var(--color-text-primary)] text-xl font-bold mb-1">{state.agentName}</h2>
              <p className="text-[var(--color-text-muted)] text-sm mb-2">
                {domainData ? `${domainData.title} • ${domainData.role}` : 'KantaSwara AI Assistant'}
              </p>

              {/* Domain Badge */}
              {domainData && (
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full mb-4 ${domainData.iconBg} ${domainData.accent}`}
                >
                  {getDomainIcon(selectedDomain!, 'w-3 h-3')}
                  {domainData.title}
                </span>
              )}

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
                  onClick={handleStartDemo}
                  className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Phone className="w-4 h-4" /> Start Demo Call
                </button>
              )}

              {state.status === 'connecting' && (
                <button
                  disabled
                  className="w-full bg-[var(--color-primary)]/60 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-wait"
                >
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{' '}
                  Connecting...
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
                <div className="w-full space-y-2">
                  <button
                    onClick={reset}
                    className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <RefreshCw className="w-4 h-4" /> Try Again
                  </button>
                  <button
                    onClick={handleBackToSelection}
                    className="w-full border border-[var(--color-border-default)] hover:bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all text-sm"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Change Domain
                  </button>
                </div>
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
                  <button
                    onClick={handleBackToSelection}
                    className="w-full border border-[var(--color-border-default)] hover:bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all text-sm"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Change Domain
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
                    onClick={() => state.voiceSupported && setInputMode('voice')}
                    disabled={!state.voiceSupported}
                    title={!state.voiceSupported ? 'Voice recording is not supported in your browser' : undefined}
                    className={`flex-1 py-2 px-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                      !state.voiceSupported
                        ? 'bg-[var(--color-bg-base)] text-[var(--color-text-muted)] opacity-50 cursor-not-allowed'
                        : inputMode === 'voice'
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)]'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" /> Voice{!state.voiceSupported ? ' (N/A)' : ''}
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
                    <p
                      className={`font-semibold ${
                        timeRemaining < 60 ? 'text-red-500' : 'text-[var(--color-text-primary)]'
                      }`}
                    >
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
            <div
              className="bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border-default)] overflow-hidden shadow-sm flex flex-col"
              style={{ minHeight: '400px', maxHeight: '500px' }}
            >
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
                      Press <strong>Start Demo Call</strong> to begin your conversation with{' '}
                      {state.agentName}
                    </p>
                  </div>
                )}

                {state.transcript.length === 0 && state.status === 'connecting' && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-3">
                      <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-[var(--color-text-muted)] text-sm">
                        Connecting to {state.agentName || 'AI agent'}...
                      </p>
                    </div>
                  </div>
                )}

                {state.transcript.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                        entry.speaker === 'user'
                          ? 'bg-[var(--color-primary)] text-white rounded-br-md'
                          : 'bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] rounded-bl-md'
                      }`}
                    >
                      <p
                        className={`text-[10px] font-medium mb-1 ${
                          entry.speaker === 'user'
                            ? 'text-white/70'
                            : 'text-[var(--color-text-muted)]'
                        }`}
                      >
                        {entry.speaker === 'user' ? 'You' : state.agentName}
                      </p>
                      <p className="leading-relaxed">{entry.text}</p>
                    </div>
                  </motion.div>
                ))}

                {/* Processing indicator */}
                {state.isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex items-center gap-1">
                        <div
                          className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce"
                          style={{ animationDelay: '0ms' }}
                        />
                        <div
                          className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce"
                          style={{ animationDelay: '150ms' }}
                        />
                        <div
                          className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce"
                          style={{ animationDelay: '300ms' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Speaking indicator */}
                {state.isPlaying && !state.isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-[var(--color-bg-surface)] border border-violet-500/30 rounded-2xl rounded-bl-md px-4 py-2.5 flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-violet-500 animate-pulse" />
                      <span className="text-xs text-violet-500 font-medium">{state.agentName} is speaking...</span>
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
                        disabled={state.isProcessing || state.isPlaying}
                        className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 text-white font-medium py-3 px-8 rounded-xl flex items-center gap-2 transition-all"
                      >
                        <Mic className="w-5 h-5" /> Start Recording
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
                    <h3 className="font-bold text-[var(--color-text-primary)] text-sm mb-3">
                      Conversation Summary
                    </h3>
                    <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                      {state.summary}
                    </p>
                  </div>
                )}

                {/* Feedback */}
                {!feedbackSubmitted ? (
                  <div className="bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border-default)] p-6">
                    <h3 className="font-bold text-[var(--color-text-primary)] text-sm mb-3">
                      How was your experience?
                    </h3>
                    <div className="flex items-center gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setFeedbackRating(n)}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              n <= feedbackRating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-gray-300'
                            }`}
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
                    <p className="text-[var(--color-text-primary)] font-medium">
                      Thank you for your feedback! 🙏
                    </p>
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
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium py-3 px-6 rounded-xl transition-all shadow-sm"
                    >
                      Get Started <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={handleBackToSelection}
                      className="inline-flex items-center gap-2 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] hover:bg-[var(--color-bg-base)] text-[var(--color-text-primary)] font-medium py-3 px-6 rounded-xl transition-all"
                    >
                      <RefreshCw className="w-4 h-4" /> Try Another Demo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
