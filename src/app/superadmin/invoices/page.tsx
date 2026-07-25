import React from 'react';
import { Search, Filter, Download, CheckCircle2, AlertCircle, Receipt } from 'lucide-react';
import { prisma } from '@server/lib/prisma';

export const metadata = {
  title: 'Invoices — Super Admin',
};

export const dynamic = 'force-dynamic';

async function getInvoices() {
  const invoices = await prisma.invoice.findMany({
    include: {
      organization: true,
    },
    orderBy: {
      createdAt: 'desc',
    }
  });
  return invoices;
}

const STATUS_BADGE: Record<string, string> = {
  paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  partially_paid: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  pending: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
  overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default async function InvoicesPage() {
  const invoices = await getInvoices();
  
  const totalCollected = invoices.reduce((sum, inv) => sum + Number(inv.paidAmount), 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + Number(inv.balanceDue), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Invoices</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            View all tenant invoices, payment statuses, and revenue collected.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">Total Collected (All Time)</h3>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-[var(--color-text-primary)]">₹{totalCollected.toLocaleString()}</p>
        </div>
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">Total Outstanding</h3>
            <AlertCircle size={16} className="text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-[var(--color-text-primary)]">₹{totalOutstanding.toLocaleString()}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-t-xl p-4 flex items-center justify-between mt-8">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16} />
          <input 
            type="text" 
            placeholder="Search invoice number or organization..." 
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
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Invoice</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Organization</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Date Issued</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2738]">
            {invoices.map((inv: any) => (
              <tr key={inv.id} className="hover:bg-[var(--color-bg-subtle)] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                      <Receipt className="text-orange-400" size={14} />
                    </div>
                    <div className="font-medium text-[var(--color-text-primary)] text-sm">{inv.invoiceNumber}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-[var(--color-text-primary)] text-sm">{inv.organization?.name}</div>
                  <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{inv.organization?.slug}</div>
                </td>
                <td className="px-6 py-4 text-sm text-[var(--color-text-primary)] font-medium">
                  ₹{Number(inv.totalAmount).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${
                    STATUS_BADGE[inv.paymentStatus] ?? STATUS_BADGE.pending
                  }`}>
                    {inv.paymentStatus.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                  {new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-[var(--color-text-muted)] hover:text-orange-500 transition-colors rounded-lg hover:bg-orange-500/10 opacity-0 group-hover:opacity-100" title="Download PDF">
                    <Download size={16} />
                  </button>
                </td>
              </tr>
            ))}
            
            {invoices.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[var(--color-text-muted)] text-sm">
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
