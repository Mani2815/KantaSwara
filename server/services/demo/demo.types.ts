// =============================================================================
// Demo Service Types
// =============================================================================

import type { DemoDomain } from './domain-personas.config';

export interface DemoSession {
  id: string;
  sessionToken: string;
  ipAddress: string;
  userAgent: string | null;
  status: DemoSessionStatus;
  startedAt: Date;
  endedAt: Date | null;
  durationSeconds: number;
  turnCount: number;
  summary: string | null;
  sentiment: string | null;
  metadata: Record<string, unknown>;
}

export type DemoSessionStatus = 'active' | 'completed' | 'expired' | 'error';

export interface DemoMessage {
  id: string;
  sessionId: string;
  speaker: 'user' | 'agent';
  text: string;
  audioUrl: string | null;
  durationMs: number;
  confidence: number | null;
  processingMs: number | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

// ── API Request/Response Types ──────────────────────────────────────────────

export interface StartDemoRequest {
  /** Optional: user's name for personalization */
  userName?: string;
  /** Required: selected business domain */
  domain: DemoDomain;
}

export interface StartDemoResponse {
  sessionId: string;
  sessionToken: string;
  greeting: string;
  greetingAudio?: string; // base64 audio
  agentName: string;
  domain: DemoDomain;
  maxDurationSec: number;
}

export interface DemoMessageRequest {
  sessionToken: string;
  /** Text input from user (used in text-only mode) */
  text?: string;
  /** Base64-encoded audio from user microphone */
  audio?: string;
  /** MIME type of audio (e.g. 'audio/webm;codecs=opus') */
  audioMimeType?: string;
}

export interface DemoMessageResponse {
  messageId: string;
  /** Agent's text response */
  text: string;
  /** Base64-encoded audio response */
  audio?: string;
  /** MIME type of audio response */
  audioMimeType?: string;
  /** Processing latency in ms */
  processingMs: number;
  /** Number of turns so far */
  turnCount: number;
  /** Whether session should end (max turns or duration reached) */
  shouldEnd: boolean;
  /** Reason for ending, if shouldEnd is true */
  endReason?: string;
}

export interface EndDemoRequest {
  sessionToken: string;
}

export interface EndDemoResponse {
  summary: string;
  durationSeconds: number;
  turnCount: number;
  transcript: Array<{
    speaker: 'user' | 'agent';
    text: string;
    timestamp: string;
  }>;
}

export interface DemoFeedbackRequest {
  sessionToken: string;
  rating: 1 | 2 | 3 | 4 | 5;
  feedback?: string;
}

// ── SSE Event Types ─────────────────────────────────────────────────────────

export type DemoSSEEventType =
  | 'transcript'
  | 'audio'
  | 'thinking'
  | 'error'
  | 'done'
  | 'heartbeat';

export interface DemoSSEEvent {
  type: DemoSSEEventType;
  data: unknown;
}

export interface TranscriptEvent {
  speaker: 'user' | 'agent';
  text: string;
  /** True if this is a partial/interim transcript */
  partial: boolean;
  timestamp: string;
}

export interface AudioEvent {
  /** Base64-encoded audio chunk */
  audio: string;
  /** MIME type */
  mimeType: string;
  /** Whether this is the last chunk */
  final: boolean;
}

export interface ThinkingEvent {
  status: 'processing' | 'generating' | 'synthesizing';
}

export interface ErrorEvent {
  code: string;
  message: string;
}
