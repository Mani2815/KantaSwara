import re

with open('src/app/demo/page.tsx', 'r') as f:
    content = f.read()

start_marker = "{/* ── Main Content ───────────────────────────────────────────────── */}"
end_marker = "    </div>\n  );\n}"

# We need to add Keyboard, Square, VolumeX to imports from lucide-react
if "import { Keyboard," not in content and "Keyboard" not in content:
    content = content.replace(
        "import { Mic, MicOff, Play, Square, Settings, MoreHorizontal, MessageSquare, Send, StopCircle, ArrowLeft, RefreshCw, X, ArrowRight, Check, Sparkles, Star, AlertTriangle, Phone, PhoneOff, Clock, Volume2 } from 'lucide-react';",
        "import { Mic, MicOff, Play, Square, Settings, MoreHorizontal, MessageSquare, Send, StopCircle, ArrowLeft, RefreshCw, X, ArrowRight, Check, Sparkles, Star, AlertTriangle, Phone, PhoneOff, Clock, Volume2, Keyboard, VolumeX } from 'lucide-react';"
    )

new_layout = """{/* ── Main Content ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ── Left Panel: Agent Info & Controls (35%) ──────────────────────────────── */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[var(--color-bg-surface)]/90 backdrop-blur-xl rounded-3xl p-6 lg:p-8 flex flex-col items-center justify-center shadow-2xl border border-[var(--color-border-default)] relative overflow-hidden flex-1 pb-24 lg:pb-8">
              {/* Subtle background glow behind orb */}
              <div className={`absolute top-0 inset-x-0 h-48 bg-gradient-to-b ${domainData?.gradient || 'from-[var(--color-primary)]/10'} to-transparent opacity-50 blur-xl`} />
              
              {/* Voice Orb */}
              <div className="w-40 h-40 lg:w-48 lg:h-48 mb-6 relative flex items-center justify-center shrink-0">
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
                        onClick={() => setInputMode(inputMode === 'text' ? 'voice' : 'text')}
                        className="flex items-center justify-center gap-2 bg-[var(--color-bg-base)] hover:bg-[var(--color-border-default)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] font-medium py-3 px-4 rounded-xl transition-all text-sm"
                      >
                        {inputMode === 'text' ? <Mic className="w-4 h-4" /> : <Keyboard className="w-4 h-4" />}
                        {inputMode === 'text' ? 'Switch to Voice' : 'Switch to Text'}
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

                {/* Ended Session */}
                {state.status === 'ended' && (
                  <div className="w-full space-y-4">
                    {!feedbackSubmitted ? (
                      <div className="bg-[var(--color-bg-base)] rounded-2xl border border-[var(--color-border-default)] p-4 shadow-sm w-full">
                        <h3 className="font-bold text-[var(--color-text-primary)] text-sm mb-3 text-center">
                          Rate your experience
                        </h3>
                        <div className="flex items-center justify-center gap-1 mb-4">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              onClick={() => setFeedbackRating(n)}
                              className="p-1 transition-transform hover:scale-110"
                            >
                              <Star
                                className={`w-6 h-6 ${
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
                          rows={2}
                          className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 mb-3 resize-none shadow-inner"
                        />
                        <button
                          onClick={handleSubmitFeedback}
                          disabled={feedbackRating === 0}
                          className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md"
                        >
                          Submit Feedback
                        </button>
                      </div>
                    ) : (
                      <div className="bg-emerald-500/10 rounded-2xl border border-emerald-500/20 p-4 text-center">
                        <p className="text-emerald-600 font-bold text-sm">
                          Thank you for your feedback! 🙏
                        </p>
                      </div>
                    )}
                    
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
          <div className="lg:col-span-8 flex flex-col space-y-4 h-[calc(100vh-200px)] min-h-[600px] pb-32 lg:pb-0">
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
              {isSessionActive && inputMode === 'text' && (
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
                  </div>
                </div>
              )}
            </div>
            
            {/* Conversation Summary on the Right Side (when ended) */}
            {state.status === 'ended' && state.summary && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="bg-[var(--color-bg-surface)]/90 backdrop-blur-xl rounded-3xl border border-[var(--color-border-default)] p-8 shadow-2xl">
                  <h3 className="font-bold text-[var(--color-text-primary)] text-lg mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[var(--color-primary)]" /> Conversation Summary
                  </h3>
                  <p className="text-[var(--color-text-secondary)] text-[15px] leading-relaxed">
                    {state.summary}
                  </p>
                </div>
                
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

pre = content.split(start_marker)[0]
final_content = pre + new_layout

with open('src/app/demo/page.tsx', 'w') as f:
    f.write(final_content)

print("Replaced content successfully.")
