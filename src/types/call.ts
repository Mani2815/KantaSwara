import type { CallStatus } from '@/constants/status';

/** Transcript turn */
export interface TranscriptTurn {
  id: string;
  speaker: 'agent' | 'user';
  text: string;
  timestamp: string;
  durationMs: number;
  confidence: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  intent?: string;
  isOffScript?: boolean;
}

/** Call record */
export interface CallRecord {
  id: string;
  agentId: string;
  agentName: string;
  tenantId: string;
  status: CallStatus;
  direction: 'inbound' | 'outbound';
  callerNumber: string;
  callerName: string | null;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number;
  transcript: TranscriptTurn[];
  currentNodeId: string | null;
  currentIntent: string | null;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  outcome: string | null;
  recordingUrl: string | null;
  metadata: Record<string, unknown>;
}

/** Call list item (lightweight) */
export interface CallListItem {
  id: string;
  agentName: string;
  status: CallStatus;
  direction: 'inbound' | 'outbound';
  callerNumber: string;
  callerName: string | null;
  durationSeconds: number;
  startedAt: string;
  outcome: string | null;
}

/** Live call data (real-time updates) */
export interface LiveCallData {
  callId: string;
  agentId: string;
  agentName: string;
  status: 'active';
  callerNumber: string;
  callerName: string | null;
  direction: 'inbound' | 'outbound';
  startedAt: string;
  durationSeconds: number;
  currentSpeaker: 'agent' | 'user' | 'silence';
  currentTranscript: string;
  currentNodeId: string;
  currentNodeName: string;
  currentIntent: string | null;
  sentiment: 'positive' | 'neutral' | 'negative';
  transcript: TranscriptTurn[];
}
