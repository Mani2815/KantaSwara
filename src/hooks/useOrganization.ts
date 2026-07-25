'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/providers/SupabaseProvider';
import { useAuth } from './useAuth';
import type { Organization } from '@/types/auth';
import type { Database } from '@/types/supabase';

interface UseOrganizationReturn {
  organization: Organization | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateOrganization: (
    updates: Partial<Pick<Organization, 'name' | 'logo_url' | 'settings'>>
  ) => Promise<void>;
}

/**
 * Hook to fetch and manage the current organization.
 * Uses the organization_id from the user's profile.
 */
export function useOrganization(): UseOrganizationReturn {
  const { supabase } = useSupabase();
  const { profile } = useAuth();

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganization = useCallback(async () => {
    if (!profile?.organization_id) {
      setOrganization(null);
      setIsLoading(false);
      return;
    }

    await Promise.resolve(); // Yield to avoid cascading updates
    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', profile.organization_id)
      .single();

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setOrganization(data as Organization);
    }
    setIsLoading(false);
  }, [supabase, profile?.organization_id]);

  useEffect(() => {
    fetchOrganization();
  }, [fetchOrganization]);

  const updateOrganization = useCallback(
    async (
      updates: Partial<Pick<Organization, 'name' | 'logo_url' | 'settings'>>
    ) => {
      if (!organization?.id) return;

      // Optimistic update
      setOrganization((prev) => (prev ? { ...prev, ...updates } : prev));

      const { error: updateError } = await supabase
        .from('organizations')
        // @ts-ignore - Supabase types are overly strict with partial generic updates
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', organization.id);

      if (updateError) {
        setError(updateError.message);
        await fetchOrganization();
      }
    },
    [supabase, organization, fetchOrganization]
  );

  return {
    organization,
    isLoading,
    error,
    refetch: fetchOrganization,
    updateOrganization,
  };
}
