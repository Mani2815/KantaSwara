import React from 'react';
import { Search, Filter, Plus, FileText, CheckCircle2, Clock } from 'lucide-react';
import { prisma } from '@server/lib/prisma';
import Link from 'next/link';

export const metadata = {
  title: 'Quotations — Super Admin',
};

export const dynamic = 'force-dynamic';

async function getQuotations() {
  const quotations = await prisma.quotation.findMany({
    include: {
      organization: true,
      plan: true,
    },
    orderBy: {
      createdAt: 'desc',
    }
  });
  return quotations;
}

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
  sent: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  invoiced: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

export default async function QuotationsPage() {
  const quotations = await getQuotations();
  
  const pendingApproval = quotations.filter(q => q.status === 'sent').length;
  const approvedCount = quotations.filter(q => q.status === 'approved' || q.status === 'invoiced').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Quotations</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Manage custom enterprise pricing and implementation quotes.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors shadow-sm">
          <Plus size={16} />
          Create Quotation
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">Pending Approval</h3>
            <Clock size={16} className="text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-[var(--color-text-primary)]">{pendingApproval}</p>
        </div>
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">Approved (All Time)</h3>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-[var(--color-text-primary)]">{approvedCount}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-t-xl p-4 flex items-center justify-between mt-8">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16} />
          <input 
            type="text" 
            placeholder="Search quote number or organization..." 
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
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Quote #</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Organization</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Title</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Valid Until</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2738]">
            {quotations.map((quote: any) => (
              <tr key={quote.id} className="hover:bg-[var(--color-bg-subtle)] transition-colors group cursor-pointer">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="text-orange-400" size={14} />
                    </div>
                    <div className="font-medium text-[var(--color-text-primary)] text-sm">{quote.quotationNumber}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-[var(--color-text-primary)] text-sm">{quote.organization?.name}</div>
                  <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{quote.organization?.slug}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-[var(--color-text-primary)] text-sm">{quote.title}</div>
                  <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{quote.type}</div>
                </td>
                <td className="px-6 py-4 text-sm text-[var(--color-text-primary)] font-medium">
                  ₹{Number(quote.totalAmount).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${
                    STATUS_BADGE[quote.status] ?? STATUS_BADGE.draft
                  }`}>
                    {quote.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                  {new Date(quote.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
              </tr>
            ))}
            
            {quotations.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[var(--color-text-muted)] text-sm">
                  No quotations found. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
