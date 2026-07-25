import type { AgentStatus } from '@/constants/status';

/** Voice provider configuration */
export interface VoiceConfig {
  provider: 'elevenlabs' | 'deepgram' | 'openai' | 'custom';
  voiceId: string;
  voiceName: string;
  language: string;
  speed: number;
  pitch: number;
}

/** Agent entity */
export interface Agent {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  tenantId: string;
  workflowId: string | null;
  knowledgeBaseIds: string[];
  voiceConfig: VoiceConfig;
  greeting: string;
  systemPrompt: string;
  activeCalls: number;
  totalCalls: number;
  avgCallDuration: number;
  successRate: number;
  createdAt: string;
  updatedAt: string;
  deployedAt: string | null;
}

/** Agent list item (lightweight) */
export interface AgentListItem {
  id: string;
  name: string;
  status: AgentStatus;
  activeCalls: number;
  totalCalls: number;
  successRate: number;
  workflowName: string | null;
  updatedAt: string;
}

/** Agent creation/update payload */
export interface AgentPayload {
  name: string;
  description: string;
  workflowId?: string;
  knowledgeBaseIds?: string[];
  voiceConfig: VoiceConfig;
  greeting: string;
  systemPrompt: string;
}
