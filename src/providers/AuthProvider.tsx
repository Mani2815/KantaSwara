'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from './SupabaseProvider';
import type { UserRole } from '@/types/supabase';
import type { AuthUser, UserProfile, Organization } from '@/types/auth';

interface AuthContextValue {
  /** Raw Supabase auth user */
  user: AuthUser | null;
  /** Full profile from `profiles` table */
  profile: UserProfile | null;
  /** Current organization */
  organization: Organization | null;
  /** Shortcut to the user's role */
  role: UserRole | null;
  /** True while initial auth state is being determined */
  isLoading: boolean;
  /** True if the user is authenticated */
  isAuthenticated: boolean;
  /** Sign the user out and redirect to /login */
  signOut: () => Promise<void>;
  /** Refresh profile from DB (call after profile updates) */
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * AuthProvider — sits above all platform pages.
 * Fetches the user's profile and organization from Supabase
 * and exposes them via useAuth().
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { supabase, user: rawUser, isLoading: authLoading } = useSupabase();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchProfileAndOrg = useCallback(
    async (id: string) => {
      await Promise.resolve();
      setProfileLoading(true);
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (profileError || !profileData) return;
        setProfile(profileData as UserProfile);

        if (!profileData.organization_id) return;

        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profileData.organization_id)
          .single();

        if (!orgError && orgData) {
          setOrganization(orgData as Organization);
        }
      } finally {
        setProfileLoading(false);
      }
    },
    [supabase]
  );

  const refreshProfile = useCallback(async () => {
    if (rawUser?.id) {
      await fetchProfileAndOrg(rawUser.id);
    }
  }, [rawUser, fetchProfileAndOrg]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!rawUser) {
        setProfile(null);
        setOrganization(null);
        return;
      }
      setProfileLoading(true);
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', rawUser.id)
          .single();

        if (!ignore) {
          if (profileError || !profileData) return;
          setProfile(profileData as UserProfile);

          if (profileData.organization_id) {
            const { data: orgData, error: orgError } = await supabase
              .from('organizations')
              .select('*')
              .eq('id', profileData.organization_id)
              .single();

            if (!orgError && orgData) {
              setOrganization(orgData as Organization);
            }
          }
        }
      } finally {
        if (!ignore) setProfileLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [rawUser, supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setOrganization(null);
    router.push('/login');
  }, [supabase, router]);

  const isLoading = authLoading || profileLoading;

  const value: AuthContextValue = {
    user: rawUser as AuthUser | null,
    profile,
    organization,
    role: profile?.role ?? null,
    isLoading,
    isAuthenticated: !!rawUser,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }
  return context;
}
