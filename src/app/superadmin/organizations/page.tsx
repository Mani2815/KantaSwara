import React from 'react';
import { supabaseAdmin } from '@server/lib/supabase/admin';
import { Search, Filter, Building2, Plus, Users, Mail } from 'lucide-react';
import Link from 'next/link';
import DeleteOrganizationButton from './DeleteOrganizationButton';
import ReviewModal from './ReviewModal';

export const metadata = {
  title: 'Organizations — Super Admin',
};

async function getOrganizations(statusFilter: string) {
  let query = supabaseAdmin
    .from('organizations')
    .select(`
      id, 
      name, 
      slug, 
      plan, 
      is_active, 
      status,
      approval_status,
      created_at,
      settings,
      profiles (id, full_name, email, role)
    `)
    .order('created_at', { ascending: false });

  if (statusFilter !== 'all') {
    if (statusFilter === 'pending') {
      query = query.eq('status', 'pending_approval');
    } else {
      query = query.eq('status', statusFilter);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching organizations:', error);
    return [];
  }

  return data;
}

const PLAN_BADGE: Record<string, string> = {
  free:       'bg-neutral-500/10 text-[var(--color-text-secondary)] border-neutral-500/20',
  pro:        'bg-blue-500/10 text-blue-400 border-blue-500/20',
  enterprise: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

export default async function OrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const resolvedParams = await searchParams;
  const currentTab = resolvedParams.status || 'all';
  const organizations = await getOrganizations(currentTab);

  const tabs = [
    { id: 'all', label: 'All Organizations' },
    { id: 'pending', label: 'Pending Approval' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
    { id: 'suspended', label: 'Suspended' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Organization Management</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Review, approve, and manage tenant workspaces on the KantaSwara platform.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bg-subtle)] border border-[var(--color-border-default)] text-sm font-medium text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-border-default)] transition-colors">
            <Filter size={16} className="text-[var(--color-text-secondary)]" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-[var(--color-text-primary)] text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20">
            <Plus size={16} />
            New Organization
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--color-border-default)]">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={`/superadmin/organizations?status=${tab.id}`}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${currentTab === tab.id
                  ? 'border-orange-500 text-orange-500'
                  : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-default)]'
                }
              `}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Toolbar */}
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-t-xl p-4 flex items-center justify-between mt-6">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16} />
          <input 
            type="text" 
            placeholder="Search by organization name or contact..." 
            className="w-full bg-[var(--color-bg-subtle)] border border-[var(--color-border-default)] rounded-lg pl-9 pr-4 py-2 text-sm text-[var(--color-text-primary)] placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>
        <div className="text-sm text-[var(--color-text-secondary)]">
          Showing {organizations.length} organizations
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[var(--color-bg-surface)] border-x border-b border-[var(--color-border-default)] rounded-b-xl overflow-x-auto -mt-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Organization</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Registered</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2738]">
            {organizations.map((org: any) => {
              const adminProfile = org.profiles?.find((p: any) => p.role === 'org_admin') || org.profiles?.[0];
              
              return (
                <tr key={org.id} className="hover:bg-[var(--color-bg-subtle)] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                        <Building2 className="text-indigo-400" size={18} />
                      </div>
                      <div>
                        <div className="font-medium text-[var(--color-text-primary)] text-sm">{org.name}</div>
                        <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{org.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {adminProfile ? (
                      <div className="text-sm">
                        <div className="text-[var(--color-text-primary)]">{adminProfile.full_name}</div>
                        <div className="text-[var(--color-text-secondary)] flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3 h-3" />
                          {adminProfile.email}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--color-text-muted)] italic">No users yet</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      org.status === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : org.status === 'pending_approval'
                        ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        org.status === 'approved' ? 'bg-emerald-400' 
                        : org.status === 'pending_approval' ? 'bg-yellow-400' 
                        : 'bg-red-400'
                      }`}></span>
                      {org.status === 'pending_approval' ? 'Pending Approval' : org.status.charAt(0).toUpperCase() + org.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                    {new Date(org.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    {org.status === 'pending_approval' ? (
                      <ReviewModal organization={org} />
                    ) : (
                      <div className="flex justify-end">
                        <DeleteOrganizationButton organizationId={org.id} organizationName={org.name} />
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            
            {organizations.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-[var(--color-text-muted)] text-sm">
                  No {currentTab !== 'all' ? currentTab : ''} organizations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
