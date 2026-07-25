import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserRole } from '@/types/supabase';
import type { AuthUser, UserProfile, Organization } from '@/types/auth';

interface AuthState {
  /** Raw Supabase auth user */
  user: AuthUser | null;
  /** Full user profile */
  profile: UserProfile | null;
  /** Current organization */
  organization: Organization | null;
  /** Role shortcut */
  role: UserRole | null;

  // ── Actions ───────────────────────────────────────────────────────────────
  setAuth: (payload: {
    user: AuthUser;
    profile: UserProfile;
    organization: Organization;
  }) => void;
  setProfile: (profile: UserProfile) => void;
  setOrganization: (organization: Organization) => void;
  clearAuth: () => void;
}

/**
 * Auth Zustand store.
 *
 * Provides in-memory + sessionStorage persistence of the current user's
 * auth state. Primary source of truth is Supabase; this store is a
 * reactive cache layer for components that need sync access.
 *
 * Note: Never store sensitive tokens here — they live in Supabase's
 * httpOnly cookie layer.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      organization: null,
      role: null,

      setAuth: ({ user, profile, organization }) =>
        set({
          user,
          profile,
          organization,
          role: profile.role,
        }),

      setProfile: (profile) =>
        set({ profile, role: profile.role }),

      setOrganization: (organization) =>
        set({ organization }),

      clearAuth: () =>
        set({
          user: null,
          profile: null,
          organization: null,
          role: null,
        }),
    }),
    {
      name: 'ks-auth',
      storage: createJSONStorage(() => sessionStorage),
      // Only persist non-sensitive fields
      partialize: (state) => ({
        profile: state.profile,
        organization: state.organization,
        role: state.role,
      }),
    }
  )
);

// ── Selectors ────────────────────────────────────────────────────────────────

export const selectIsAuthenticated = (s: AuthState) => !!s.user;
export const selectIsSuperAdmin = (s: AuthState) => s.role === 'super_admin';
export const selectIsOrgAdmin = (s: AuthState) =>
  s.role === 'super_admin' || s.role === 'org_admin';
export const selectOrgId = (s: AuthState) => s.profile?.organization_id ?? null;
