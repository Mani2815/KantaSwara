import re

with open('src/app/demo/page.tsx', 'r') as f:
    content = f.read()

start_str = "{/* Action Buttons (Sticky on mobile, static on desktop) */}"
end_str = "{/* ── Right Panel: Transcript (65%) ─────────────────── */}"

new_controls = """{/* Action Buttons (Sticky on mobile, static on desktop) */}
              <div className="fixed bottom-0 inset-x-0 p-5 bg-[var(--color-bg-surface)]/95 backdrop-blur-2xl border-t border-white/10 dark:border-white/5 lg:static lg:p-0 lg:bg-transparent lg:backdrop-blur-none lg:border-t-0 w-full flex flex-col gap-4 z-50 rounded-t-[2.5rem] lg:rounded-none shadow-[0_-15px_40px_rgba(0,0,0,0.15)] lg:shadow-none">
                
                {/* Idle state */}
                {state.status === 'idle' && (
                  <button
                    onClick={handleStartDemo}
                    className="group relative w-full h-16 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-lg tracking-tight rounded-full flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] active:scale-95"
                  >
                    <Mic className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                    <span>Start Voice Conversation</span>
                    <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300" />
                  </button>
                )}

                {/* Connecting */}
                {state.status === 'connecting' && (
                  <button
                    disabled
                    className="w-full h-16 bg-gradient-to-r from-violet-600/60 to-indigo-600/60 text-white font-semibold text-lg tracking-tight rounded-full flex items-center justify-center gap-3 cursor-wait shadow-lg"
                  >
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> 
                    <span>Connecting...</span>
                  </button>
                )}

                {/* Active Session */}
                {isSessionActive && (
                  <div className="flex flex-col gap-5">
                    {/* Primary Button */}
                    <div className="relative w-full flex justify-center">
                      {state.isPlaying ? (
                        <button
                          onClick={stopAudioPlayback}
                          className="group relative w-full h-16 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-lg tracking-tight rounded-full flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-95 overflow-hidden"
                        >
                          <div className="absolute inset-0 opacity-30 flex items-center justify-center gap-1.5">
                            {[0,1,2,3,4].map((i) => (
                              <motion.div
                                key={i}
                                className="w-1.5 bg-white rounded-full"
                                animate={{ height: ['20%', '80%', '20%'] }}
                                transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut', delay: i * 0.15 }}
                              />
                            ))}
                          </div>
                          <Square className="w-6 h-6 fill-current relative z-10 group-hover:scale-110 transition-transform duration-300" />
                          <span className="relative z-10">Stop Speaking</span>
                        </button>
                      ) : state.isListening ? (
                        <button
                          onClick={stopListening}
                          className="group relative w-full h-16 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-lg tracking-tight rounded-full flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(124,58,237,0.7)] active:scale-95"
                        >
                          <div className="absolute -inset-1.5 rounded-full bg-violet-500/40 blur-lg animate-pulse" />
                          <div className="absolute inset-0 rounded-full border-2 border-white/40 animate-ping" />
                          <Mic className="w-6 h-6 relative z-10 animate-pulse text-white drop-shadow-[0_0_10px_rgba(255,255,255,1)]" />
                          <span className="relative z-10 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">Hold to Speak</span>
                        </button>
                      ) : (
                        <button
                          onClick={startListening}
                          disabled={state.isProcessing}
                          className="group relative w-full h-16 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-lg tracking-tight rounded-full flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                        >
                          {state.isProcessing ? (
                            <div className="flex gap-1.5">
                               <div className="w-2 h-2 bg-white/90 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                               <div className="w-2 h-2 bg-white/90 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                               <div className="w-2 h-2 bg-white/90 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          ) : (
                            <>
                              <Mic className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                              <span>Start Recording</span>
                              <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300" />
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Secondary Actions Toolbar */}
                    <div className="flex items-center justify-between p-1.5 bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-inner relative z-10">
                      <button
                        onClick={() => setInputMode(inputMode === 'text' ? 'voice' : 'text')}
                        className={`flex-1 flex flex-col items-center justify-center gap-1.5 h-12 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${inputMode === 'text' ? 'bg-white/20 shadow-sm' : 'hover:bg-white/10'}`}
                      >
                        {inputMode === 'text' ? (
                          <Mic className="w-4 h-4 text-[var(--color-text-primary)]" />
                        ) : (
                          <Keyboard className="w-4 h-4 text-[var(--color-text-primary)]" />
                        )}
                        <span className="text-[10px] font-semibold tracking-tight text-[var(--color-text-primary)]">
                          {inputMode === 'text' ? 'Voice' : 'Text'}
                        </span>
                      </button>
                      
                      <div className="w-px h-8 bg-white/20 mx-1" />

                      <button
                        onClick={stopAudioPlayback}
                        className="flex-1 flex flex-col items-center justify-center gap-1.5 h-12 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 active:scale-95 group"
                      >
                        <VolumeX className="w-4 h-4 text-[var(--color-text-primary)] group-hover:text-amber-400 transition-colors" />
                        <span className="text-[10px] font-semibold tracking-tight text-[var(--color-text-primary)]">Mute</span>
                      </button>
                      
                      <div className="w-px h-8 bg-white/20 mx-1" />

                      <button
                        onClick={reset}
                        className="flex-1 flex flex-col items-center justify-center gap-1.5 h-12 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 active:scale-95 group"
                      >
                        <RefreshCw className="w-4 h-4 text-[var(--color-text-primary)] group-hover:rotate-180 transition-transform duration-500" />
                        <span className="text-[10px] font-semibold tracking-tight text-[var(--color-text-primary)]">Restart</span>
                      </button>
                    </div>

                    {/* Danger Action */}
                    <div className="pt-2 border-t border-[var(--color-border-default)]">
                      <button
                        onClick={endSession}
                        className="group relative w-full h-14 bg-red-500 hover:bg-red-600 text-white font-semibold text-[15px] tracking-tight rounded-full flex items-center justify-center gap-2.5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:-translate-y-[1px] active:scale-95"
                      >
                        <PhoneOff className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                        <span>End Conversation</span>
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Ended Session */}
                {state.status === 'ended' && (
                  <div className="w-full space-y-4">
                    {!feedbackSubmitted ? (
                      <div className="bg-[var(--color-bg-base)]/80 backdrop-blur-md rounded-3xl border border-[var(--color-border-default)] p-5 shadow-sm w-full">
                        <h3 className="font-bold text-[var(--color-text-primary)] text-[15px] mb-4 text-center">
                          Rate your experience
                        </h3>
                        <div className="flex items-center justify-center gap-2 mb-5">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              onClick={() => setFeedbackRating(n)}
                              className="p-1.5 transition-all duration-200 hover:scale-110 hover:-translate-y-1"
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
                          rows={2}
                          className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-2xl px-4 py-3.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 mb-4 resize-none shadow-inner transition-all"
                        />
                        <button
                          onClick={handleSubmitFeedback}
                          disabled={feedbackRating === 0}
                          className="w-full h-14 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] hover:opacity-90 disabled:opacity-50 text-white font-semibold tracking-tight text-[15px] rounded-full transition-all shadow-md active:scale-95"
                        >
                          Submit Feedback
                        </button>
                      </div>
                    ) : (
                      <div className="bg-emerald-500/10 backdrop-blur-md rounded-3xl border border-emerald-500/20 p-5 text-center">
                        <p className="text-emerald-600 font-bold text-sm">
                          Thank you for your feedback! 🙏
                        </p>
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-3 pt-2">
                      <button
                        onClick={reset}
                        className="group relative w-full h-14 bg-[var(--color-bg-base)] hover:bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] font-semibold text-[15px] tracking-tight rounded-full flex items-center justify-center gap-2.5 transition-all duration-300 hover:-translate-y-[1px] hover:shadow-md active:scale-95"
                      >
                        <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                        <span>Try Again</span>
                      </button>
                      <button
                        onClick={handleBackToSelection}
                        className="group relative w-full h-14 bg-[var(--color-bg-base)] hover:bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[var(--color-text-secondary)] font-semibold text-[15px] tracking-tight rounded-full flex items-center justify-center gap-2.5 transition-all duration-300 hover:-translate-y-[1px] hover:shadow-md active:scale-95"
                      >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                        <span>Change Domain</span>
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Error Session */}
                {state.status === 'error' && (
                  <div className="w-full space-y-4">
                    <p className="text-red-600 text-sm font-medium text-center bg-red-500/10 p-4 rounded-2xl border border-red-500/20">{state.error}</p>
                    <button
                      onClick={reset}
                      className="group relative w-full h-14 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold tracking-tight text-[15px] rounded-full flex items-center justify-center gap-2.5 transition-all duration-300 hover:-translate-y-[1px] hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] active:scale-95"
                    >
                      <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                      <span>Try Again</span>
                    </button>
                    <button
                      onClick={handleBackToSelection}
                      className="group relative w-full h-14 bg-[var(--color-bg-base)] hover:bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[var(--color-text-secondary)] font-semibold tracking-tight text-[15px] rounded-full flex items-center justify-center gap-2.5 transition-all duration-300 hover:-translate-y-[1px] hover:shadow-md active:scale-95"
                    >
                      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                      <span>Change Domain</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          """

pre, post = content.split(start_str, 1)
_, post = post.split(end_str, 1)

final_content = pre + new_controls + end_str + post

with open('src/app/demo/page.tsx', 'w') as f:
    f.write(final_content)

print("Replaced content successfully.")
