/**
 * Permission constants for RBAC-aware UI rendering.
 */
export const PERMISSIONS = {
  /* Agents */
  AGENTS_VIEW: 'agents:view',
  AGENTS_CREATE: 'agents:create',
  AGENTS_EDIT: 'agents:edit',
  AGENTS_DELETE: 'agents:delete',
  AGENTS_DEPLOY: 'agents:deploy',

  /* Workflows */
  WORKFLOWS_VIEW: 'workflows:view',
  WORKFLOWS_CREATE: 'workflows:create',
  WORKFLOWS_EDIT: 'workflows:edit',
  WORKFLOWS_DELETE: 'workflows:delete',
  WORKFLOWS_PUBLISH: 'workflows:publish',

  /* Calls */
  CALLS_VIEW: 'calls:view',
  CALLS_MONITOR: 'calls:monitor',
  CALLS_INTERVENE: 'calls:intervene',

  /* Knowledge Base */
  KNOWLEDGE_VIEW: 'knowledge:view',
  KNOWLEDGE_MANAGE: 'knowledge:manage',

  /* Leads */
  LEADS_VIEW: 'leads:view',
  LEADS_MANAGE: 'leads:manage',
  LEADS_EXPORT: 'leads:export',

  /* Analytics */
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_EXPORT: 'analytics:export',

  /* Settings */
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_MANAGE: 'settings:manage',
  USERS_MANAGE: 'users:manage',
  ROLES_MANAGE: 'roles:manage',
  API_KEYS_MANAGE: 'api_keys:manage',
  BILLING_MANAGE: 'billing:manage',

  /* Tenant Admin */
  TENANT_MANAGE: 'tenant:manage',
  TENANT_SWITCH: 'tenant:switch',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Role definitions with associated permission sets */
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  AGENT_OPERATOR: 'agent_operator',
  VIEWER: 'viewer',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
