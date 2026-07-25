'use client';

import { useAuth } from '@/providers/AuthProvider';
import { hasPermission } from '@/types/auth';
import type { UserRole } from '@/types/supabase';

export function usePermissions() {
  const { role, isLoading, organization, profile } = useAuth();

  const checkPermission = (permission: string): boolean => {
    if (!role) return false;
    return hasPermission(role, permission);
  };

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!role) return false;
    return allowedRoles.includes(role);
  };

  return {
    role,
    organization,
    profile,
    isLoading,
    hasPermission: checkPermission,
    hasRole,
  };
}
