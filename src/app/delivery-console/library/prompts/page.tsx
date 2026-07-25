import React from 'react';
import { Search, Library, FileText, Copy, Plus, Filter, MoreVertical, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Prompt Library — Delivery Console',
};

const PROMPT_TEMPLATES = [
  { id: 'PRM-001', name: 'Inbound Customer Service (Standard)', category: 'Support', used_in: 12, rating: '4.8', author: 'Delivery Team', updated: 'Oct 1' },
  { id: 'PRM-002', name: 'Outbound Sales Lead Qual (B2B)', category: 'Sales', used_in: 8, rating: '4.5', author: 'Alice Chen', updated: 'Oct 3' },
  { id: 'PRM-003', name: 'HVAC Appointment Scheduling', category: 'Scheduling', used_in: 4, rating: '4.9', author: 'Delivery Team', updated: 'Oct 10' },
  { id: 'PRM-004', name: 'Healthcare Triage (Level 1)', category: 'Healthcare', used_in: 2, rating: '4.2', author: 'Sarah Jenkins', updated: 'Oct 12' },
];

export default function PromptLibraryPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Prompt Library</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Standardized and reusable system prompts for AI agents.
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
              placeholder="Search prompt templates..." 
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
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Usage</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Author</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-subtle)]">
            {PROMPT_TEMPLATES.map((prompt) => (
              <tr key={prompt.id} className="hover:bg-[var(--color-bg-subtle)] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                      <FileText size={16} className="text-indigo-500" />
                    </div>
                    <div>
                      <div className="font-medium text-sm text-[var(--color-text-primary)]">{prompt.name}</div>
                      <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{prompt.id} • Updated {prompt.updated}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]">
                    {prompt.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-[var(--color-text-primary)]">{prompt.used_in} Projects</div>
                  <div className="text-xs text-[var(--color-text-muted)] mt-0.5">Rating: {prompt.rating}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-[var(--color-text-secondary)]">{prompt.author}</div>
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
