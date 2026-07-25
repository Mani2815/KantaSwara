import React from 'react';
import { Search, TestTube, Filter, CheckCircle2, AlertCircle, PlayCircle, Clock } from 'lucide-react';
import { supabaseAdmin } from '@server/lib/supabase/admin';

export const metadata = {
  title: 'QA Center — Delivery Console',
};

// Scaffolded data until actual QA tables are implemented
const QA_TASKS = [
  { id: 'QA-1042', project_id: 'PRJ-3991', organization: 'Acme Corp', type: 'Functional Test', status: 'pending', priority: 'high', created_at: '2026-10-21T10:00:00Z' },
  { id: 'QA-1043', project_id: 'PRJ-3992', organization: 'Global Tech', type: 'Latency Check', status: 'in_progress', priority: 'medium', created_at: '2026-10-20T14:30:00Z' },
  { id: 'QA-1044', project_id: 'PRJ-3995', organization: 'HealthPlus Inc', type: 'Voice Prompt Audit', status: 'failed', priority: 'high', created_at: '2026-10-19T09:15:00Z' },
];

export default async function QACenterPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">QA Center</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Review testing results, run audits, and approve agents for deployment.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-sm font-medium text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-bg-subtle)] transition-colors shadow-sm">
            <Filter size={16} className="text-[var(--color-text-muted)]" />
            Filter
          </button>
        </div>
      </div>

      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[var(--color-border-default)] flex items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16} />
            <input 
              type="text" 
              placeholder="Search by Task ID or Organization..." 
              className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-lg pl-9 pr-4 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[#ff6600] transition-colors"
            />
          </div>
          <div className="text-sm text-[var(--color-text-secondary)]">
            {QA_TASKS.length} Tasks
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--color-bg-subtle)]">
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Task ID</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Project / Org</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Test Type</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Priority</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-subtle)]">
            {QA_TASKS.map((task) => (
              <tr key={task.id} className="hover:bg-[var(--color-bg-subtle)] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                      <TestTube size={16} className="text-indigo-500" />
                    </div>
                    <div className="font-mono text-xs text-indigo-500">{task.id}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-[var(--color-text-primary)]">{task.project_id}</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">{task.organization}</div>
                </td>
                <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                  {task.type}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    task.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                    task.priority === 'medium' ? 'bg-yellow-500/10 text-amber-500' :
                    'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]'
                  }`}>
                    {task.priority.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    task.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                    task.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                    task.status === 'failed' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                    'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      task.status === 'pending' ? 'bg-amber-500' :
                      task.status === 'in_progress' ? 'bg-blue-500' :
                      task.status === 'failed' ? 'bg-red-500' :
                      'bg-emerald-500'
                    }`}></span>
                    {task.status.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                  {new Date(task.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1.5 text-[var(--color-text-muted)] hover:text-indigo-500 hover:bg-indigo-500/10 rounded transition-colors" title="Start Test">
                      <PlayCircle size={18} />
                    </button>
                    <button className="p-1.5 text-[var(--color-text-muted)] hover:text-emerald-500 hover:bg-emerald-500/10 rounded transition-colors" title="Pass">
                      <CheckCircle2 size={18} />
                    </button>
                    <button className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded transition-colors" title="Fail">
                      <AlertCircle size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {QA_TASKS.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-[var(--color-text-muted)] text-sm">
                  No QA tasks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
