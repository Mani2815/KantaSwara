/**
 * Auth types for KantaSwara
 *
 * These supplement the Supabase Database types with application-level
 * domain types for auth, profiles, and organizations.
 */

import type { User } from '@supabase/supabase-js';
import type { UserRole } from '@/types/supabase';

/** Supabase auth user — re-exported for convenience */
export type { User as AuthUser };

/** Full user profile from the `profiles` table */
export interface UserProfile {
  id: string;
  organization_id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: UserRole;
  phone: string | null;
  is_active: boolean;
  last_seen_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Organization from the `organizations` table */
export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  plan: string;
  max_agents: number;
  max_concurrent_calls: number;
  settings: Record<string, unknown>;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Registration payload (sent to backend /auth/register) */
export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  organization_name: string;
  phone?: string;
}

/** Login payload */
export interface LoginPayload {
  email: string;
  password: string;
}

/** Forgot password payload */
export interface ForgotPasswordPayload {
  email: string;
}

/** Reset password payload */
export interface ResetPasswordPayload {
  password: string;
  confirm_password: string;
}

/** Auth API response */
export interface AuthResponse {
  user: AuthUserResponse;
  profile: UserProfile;
  organization: Organization;
  access_token: string;
  refresh_token: string;
}

export interface AuthUserResponse {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  created_at: string;
}

/** Session info */
export interface SessionInfo {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
  token_type: string;
  user: User;
}

/** Role permissions matrix */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: ['*'],
  org_admin: [
    'org:read',
    'org:write',
    'agents:*',
    'workflows:*',
    'knowledge:*',
    'leads:*',
    'analytics:read',
    'calls:read',
    'settings:*',
  ],
  manager: [
    'org:read',
    'agents:read',
    'agents:write',
    'workflows:read',
    'knowledge:*',
    'leads:*',
    'analytics:read',
    'calls:read',
  ],
  agent: [
    'org:read',
    'agents:read',
    'calls:read',
    'knowledge:read',
    'leads:read',
  ],
  viewer: ['org:read', 'agents:read', 'calls:read', 'analytics:read'],
  solutions_admin: ['org:read', 'agents:read', 'calls:read', 'analytics:read', 'org:update', 'agents:write'], // Adding solutions admin
};

/** Check if a role has a specific permission */
export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return (
    permissions.includes('*') ||
    permissions.includes(permission) ||
    permissions.some((p) => {
      if (p.endsWith(':*')) {
        const prefix = p.slice(0, -2);
        return permission.startsWith(prefix + ':');
      }
      return false;
    })
  );
}
