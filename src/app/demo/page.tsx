'use client';

import { useState } from 'react';
import { Mic, Clapperboard, RefreshCw } from 'lucide-react';
import Image from 'next/image';

export default function DemoPage() {
  const [isCalling, setIsCalling] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-bg-canvas)] p-6 lg:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[var(--color-border-default)] pb-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <Clapperboard className="w-6 h-6 text-[var(--color-primary)]" /> Demo Campaign (Voice Agent)
            </h1>
            <p className="text-[var(--color-text-secondary)] mt-1 text-sm">
              Speak to <span className="font-semibold text-[var(--color-text-primary)]">Rani</span> — your voice drives the conversation, dashboard updates live.
            </p>
          </div>
          <div className="w-3 h-3 rounded-full bg-emerald-500 mt-2 animate-pulse" title="System Online"></div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-[var(--color-bg-surface)] rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px] shadow-sm border border-[var(--color-border-default)]">
              <div className="w-24 h-24 rounded-full bg-[var(--color-primary-subtle)] flex items-center justify-center mb-6 ring-4 ring-[var(--color-primary)]/10">
                <Mic className="w-10 h-10 text-[var(--color-primary)]" />
              </div>
              <h2 className="text-[var(--color-text-primary)] text-xl font-bold mb-1">Rani</h2>
              <p className="text-[var(--color-text-muted)] text-sm mb-8">Idle</p>

              <button 
                onClick={() => setIsCalling(!isCalling)}
                className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Clapperboard className="w-4 h-4" /> {isCalling ? 'End Demo Call' : 'Start Demo Call'}
              </button>
              <p className="text-[var(--color-text-muted)] text-xs mt-4">
                Allow mic access when prompted
              </p>
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* Live Feed Card */}
            <div className="bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border-default)] overflow-hidden shadow-sm flex flex-col min-h-[160px]">
              <div className="px-6 py-4 border-b border-[var(--color-border-default)] flex items-center justify-between">
                <h3 className="font-bold text-[var(--color-text-primary)] text-sm">Live Feed</h3>
                <span className="text-xs text-[var(--color-text-muted)]">Waiting for call...</span>
              </div>
              <div className="flex-1 p-6 flex items-center justify-center bg-[var(--color-bg-base)]">
                <p className="text-[var(--color-text-muted)] text-sm">
                  Press Start Demo Call to see live updates
                </p>
              </div>
            </div>

            {/* Live Transcript Card */}
            <div className="bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border-default)] overflow-hidden shadow-sm flex flex-col min-h-[220px]">
              <div className="px-6 py-4 border-b border-[var(--color-border-default)] flex items-center justify-between">
                <h3 className="font-bold text-[var(--color-text-primary)] text-sm">Live Transcript</h3>
                <button className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">Clear</button>
              </div>
              <div className="flex-1 p-6 flex items-center justify-center bg-[var(--color-bg-base)]">
                <p className="text-[var(--color-text-muted)] text-sm">
                  Transcript will appear as you speak
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
