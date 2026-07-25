import React from 'react';
import { supabaseAdmin } from '@server/lib/supabase/admin';
import { Search, Filter, MoreVertical, User, ShieldAlert, Key } from 'lucide-react';
import Link from 'next/link';
import DeleteUserButton from './DeleteUserButton';

export const metadata = {
  title: 'Users — Super Admin',
};

async function getUsers() {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select(`
      id, 
      full_name, 
      email, 
      role, 
      is_active, 
      created_at,
      organization_id,
      organizations (name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return data;
}

const ROLE_BADGE: Record<string, string> = {
  super_admin: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  org_admin:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  manager:     'bg-purple-500/10 text-purple-400 border-purple-500/20',
  agent:       'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  viewer:      'bg-neutral-500/10 text-[var(--color-text-secondary)] border-neutral-500/20',
};

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Global User Directory</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Manage all authenticated users across the platform.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bg-subtle)] border border-[var(--color-border-default)] text-sm font-medium text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-border-default)] transition-colors">
            <Filter size={16} className="text-[var(--color-text-secondary)]" />
            Filter
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-t-xl p-4 flex items-center justify-between">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="w-full bg-[var(--color-bg-subtle)] border border-[var(--color-border-default)] rounded-lg pl-9 pr-4 py-2 text-sm text-[var(--color-text-primary)] placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>
        <div className="text-sm text-[var(--color-text-secondary)]">
          Showing {users.length} users
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[var(--color-bg-surface)] border-x border-b border-[var(--color-border-default)] rounded-b-xl overflow-x-auto -mt-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Organization</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Auth / MFA</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2738]">
            {users.map((user: any) => (
              <tr key={user.id} className="hover:bg-[var(--color-bg-subtle)] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neutral-600 to-neutral-800 flex items-center justify-center flex-shrink-0 text-[var(--color-text-primary)] text-xs font-bold ring-2 ring-[#1E2738]">
                      {user.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <div className="font-medium text-[var(--color-text-primary)] text-sm">{user.full_name}</div>
                      <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] border px-2 py-0.5 rounded-full capitalize font-medium uppercase tracking-wider ${ROLE_BADGE[user.role] ?? ROLE_BADGE.viewer}`}>
                    {user.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-[var(--color-text-primary)]">
                  {user.organizations?.name || <span className="text-[var(--color-text-muted)] italic">None</span>}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    user.is_active 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                    {user.is_active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Key size={14} className="text-[var(--color-text-muted)]" />
                    <span className="text-xs text-[var(--color-text-secondary)]">Email</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <DeleteUserButton userId={user.id} userName={user.full_name || user.email} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
