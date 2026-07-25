/**
 * Application route constants.
 * All route paths are defined here for consistency.
 */
export const ROUTES = {
  /* Marketing */
  HOME: '/',
  PRICING: '/pricing',

  /* Auth */
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  /* Platform */
  DASHBOARD: '/dashboard',

  AGENT_REQUESTS: '/requests',
  AGENT_REQUEST_NEW: '/requests/new',

  AGENTS: '/agents',
  AGENT_DETAIL: (id: string) => `/agents/${id}` as const,

  CALLS: '/calls',
  CALL_DETAIL: (id: string) => `/calls/${id}` as const,

  KNOWLEDGE: '/knowledge',
  LEADS: '/leads',
  ANALYTICS: '/analytics',

  /* Settings */
  SETTINGS: '/settings',
  SETTINGS_USERS: '/settings/users',
  SETTINGS_ROLES: '/settings/roles',
  SETTINGS_API_KEYS: '/settings/api-keys',
  SETTINGS_BILLING: '/settings/billing',

  /* Organization */
  ORGANIZATION: '/organization',
} as const;
