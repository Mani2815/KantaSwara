import re

with open('src/app/demo/page.tsx', 'r') as f:
    content = f.read()

# 1. Add import
content = content.replace(
    "import { useDemo } from '@/hooks/useDemo';",
    "import { useDemo } from '@/hooks/useDemo';\nimport { VoicePoweredOrb } from '@/components/ui/voice-powered-orb';"
)

# 2. Replace the session layout
start_marker = "{/* ── Main Content ───────────────────────────────────────────────── */}"
end_marker = "    </div>\n  );\n}"

new_layout = """{/* ── Main Content ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ── Left Panel: Agent Info (35%) ──────────────────────────────── */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[var(--color-bg-surface)]/90 backdrop-blur-xl rounded-3xl p-8 flex flex-col items-center justify-center shadow-2xl border border-white/10 dark:border-white/5 relative overflow-hidden">
              {/* Subtle background glow behind orb */}
              <div className={`absolute top-0 inset-x-0 h-48 bg-gradient-to-b ${domainData?.gradient || 'from-purple-500/10'} to-transparent opacity-50 blur-xl`} />
              
              {/* Voice Orb */}
              <div className="w-48 h-48 mb-8 relative flex items-center justify-center">
                <VoicePoweredOrb status={state.status} className="z-10" />
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
                  <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-3 text-center border border-black/5 dark:border-white/5">
                    <p className="text-[var(--color-text-muted)] text-xs mb-1">Turns</p>
                    <p className="text-[var(--color-text-primary)] font-bold text-lg">{state.turnCount}</p>
                  </div>
                  <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-3 text-center border border-black/5 dark:border-white/5">
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

              {/* Action Buttons */}
              {state.status === 'idle' && (
                <button
                  onClick={handleStartDemo}
                  className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-[var(--color-primary)]/20"
                >
                  <Phone className="w-5 h-5" /> Start Demo Call
                </button>
              )}

              {state.status === 'connecting' && (
                <button
                  disabled
                  className="w-full bg-[var(--color-primary)]/60 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 cursor-wait"
                >
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Connecting...
                </button>
              )}

              {state.status === 'ended' && (
                <div className="w-full space-y-3">
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

          {/* ── Right Panel: Transcript & Controls (65%) ─────────────────── */}
          <div className="lg:col-span-8 flex flex-col space-y-4 h-[calc(100vh-200px)] min-h-[600px]">
            {/* Transcript Area */}
            <div className="flex-1 bg-[var(--color-bg-surface)]/90 backdrop-blur-xl rounded-3xl border border-[var(--color-border-default)] overflow-hidden shadow-2xl flex flex-col relative">
              
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

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-[var(--color-bg-base)] to-[var(--color-bg-surface)]">
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
                          : 'bg-white dark:bg-[#1a1a1e] border border-black/5 dark:border-white/5 text-[var(--color-text-primary)] rounded-bl-sm'
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
                    <div className="bg-white dark:bg-[#1a1a1e] border border-black/5 dark:border-white/5 shadow-md rounded-2xl rounded-bl-sm px-5 py-4">
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
              
              {/* Bottom Panel Controls (Inside the transcript card or docked below it) */}
              {isSessionActive && (
                <div className="p-4 bg-[var(--color-bg-base)]/80 backdrop-blur-xl border-t border-[var(--color-border-default)]">
                  {inputMode === 'text' ? (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => state.voiceSupported && setInputMode('voice')}
                        disabled={!state.voiceSupported}
                        className="p-3 rounded-xl bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-base)] border border-[var(--color-border-default)] text-[var(--color-text-secondary)] transition-colors"
                        title="Switch to Voice"
                      >
                        <Mic className="w-5 h-5" />
                      </button>
                      <input
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        disabled={state.isProcessing}
                        className="flex-1 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl px-5 py-3.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] disabled:opacity-50 shadow-inner"
                      />
                      <button
                        onClick={handleSendText}
                        disabled={!textInput.trim() || state.isProcessing}
                        className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white p-3.5 rounded-xl transition-all shadow-lg"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <button
                        onClick={() => setInputMode('text')}
                        className="px-4 py-3 rounded-xl bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-base)] border border-[var(--color-border-default)] text-[var(--color-text-secondary)] font-medium text-sm transition-colors flex items-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" /> Text Mode
                      </button>
                      
                      <div className="flex-1 flex justify-center">
                        {state.isListening ? (
                          <button
                            onClick={stopListening}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 px-8 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-red-500/25 animate-pulse"
                          >
                            <MicOff className="w-5 h-5" /> Stop Recording
                          </button>
                        ) : (
                          <button
                            onClick={startListening}
                            disabled={state.isProcessing || state.isPlaying}
                            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 text-white font-bold py-3.5 px-8 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-[var(--color-primary)]/25"
                          >
                            <Mic className="w-5 h-5" /> Start Recording
                          </button>
                        )}
                      </div>

                      <button
                        onClick={endSession}
                        className="px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-600 font-medium text-sm transition-colors flex items-center gap-2"
                      >
                        <PhoneOff className="w-4 h-4" /> End Call
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Summary + Feedback (shown after session ends) ────────── */}
            {state.status === 'ended' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {/* Summary */}
                {state.summary && (
                  <div className="bg-[var(--color-bg-surface)]/90 backdrop-blur-xl rounded-3xl border border-[var(--color-border-default)] p-8 shadow-2xl">
                    <h3 className="font-bold text-[var(--color-text-primary)] text-lg mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[var(--color-primary)]" /> Conversation Summary
                    </h3>
                    <p className="text-[var(--color-text-secondary)] text-[15px] leading-relaxed">
                      {state.summary}
                    </p>
                  </div>
                )}

                {/* Feedback */}
                {!feedbackSubmitted ? (
                  <div className="bg-[var(--color-bg-surface)]/90 backdrop-blur-xl rounded-3xl border border-[var(--color-border-default)] p-8 shadow-2xl">
                    <h3 className="font-bold text-[var(--color-text-primary)] text-lg mb-4">
                      How was your experience?
                    </h3>
                    <div className="flex items-center gap-2 mb-6">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setFeedbackRating(n)}
                          className="p-1.5 transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              n <= feedbackRating
                                ? 'text-amber-400 fill-amber-400 drop-shadow-md'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Any comments? (optional)"
                      rows={3}
                      className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl px-5 py-4 text-[15px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 mb-4 resize-none shadow-inner"
                    />
                    <button
                      onClick={handleSubmitFeedback}
                      disabled={feedbackRating === 0}
                      className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg"
                    >
                      Submit Feedback
                    </button>
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 rounded-3xl border border-emerald-500/20 p-8 text-center shadow-lg">
                    <p className="text-emerald-600 font-bold text-lg">
                      Thank you for your feedback! 🙏
                    </p>
                  </div>
                )}

                {/* CTA */}
                <div className="bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-primary)]/5 rounded-3xl border border-[var(--color-primary)]/20 p-8 text-center shadow-2xl">
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
                    <button
                      onClick={handleBackToSelection}
                      className="inline-flex items-center gap-2 bg-[var(--color-bg-surface)] border-2 border-[var(--color-border-default)] hover:bg-[var(--color-bg-base)] text-[var(--color-text-primary)] font-bold py-3.5 px-8 rounded-2xl transition-all"
                    >
                      <RefreshCw className="w-5 h-5" /> Try Another Demo
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}"""

# Extract pre and post
pre = content.split(start_marker)[0]
post = ""

final_content = pre + new_layout

with open('src/app/demo/page.tsx', 'w') as f:
    f.write(final_content)

print("Replaced content successfully.")
