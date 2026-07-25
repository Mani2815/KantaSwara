import React from 'react';
import { Search, Workflow, Copy, Plus, Filter, MoreVertical, LayoutTemplate } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Workflow Templates — Delivery Console',
};

const WORKFLOW_TEMPLATES = [
  { id: 'WFL-001', name: 'CRM Sync (HubSpot)', type: 'Integration', used_in: 18, author: 'Integration Team', updated: 'Sep 28' },
  { id: 'WFL-002', name: 'Zendesk Ticket Creation', type: 'Support', used_in: 14, author: 'Alice Chen', updated: 'Oct 2' },
  { id: 'WFL-003', name: 'Stripe Payment Collection', type: 'Billing', used_in: 6, author: 'Integration Team', updated: 'Oct 5' },
  { id: 'WFL-004', name: 'Calendar Booking (Google)', type: 'Scheduling', used_in: 22, author: 'Sarah Jenkins', updated: 'Oct 14' },
];

export default function WorkflowLibraryPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Workflow Templates</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Reusable function calls, webhooks, and tool configurations.
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-[#ff6600] text-white text-sm font-medium rounded-lg hover:bg-[#e65c00] transition-colors shadow-sm">
          <Plus size={16} />
          New Template
        </button>
      </div>

      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[var(--color-border-default)] flex items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16} />
            <input 
              type="text" 
              placeholder="Search workflow templates..." 
              className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-lg pl-9 pr-4 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[#ff6600] transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-bg-base)] border border-[var(--color-border-default)] text-sm font-medium text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-bg-subtle)] transition-colors">
            <Filter size={14} className="text-[var(--color-text-muted)]" />
            Filter
          </button>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--color-bg-subtle)]">
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Template Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Usage</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Author</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-subtle)]">
            {WORKFLOW_TEMPLATES.map((workflow) => (
              <tr key={workflow.id} className="hover:bg-[var(--color-bg-subtle)] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <LayoutTemplate size={16} className="text-emerald-500" />
                    </div>
                    <div>
                      <div className="font-medium text-sm text-[var(--color-text-primary)]">{workflow.name}</div>
                      <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{workflow.id} • Updated {workflow.updated}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]">
                    {workflow.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-[var(--color-text-primary)]">{workflow.used_in} Projects</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-[var(--color-text-secondary)]">{workflow.author}</div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-[var(--color-text-muted)] hover:text-[#ff6600] hover:bg-[#ff6600]/10 rounded transition-colors" title="Copy to project">
                      <Copy size={18} />
                    </button>
                    <button className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] rounded transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
