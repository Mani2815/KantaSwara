'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/providers/SupabaseProvider';
import type { UserProfile } from '@/types/auth';
import type { Database } from '@/types/supabase';

interface UseProfileReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<UserProfile, 'full_name' | 'phone' | 'avatar_url'>>) => Promise<void>;
}

/**
 * Hook to fetch and manage the current user's profile.
 * Provides optimistic update capability and error handling.
 */
export function useProfile(userId?: string): UseProfileReturn {
  const { supabase, user } = useSupabase();
  const targetId = userId ?? user?.id;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!targetId) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    await Promise.resolve();
    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetId)
      .single();

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setProfile(data as UserProfile);
    }
    setIsLoading(false);
  }, [supabase, targetId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(
    async (updates: Partial<Pick<UserProfile, 'full_name' | 'phone' | 'avatar_url'>>) => {
      if (!targetId) return;

      // Optimistic update
      setProfile((prev) => (prev ? { ...prev, ...updates } : prev));

      const { error: updateError } = await supabase
        .from('profiles')
        // @ts-ignore - Supabase types are overly strict with partial generic updates
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', targetId);

      if (updateError) {
        // Revert on error
        setError(updateError.message);
        await fetchProfile();
      }
    },
    [supabase, targetId, fetchProfile]
  );

  return { profile, isLoading, error, refetch: fetchProfile, updateProfile };
}
