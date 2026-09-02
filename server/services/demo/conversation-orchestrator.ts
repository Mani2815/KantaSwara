// =============================================================================
// Conversation Orchestrator
// =============================================================================
// Central state machine for real-time streaming voice demo sessions.
// One instance per session, lives inside the pinned Vercel Function.
//
// Pipeline: Browser ↔ WebSocket ↔ Orchestrator
//   ├── Deepgram Live STT (streaming)
//   ├── Groq LLM (streaming)
//   └── Deepgram Flux TTS (streaming)
//
// Key design decisions:
// - LLM tokens stream directly into Flux via speak() (no AsyncQueue)
// - End-of-turn = VAD silence + STT is_final + linguistic check + 700ms escape hatch
// - Barge-in uses Flux Interrupt (not Clear) for text_spoken reconciliation
// - Reconnect/resume protocol with sequence numbers
// =============================================================================

import type WebSocket from 'ws';
import { DeepgramLiveSTT } from './deepgram-live-stt';
import { FluxTTSStream } from './flux-tts-stream';
import { GroqLLMProvider } from '../providers/llm/groq.provider';
import { getDomainPersona } from './domain-personas.config';
import { DEMO_AGENT_CONFIG } from './demo.config';
import type { DomainPersona } from './domain-personas.config';
import type { LLMMessage } from '../providers/types';

// ── Types ────────────────────────────────────────────────────────────────────

type OrchestratorState = 'idle' | 'listening' | 'processing' | 'speaking';

interface ClientMessage {
  type: 'start' | 'resume' | 'interrupt' | 'text' | 'vad_speech_start' | 'vad_speech_end' | 'end';
  domain?: string;
  sessionId?: string;
  sessionToken?: string;
  lastServerSeq?: number;
  turnId?: number;
  text?: string;
}

// Flux voice is now per-persona (persona.fluxVoice) — no hardcoded mapping needed

export class ConversationOrchestrator {
  // External connections
  private clientWs: WebSocket;
  private sttConnection: DeepgramLiveSTT | null = null;
  private ttsConnection: FluxTTSStream | null = null;
  private llm: GroqLLMProvider;

  // Session state
  private sessionId: string | null = null;
  private persona: DomainPersona | null = null;
  private conversationHistory: LLMMessage[] = [];
  private turnCount = 0;
  private seq = 0;

  // Turn management
  private activeTurnController: AbortController | null = null;
  private state: OrchestratorState = 'idle';

  // End-of-turn decision
  private utteranceBuffer = '';
  private vadSilenceDetected = false;
  private endpointWaitTimer: ReturnType<typeof setTimeout> | null = null;
  private static readonly MAX_ENDPOINT_WAIT_MS = 700;

  // Deepgram API key from env
  private deepgramApiKey: string;

  constructor(ws: WebSocket) {
    this.clientWs = ws;
    this.llm = new GroqLLMProvider();
    this.deepgramApiKey = process.env.DEEPGRAM_API_KEY || '';
  }

  // ── Message routing ──────────────────────────────────────────────────────

  async handleMessage(data: WebSocket.RawData, isBinary: boolean): Promise<void> {
    if (isBinary) {
      // Binary = PCM16 audio frame from browser → forward to STT
      this.sttConnection?.sendAudio(Buffer.from(data as ArrayBuffer));
      return;
    }

    let msg: ClientMessage;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      this.sendError('PARSE_ERROR', 'Invalid JSON message');
      return;
    }

    switch (msg.type) {
      case 'start':
        return this.startSession(msg.domain as string);
      case 'resume':
        return this.resumeSession(
          msg.sessionId as string,
          msg.sessionToken as string,
          msg.lastServerSeq ?? 0
        );
      case 'vad_speech_start':
        return this.handleSpeechStart();
      case 'vad_speech_end':
        return this.handleVADSilence();
      case 'interrupt':
        return this.handleInterrupt();
      case 'text':
        return this.processTextInput(msg.text as string);
      case 'end':
        return this.endSession();
    }
  }

  // ── Session lifecycle ────────────────────────────────────────────────────

  private async startSession(domain: string): Promise<void> {
    try {
      this.persona = getDomainPersona(domain);
      this.sessionId = `demo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      this.turnCount = 0;
      this.conversationHistory = [];

      // Initialize Deepgram Live STT
      this.sttConnection = new DeepgramLiveSTT(
        { apiKey: this.deepgramApiKey },
        {
          onPartial: (text) => {
            this.send({ type: 'transcript_partial', text });
          },
          onFinal: (text, confidence) => {
            this.handleSTTFinal(text, confidence);
          },
          onError: (err) => {
            console.error('[Orchestrator] STT error:', err.message);
            this.sendError('STT_ERROR', err.message);
          },
          onClose: () => {
            console.log('[Orchestrator] STT connection closed');
          },
        }
      );

      // Initialize Deepgram Flux TTS
      const fluxVoice = this.persona.fluxVoice || 'flux-cole-en';
      this.ttsConnection = new FluxTTSStream(
        this.deepgramApiKey,
        fluxVoice,
        {
          onAudio: (pcmChunk) => {
            // Forward audio as binary WebSocket frame to browser
            if (this.clientWs.readyState === 1) { // WebSocket.OPEN
              this.clientWs.send(pcmChunk);
            }
          },
          onInterruptReport: (report) => {
            // Reconcile conversation history with what was actually spoken
            console.log(`[Orchestrator] Interrupted. Spoken: "${report.textSpoken.slice(0, 50)}..."`);
            // Update the last assistant message to only what was spoken
            if (this.conversationHistory.length > 0) {
              const lastMsg = this.conversationHistory[this.conversationHistory.length - 1];
              if (lastMsg.role === 'assistant' && report.textSpoken) {
                lastMsg.content = report.textSpoken;
              }
            }
          },
          onSpeechStarted: () => {
            this.state = 'speaking';
          },
          onError: (err) => {
            console.error('[Orchestrator] TTS error:', err.message);
            this.sendError('TTS_ERROR', err.message);
          },
          onClose: () => {
            console.log('[Orchestrator] TTS connection closed');
          },
        },
        24000 // 24kHz TTS output for better speech quality
      );

      // Connect both in parallel
      await Promise.all([
        this.sttConnection.connect(),
        this.ttsConnection.connect(),
      ]);

      this.state = 'listening';

      // Send session created event
      this.send({
        type: 'session_created',
        sessionId: this.sessionId,
        agentName: this.persona.name,
        greeting: this.persona.greeting,
        domain: this.persona.domain,
      });

      // Generate greeting audio using Flux (text is known upfront)
      // In production we'd use Aura REST for greetings, but Flux works fine for demo
      this.ttsConnection.speak(this.persona.greeting);
      this.ttsConnection.flush();

      // Add greeting to conversation history
      this.conversationHistory.push({
        role: 'assistant',
        content: this.persona.greeting,
      });

      console.log(`[Orchestrator] Session started: ${this.sessionId} (${this.persona.name})`);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start session';
      console.error('[Orchestrator] Start session error:', message);
      this.sendError('SESSION_START_ERROR', message);
    }
  }

  private async resumeSession(
    sessionId: string,
    _token: string,
    lastSeq: number
  ): Promise<void> {
    // TODO: Implement full reconnection with DB rehydration
    // For now, acknowledge the resume attempt
    console.log(`[Orchestrator] Resume requested for ${sessionId} from seq ${lastSeq}`);
    this.seq = lastSeq + 1;
    this.send({ type: 'resumed', fromSeq: this.seq });
  }

  private async endSession(): Promise<void> {
    this.clearEndpointTimer();
    this.activeTurnController?.abort();
    this.sttConnection?.close();
    this.ttsConnection?.close();
    this.state = 'idle';

    this.send({
      type: 'session_ended',
      turnCount: this.turnCount,
    });

    console.log(`[Orchestrator] Session ended: ${this.sessionId} (${this.turnCount} turns)`);
  }

  /**
   * Clean up on WebSocket disconnect. Session state survives in DB.
   */
  handleDisconnect(): void {
    this.clearEndpointTimer();
    this.activeTurnController?.abort();
    this.sttConnection?.close();
    this.ttsConnection?.close();
    console.log(`[Orchestrator] Client disconnected (session: ${this.sessionId})`);
  }

  // ── Speech detection (from browser VAD) ──────────────────────────────────

  private handleSpeechStart(): void {
    // User started speaking — if agent is currently speaking, interrupt
    if (this.state === 'speaking' || this.state === 'processing') {
      this.handleInterrupt();
    }
  }

  // ── End-of-turn decision ─────────────────────────────────────────────────

  private handleSTTFinal(text: string, _confidence: number): void {
    this.utteranceBuffer += (this.utteranceBuffer ? ' ' : '') + text;

    // Forward to browser for live transcript
    this.send({ type: 'transcript_final', text: this.utteranceBuffer });

    // Check: should we trigger the LLM?
    if (this.vadSilenceDetected && this.isLinguisticallyComplete(this.utteranceBuffer)) {
      this.clearEndpointTimer();
      this.triggerLLMTurn(this.utteranceBuffer);
      this.utteranceBuffer = '';
      this.vadSilenceDetected = false;
    }
  }

  private handleVADSilence(): void {
    this.vadSilenceDetected = true;

    // If STT has already given us a final, check immediately
    if (this.utteranceBuffer && this.isLinguisticallyComplete(this.utteranceBuffer)) {
      this.clearEndpointTimer();
      this.triggerLLMTurn(this.utteranceBuffer);
      this.utteranceBuffer = '';
      this.vadSilenceDetected = false;
      return;
    }

    // ESCAPE HATCH: Force trigger after MAX_ENDPOINT_WAIT
    this.clearEndpointTimer();
    this.endpointWaitTimer = setTimeout(() => {
      if (this.utteranceBuffer.trim() && this.vadSilenceDetected) {
        this.triggerLLMTurn(this.utteranceBuffer);
        this.utteranceBuffer = '';
        this.vadSilenceDetected = false;
      }
    }, ConversationOrchestrator.MAX_ENDPOINT_WAIT_MS);
  }

  private clearEndpointTimer(): void {
    if (this.endpointWaitTimer) {
      clearTimeout(this.endpointWaitTimer);
      this.endpointWaitTimer = null;
    }
  }

  private isLinguisticallyComplete(text: string): boolean {
    const trimmed = text.trim();
    if (/[.!?]$/.test(trimmed)) return true;
    if (
      trimmed.length > 15 &&
      /\b(please|thanks|okay|right|yes|no|sure|help|today|now)\s*[.?!]?\s*$/i.test(trimmed)
    ) {
      return true;
    }
    return false;
  }

  // ── Core pipeline: LLM → Flux TTS ───────────────────────────────────────

  private async triggerLLMTurn(userText: string): Promise<void> {
    if (!this.persona) return;

    this.state = 'processing';
    this.turnCount++;
    const turnStart = Date.now();
    const controller = new AbortController();
    this.activeTurnController = controller;

    // Store user message
    this.conversationHistory.push({ role: 'user', content: userText });

    // Assemble prompt with system prompt + conversation history
    const messages: LLMMessage[] = [
      { role: 'system', content: this.persona.systemPrompt },
      ...this.conversationHistory.slice(-DEMO_AGENT_CONFIG.constraints.maxContextMessages),
    ];

    this.send({ type: 'thinking', status: 'llm' });

    try {
      await this.runLLM(messages, controller.signal);

      if (!controller.signal.aborted) {
        const processingMs = Date.now() - turnStart;
        this.state = 'listening';
        this.send({
          type: 'turn_complete',
          turnCount: this.turnCount,
          processingMs,
        });
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        const message = err instanceof Error ? err.message : 'LLM error';
        console.error('[Orchestrator] LLM turn error:', message);
        this.sendError('LLM_ERROR', message);
        this.state = 'listening';
      }
    }

    this.activeTurnController = null;
  }

  /**
   * Stream LLM tokens directly into Flux TTS.
   * No intermediate queue — Flux IS the consumer.
   */
  private async runLLM(
    messages: LLMMessage[],
    signal: AbortSignal
  ): Promise<void> {
    let buffer = '';
    let fullResponse = '';

    for await (const chunk of this.llm.stream(messages, {
      model: DEMO_AGENT_CONFIG.llm.model,
      temperature: DEMO_AGENT_CONFIG.llm.temperature,
      maxTokens: DEMO_AGENT_CONFIG.llm.maxTokens,
    })) {
      if (signal.aborted) break;

      buffer += chunk.text;
      fullResponse += chunk.text;

      // Send token to browser for live text display
      this.send({ type: 'llm_token', token: chunk.text, accumulated: fullResponse });

      // Stream text into Flux progressively.
      // ~20 chars backpressure buffer. Flux handles speech segmentation internally.
      if (buffer.length >= 20 || /[.!?;:,\u2014]\s*$/.test(buffer)) {
        this.ttsConnection?.speak(buffer);
        buffer = '';
      }
    }

    // Flush remaining buffer to Flux
    if (buffer.trim() && !signal.aborted) {
      this.ttsConnection?.speak(buffer.trim());
    }

    // Signal Flux that this turn's text is complete
    if (!signal.aborted) {
      this.ttsConnection?.flush();
    }

    // Store agent response in conversation history
    if (fullResponse.trim()) {
      this.conversationHistory.push({ role: 'assistant', content: fullResponse });
    }
  }

  // ── Text mode input ──────────────────────────────────────────────────────

  private async processTextInput(text: string): Promise<void> {
    if (!text?.trim()) return;
    this.send({ type: 'transcript_final', text });
    await this.triggerLLMTurn(text.trim());
  }

  // ── Interruption ─────────────────────────────────────────────────────────

  private handleInterrupt(): void {
    if (this.state !== 'speaking' && this.state !== 'processing') return;

    // 1. Abort LLM generation
    this.activeTurnController?.abort();

    // 2. Interrupt Flux TTS (NOT clear) — triggers text_spoken/text_remaining
    this.ttsConnection?.interrupt();

    // 3. Tell browser to stop playback and flush audio queue
    this.send({ type: 'interrupted' });

    this.state = 'listening';
    this.activeTurnController = null;
  }

  // ── Messaging ────────────────────────────────────────────────────────────

  private send(msg: Record<string, unknown>): void {
    if (this.clientWs.readyState !== 1) return; // WebSocket.OPEN
    msg.seq = this.seq++;
    this.clientWs.send(JSON.stringify(msg));
  }

  private sendError(code: string, message: string): void {
    this.send({ type: 'error', code, message });
  }
}
