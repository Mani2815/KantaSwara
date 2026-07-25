import React from 'react';
import Link from 'next/link';
import { Search, Filter, Bot, Plus, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'AI Agent Builder — Delivery Console',
};

// Mock data representing active agent builds
const AGENT_BUILDS = [
  { id: 'PRJ-1234', org: 'Acme Corp', name: 'Acme Support Bot', stage: 'prompt_config', version: 'v1.0.0-draft', updated: '2 hours ago' },
  { id: 'PRJ-8422', org: 'Global Tech', name: 'Outbound Lead Gen', stage: 'testing', version: 'v0.9.0-draft', updated: 'Yesterday' },
  { id: 'PRJ-9110', org: 'HealthPlus Inc', name: 'HR Assistant', stage: 'knowledge_config', version: 'v2.1.0-draft', updated: 'Oct 15, 2026' },
];

export default function BuilderLandingPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">AI Agent Builder</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Select a project to configure prompts, workflows, and voice settings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/delivery-console/builder/new" className="flex items-center gap-2 px-4 py-2 bg-[#ff6600] text-white text-sm font-medium rounded-lg hover:bg-[#e65c00] transition-colors shadow-sm">
            <Plus size={16} />
            Create Blank Agent
          </Link>
        </div>
      </div>

      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[var(--color-border-default)] flex items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16} />
            <input 
              type="text" 
              placeholder="Search by Agent Name or Project ID..." 
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
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Agent Details</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Organization / Project</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Current Stage</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-subtle)]">
            {AGENT_BUILDS.map((agent) => (
              <tr key={agent.id} className="hover:bg-[var(--color-bg-subtle)] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                      <Bot size={16} className="text-indigo-500" />
                    </div>
                    <div>
                      <div className="font-medium text-sm text-[var(--color-text-primary)]">{agent.name}</div>
                      <div className="text-xs text-[var(--color-text-muted)] mt-0.5">Version: {agent.version} • Updated {agent.updated}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-[var(--color-text-primary)]">{agent.org}</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">{agent.id}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] uppercase">
                    {agent.stage.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    href={`/delivery-console/builder/${agent.id}`}
                    className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] text-sm font-medium text-[var(--color-text-primary)] rounded hover:bg-[var(--color-bg-subtle)] transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Open Builder
                    <ArrowRight size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
