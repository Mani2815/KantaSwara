/**
 * Status value constants used across the application.
 * These enforce consistent terminology per frontend-skill.md §16.3.
 */

/* Call statuses */
export const CALL_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  FAILED: 'failed',
  QUEUED: 'queued',
  VOICEMAIL: 'voicemail',
  TRANSFERRED: 'transferred',
  NO_ANSWER: 'no_answer',
} as const;

export type CallStatus = (typeof CALL_STATUS)[keyof typeof CALL_STATUS];

/* Agent statuses */
export const AGENT_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  BUSY: 'busy',
  ERROR: 'error',
  DEPLOYING: 'deploying',
} as const;

export type AgentStatus = (typeof AGENT_STATUS)[keyof typeof AGENT_STATUS];

/* Workflow statuses */
export const WORKFLOW_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
  ERROR: 'error',
} as const;

export type WorkflowStatus = (typeof WORKFLOW_STATUS)[keyof typeof WORKFLOW_STATUS];

/* Lead statuses */
export const LEAD_STATUS = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  UNQUALIFIED: 'unqualified',
  CONVERTED: 'converted',
  LOST: 'lost',
} as const;

export type LeadStatus = (typeof LEAD_STATUS)[keyof typeof LEAD_STATUS];

/* Workflow node types */
export const NODE_TYPE = {
  TRIGGER: 'trigger',
  SAY: 'say',
  LISTEN: 'listen',
  CONDITION: 'condition',
  API_CALL: 'api_call',
  TRANSFER: 'transfer',
  SET_VARIABLE: 'set_variable',
  END: 'end',
  WAIT: 'wait',
  KNOWLEDGE: 'knowledge',
  SMS_EMAIL: 'sms_email',
  CRM_UPDATE: 'crm_update',
} as const;

export type NodeType = (typeof NODE_TYPE)[keyof typeof NODE_TYPE];
