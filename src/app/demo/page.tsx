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
  Keyboard,
  Square,
  VolumeX,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemo, type DemoMode } from '@/hooks/useDemo';
import { VoicePoweredOrb } from '@/components/ui/voice-powered-orb';
import type { DemoDomain } from '@server/services/demo/domain-personas.config';

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
  const [selectedMode, setSelectedMode] = useState<DemoMode>('text');
  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const {
    state,
    startSession,
    endSession,
    sendTextMessage,
    startRecording,
    stopRecording,
    startListening,
    stopListening,
    stopAudioPlayback,
    submitFeedback,
    dismissError,
    reset,
    getAnalyser,
  } = useDemo();

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.transcript]);

  // ── Start demo with selected domain ─────────────────────────────────────
  const handleStartDemo = useCallback(async () => {
    if (!selectedDomain) return;
    if (selectedMode === 'voice' && !state.voiceSupported) return;
    setPhase('session');
    await startSession(selectedDomain, selectedMode);
  }, [selectedDomain, selectedMode, startSession, state.voiceSupported]);

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
            <div className="flex rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setSelectedMode('text')}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${selectedMode === 'text' ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-base)]'}`}
              >
                <Keyboard className="mr-1.5 inline-block h-4 w-4" /> Text Mode
              </button>
              <button
                type="button"
                onClick={() => state.voiceSupported && setSelectedMode('voice')}
                disabled={!state.voiceSupported}
                title={!state.voiceSupported ? 'Real-Time Voice is temporarily unavailable.' : 'Use real-time voice'}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${selectedMode === 'voice' ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-base)]'}`}
              >
                <Mic className="mr-1.5 inline-block h-4 w-4" /> Real-Time Voice
              </button>
            </div>
            {!state.voiceSupported && (
              <p className="text-xs text-[var(--color-text-muted)]">Real-Time Voice is temporarily unavailable.</p>
            )}
            <button
              id="start-demo-button"
              onClick={handleStartDemo}
              disabled={!selectedDomain}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-10 rounded-xl flex items-center gap-2.5 transition-all shadow-lg shadow-[var(--color-primary)]/20 hover:shadow-xl hover:shadow-[var(--color-primary)]/30 text-base"
            >
              {selectedMode === 'voice' ? <Phone className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
              {selectedDomain
                ? `Start ${getDomainData(selectedDomain).title} ${selectedMode === 'voice' ? 'Voice' : 'Text'} Demo`
                : 'Select a domain to begin'}
            </button>
            <p className="text-[var(--color-text-muted)] text-xs">
              No login required • Text mode works without real-time voice
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ── Left Panel: Agent Info & Controls (35%) ──────────────────────────────── */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[var(--color-bg-surface)]/90 backdrop-blur-xl rounded-3xl p-6 lg:p-8 flex flex-col items-center justify-center shadow-2xl border border-[var(--color-border-default)] relative overflow-hidden flex-1 pb-24 lg:pb-8">
              {/* Subtle background glow behind orb */}
              <div className={`absolute top-0 inset-x-0 h-48 bg-gradient-to-b ${domainData?.gradient || 'from-[var(--color-primary)]/10'} to-transparent opacity-50 blur-xl`} />
              
              {/* Voice Orb */}
              <div className="w-40 h-40 lg:w-48 lg:h-48 mb-6 relative flex items-center justify-center shrink-0">
                <VoicePoweredOrb status={state.status} analyser={getAnalyser()} className="z-10" />
              </div>

              <h2 className="text-[var(--color-text-primary)] text-2xl font-bold mb-1 text-center">{state.agentName}</h2>
              <p className="text-[var(--color-text-muted)] text-sm mb-4 text-center">
                {domainData ? `${domainData.title} • ${domainData.role}` : 'KantaSwara AI Assistant'}
              </p>

              {/* Domain Badge */}
              {domainData && (
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 ${domainData.iconBg} ${domainData.accent} ring-1 ring-inset ${domainData.borderAccent} shadow-sm`}
                >
                  {getDomainIcon(selectedDomain!, 'w-4 h-4')}
                  {domainData.title}
                </span>
              )}

              {/* Session Stats */}
              {isSessionActive && (
                <div className="w-full grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-[var(--color-bg-base)]/50 rounded-2xl p-3 text-center border border-[var(--color-border-default)]">
                    <p className="text-[var(--color-text-muted)] text-xs mb-1">Turns</p>
                    <p className="text-[var(--color-text-primary)] font-bold text-lg">{state.turnCount}</p>
                  </div>
                  <div className="bg-[var(--color-bg-base)]/50 rounded-2xl p-3 text-center border border-[var(--color-border-default)]">
                    <p className="text-[var(--color-text-muted)] text-xs mb-1">Time Left</p>
                    <p
                      className={`font-bold text-lg ${
                        timeRemaining < 60 ? 'text-red-500' : 'text-[var(--color-text-primary)]'
                      }`}
                    >
                      {formatTime(timeRemaining)}
                    </p>
                  </div>
                </div>
              )}

              {/* Recording Status Indicator */}
              {state.isListening && (
                <div className="flex items-center gap-2 text-red-500 font-medium text-sm mb-4 animate-pulse">
                   <Mic className="w-4 h-4" /> Listening...
                </div>
              )}

              {/* Action Buttons (Sticky on mobile, static on desktop) */}
              <div className="fixed bottom-0 inset-x-0 p-4 bg-[var(--color-bg-surface)]/95 backdrop-blur-xl border-t border-[var(--color-border-default)] lg:static lg:p-0 lg:bg-transparent lg:backdrop-blur-none lg:border-t-0 w-full flex flex-col gap-3 z-50 rounded-t-3xl lg:rounded-none shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:shadow-none">
                
                {/* Idle state */}
                {state.status === 'idle' && (
                  <button
                    onClick={handleStartDemo}
                    className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-[var(--color-primary)]/20"
                  >
                    <Phone className="w-5 h-5" /> Start Demo Call
                  </button>
                )}

                {/* Connecting */}
                {state.status === 'connecting' && (
                  <button
                    disabled
                    className="w-full bg-[var(--color-primary)]/60 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 cursor-wait"
                  >
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Connecting...
                  </button>
                )}

                {/* Active Session */}
                {isSessionActive && (
                  <>
                    {/* Primary Button */}
                    {state.isPlaying ? (
                      <button
                        onClick={stopAudioPlayback}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-amber-500/25"
                      >
                        <Square className="w-5 h-5 fill-current" /> Stop Speaking
                      </button>
                    ) : state.isListening ? (
                      <button
                        onClick={stopListening}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-red-500/25 animate-pulse"
                      >
                        <MicOff className="w-5 h-5" /> Stop Recording
                      </button>
                    ) : (
                      <button
                        onClick={startListening}
                        disabled={state.isProcessing}
                        className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-[var(--color-primary)]/25"
                      >
                        <Mic className="w-5 h-5" /> Hold to Speak
                      </button>
                    )}

                    {/* Secondary Buttons Row 1 */}
                    <div className="grid grid-cols-2 gap-3 mt-1">
                      <button
                    onClick={handleBackToSelection}
                    className="flex items-center justify-center gap-2 bg-[var(--color-bg-base)] hover:bg-[var(--color-border-default)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] font-medium py-3 px-4 rounded-xl transition-all text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" /> Change Mode
                  </button>
                      <button
                        onClick={stopAudioPlayback}
                        className="flex items-center justify-center gap-2 bg-[var(--color-bg-base)] hover:bg-[var(--color-border-default)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] font-medium py-3 px-4 rounded-xl transition-all text-sm"
                      >
                        <VolumeX className="w-4 h-4" /> Mute AI
                      </button>
                    </div>

                    {/* Secondary Buttons Row 2 */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={reset}
                        className="flex items-center justify-center gap-2 bg-[var(--color-bg-base)] hover:bg-[var(--color-border-default)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] font-medium py-3 px-4 rounded-xl transition-all text-sm"
                      >
                        <RefreshCw className="w-4 h-4" /> Restart
                      </button>
                      <button
                        onClick={endSession}
                        className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-600 font-medium py-3 px-4 rounded-xl transition-all text-sm"
                      >
                        <PhoneOff className="w-4 h-4" /> End Call
                      </button>
                    </div>
                  </>
                )}

                {/* Ended Session (Actions Only in Left Panel) */}
                {state.status === 'ended' && (
                  <div className="w-full space-y-4">
                    <button
                      onClick={reset}
                      className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-[var(--color-primary)]/20"
                    >
                      <RefreshCw className="w-5 h-5" /> Try Again
                    </button>
                    <button
                      onClick={handleBackToSelection}
                      className="w-full border-2 border-[var(--color-border-default)] hover:bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] font-semibold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all text-sm"
                    >
                      <ArrowLeft className="w-4 h-4" /> Change Domain
                    </button>
                  </div>
                )}
                
                {/* Error Session */}
                {state.status === 'error' && (
                  <div className="w-full space-y-3">
                    <p className="text-red-600 text-sm text-center bg-red-500/10 p-3 rounded-xl border border-red-500/20">{state.error}</p>
                    <button
                      onClick={reset}
                      className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all"
                    >
                      <RefreshCw className="w-5 h-5" /> Try Again
                    </button>
                    <button
                      onClick={handleBackToSelection}
                      className="w-full border-2 border-[var(--color-border-default)] hover:bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] font-semibold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all text-sm"
                    >
                      <ArrowLeft className="w-4 h-4" /> Change Domain
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right Panel: Transcript (65%) ─────────────────── */}
          <div className="lg:col-span-8 flex flex-col space-y-4 h-full min-h-[600px] pb-32 lg:pb-0">
            {/* Transcript Area */}
            <div className="flex-1 bg-[var(--color-bg-surface)]/90 backdrop-blur-xl rounded-3xl border border-[var(--color-border-default)] overflow-hidden shadow-2xl flex flex-col relative" style={{ minHeight: '400px', maxHeight: '600px' }}>
              
              <div className="px-6 py-4 border-b border-[var(--color-border-default)] flex items-center justify-between bg-[var(--color-bg-base)]/50">
                <h3 className="font-bold text-[var(--color-text-primary)] text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Live Transcript
                </h3>
                {state.transcript.length > 0 && (
                  <span className="text-xs font-semibold bg-[var(--color-bg-surface)] px-2 py-1 rounded-full text-[var(--color-text-muted)] shadow-inner">
                    {state.transcript.length} messages
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[var(--color-bg-base)]">
                {state.transcript.length === 0 && state.status === 'idle' && (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                    <MessageSquare className="w-12 h-12 text-[var(--color-text-muted)]" />
                    <p className="text-[var(--color-text-muted)] text-sm">
                      Press <strong className="text-[var(--color-text-primary)]">Start Demo Call</strong> to begin your conversation with {state.agentName}.
                    </p>
                  </div>
                )}

                {state.transcript.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
                    className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-[15px] shadow-md ${
                        entry.speaker === 'user'
                          ? 'bg-[var(--color-primary)] text-white rounded-br-sm'
                          : 'bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] rounded-bl-sm'
                      }`}
                    >
                      <p
                        className={`text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
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
                    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-md rounded-2xl rounded-bl-sm px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={transcriptEndRef} />
              </div>
              
              {/* Text Input area when in Text Mode */}
              {isSessionActive && state.mode === 'text' && (
                <div className="p-4 bg-[var(--color-bg-surface)]/90 backdrop-blur-xl border-t border-[var(--color-border-default)]">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your message..."
                      disabled={state.isProcessing}
                      className="flex-1 bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl px-5 py-3.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] disabled:opacity-50 shadow-inner"
                    />
                    <button
                      onClick={handleSendText}
                      disabled={!textInput.trim() || state.isProcessing}
                      className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white p-3.5 rounded-xl transition-all shadow-lg"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={state.isRecording ? stopRecording : startRecording}
                      disabled={state.isProcessing}
                      title={state.isRecording ? 'Stop recording' : 'Record a voice message'}
                      className={`p-3.5 rounded-xl transition-all shadow-lg disabled:opacity-50 ${state.isRecording ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' : 'bg-[var(--color-bg-base)] hover:bg-[var(--color-border-default)] border border-[var(--color-border-default)] text-[var(--color-text-primary)]'}`}
                    >
                      {state.isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
                    </button>
                  </div>
                  {state.isRecording && <p className="mt-2 text-xs font-medium text-red-500">Recording… tap stop to send.</p>}
                </div>
              )}
            </div>
            
            {/* ── Feedback & Summary (Below Transcript) ────────── */}
            {state.status === 'ended' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-6">
                
                {/* Summary */}
                {state.summary && (
                  <div className="bg-[var(--color-bg-surface)]/90 backdrop-blur-xl rounded-3xl border border-[var(--color-border-default)] p-8 shadow-xl">
                    <h3 className="font-bold text-[var(--color-text-primary)] text-lg mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[var(--color-primary)]" /> Conversation Summary
                    </h3>
                    <p className="text-[var(--color-text-secondary)] text-[15px] leading-relaxed">
                      {state.summary}
                    </p>
                  </div>
                )}
                
                {/* Visual Separator */}
                <div className="flex items-center gap-4 py-2">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--color-border-default)] to-transparent" />
                </div>

                {/* Feedback */}
                {!feedbackSubmitted ? (
                  <div className="bg-[var(--color-bg-surface)]/90 backdrop-blur-xl rounded-3xl border border-[var(--color-border-default)] p-8 shadow-2xl flex flex-col items-center">
                    <h3 className="font-bold text-[var(--color-text-primary)] text-xl mb-2">
                      Rate your experience
                    </h3>
                    <p className="text-[var(--color-text-muted)] text-sm mb-6 text-center">Your feedback helps us improve the AI.</p>
                    
                    <div className="flex items-center gap-3 mb-8">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setFeedbackRating(n)}
                          className="p-2 transition-transform hover:scale-110 active:scale-95"
                        >
                          <Star
                            className={`w-10 h-10 ${
                              n <= feedbackRating
                                ? 'text-amber-400 fill-amber-400 drop-shadow-lg'
                                : 'text-gray-300 dark:text-gray-700'
                            } transition-colors`}
                          />
                        </button>
                      ))}
                    </div>
                    
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Any specific comments? (optional)"
                      rows={4}
                      className="w-full max-w-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-2xl px-6 py-4 text-base text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 mb-6 resize-none shadow-inner"
                    />
                    
                    <button
                      onClick={handleSubmitFeedback}
                      disabled={feedbackRating === 0}
                      className="w-full max-w-2xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" /> Submit Feedback
                    </button>
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 rounded-3xl border border-emerald-500/20 p-8 text-center shadow-lg">
                    <p className="text-emerald-600 font-bold text-xl flex items-center justify-center gap-2">
                      <Check className="w-6 h-6" /> Thank you for your feedback!
                    </p>
                  </div>
                )}
                
                {/* CTA */}
                <div className="bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-primary)]/5 rounded-3xl border border-[var(--color-primary)]/20 p-8 text-center shadow-xl">
                  <h3 className="text-[var(--color-text-primary)] font-bold text-xl mb-2">
                    Impressed? Build your own AI voice agent.
                  </h3>
                  <p className="text-[var(--color-text-secondary)] text-base mb-6">
                    Get a custom AI voice agent tailored to your business. No coding required.
                  </p>
                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-3.5 px-8 rounded-2xl transition-all shadow-xl shadow-[var(--color-primary)]/20"
                    >
                      Get Started <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
