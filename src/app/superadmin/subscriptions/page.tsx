import React from 'react';
import { Search, Filter, MoreVertical, CreditCard, AlertCircle, TrendingUp, Building2 } from 'lucide-react';
import { prisma } from '@server/lib/prisma';

export const metadata = {
  title: 'Subscriptions — Super Admin',
};

// Next.js caches this in production if not dynamic, we force dynamic for superadmin panels
export const dynamic = 'force-dynamic';

async function getSubscriptions() {
  const subscriptions = await prisma.organizationSubscription.findMany({
    include: {
      organization: true,
      plan: true,
    },
    orderBy: {
      createdAt: 'desc',
    }
  });
  return subscriptions;
}

const PLAN_BADGE: Record<string, string> = {
  Free: 'bg-neutral-500/10 text-[var(--color-text-secondary)] border-neutral-500/20',
  Pro: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Enterprise: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

export default async function SubscriptionsPage() {
  const subscriptions = await getSubscriptions();
  
  // Calculate stats
  const totalMrr = subscriptions.reduce((sum, sub) => sum + (Number(sub.plan?.priceMonthly) || 0), 0);
  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  const pastDueCount = subscriptions.filter(s => s.status === 'past_due').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Subscriptions & Billing</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Manage tenant plans, billing status, and platform revenue.
          </p>
        </div>
      </div>

      {/* Revenue KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">Total MRR</h3>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-[var(--color-text-primary)]">${totalMrr.toLocaleString()}</p>
        </div>
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">Active Subscriptions</h3>
            <CreditCard size={16} className="text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-[var(--color-text-primary)]">{activeCount}</p>
        </div>
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">Past Due</h3>
            <AlertCircle size={16} className="text-red-500" />
          </div>
          <p className="text-3xl font-bold text-[var(--color-text-primary)]">{pastDueCount}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-t-xl p-4 flex items-center justify-between mt-8">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16} />
          <input 
            type="text" 
            placeholder="Search subscriptions by organization..." 
            className="w-full bg-[var(--color-bg-subtle)] border border-[var(--color-border-default)] rounded-lg pl-9 pr-4 py-2 text-sm text-[var(--color-text-primary)] placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bg-subtle)] border border-[var(--color-border-default)] text-sm font-medium text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-border-default)] transition-colors">
          <Filter size={16} className="text-[var(--color-text-secondary)]" />
          Filter
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-[var(--color-bg-surface)] border-x border-b border-[var(--color-border-default)] rounded-b-xl overflow-x-auto -mt-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Organization</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Plan</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">MRR</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Next Renewal</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2738]">
            {subscriptions.map((sub: any) => (
              <tr key={sub.id} className="hover:bg-[var(--color-bg-subtle)] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-neutral-500/10 border border-neutral-500/20 flex items-center justify-center flex-shrink-0">
                      <Building2 className="text-neutral-400" size={14} />
                    </div>
                    <div>
                      <div className="font-medium text-[var(--color-text-primary)] text-sm">{sub.organization?.name}</div>
                      <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{sub.organization?.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs border px-2.5 py-1 rounded-full capitalize font-medium ${PLAN_BADGE[sub.plan?.name] ?? PLAN_BADGE.Free}`}>
                    {sub.plan?.name ?? 'Unknown'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-[var(--color-text-primary)] font-medium">
                  ${Number(sub.plan?.priceMonthly).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    sub.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sub.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                    {sub.status === 'active' ? 'Active' : 'Past Due'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                  {new Date(sub.renewalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors rounded-lg hover:bg-[var(--color-border-default)] opacity-0 group-hover:opacity-100">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
            
            {subscriptions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[var(--color-text-muted)] text-sm">
                  No active subscriptions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
