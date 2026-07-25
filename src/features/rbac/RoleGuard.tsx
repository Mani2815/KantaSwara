'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import type { UserRole } from '@/types/supabase';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a skeleton/spinner if needed
  }

  if (!role || !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
