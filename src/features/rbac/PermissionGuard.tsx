'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { hasPermission } from '@/types/auth';

interface PermissionGuardProps {
  children: ReactNode;
  permission: string;
  fallback?: ReactNode;
}

export function PermissionGuard({ children, permission, fallback = null }: PermissionGuardProps) {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!role || !hasPermission(role, permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
