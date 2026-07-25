import React from 'react';
import { Search, Wrench, AlertTriangle, RefreshCw } from 'lucide-react';

export const metadata = {
  title: 'Maintenance — Delivery Console',
};

// Scaffolded data
const TASKS = [
  { id: 'MNT-001', target: 'Acme Corp Outbound Agent', issue: 'Knowledge refresh sync failing', priority: 'high', status: 'investigating' },
  { id: 'MNT-002', target: 'Global Tech Support Bot', issue: 'Latency spikes in US-East', priority: 'medium', status: 'resolved' },
];

export default async function MaintenancePage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Maintenance & Tuning</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Investigate ongoing issues and tune existing deployed agents.
          </p>
        </div>
      </div>

      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[var(--color-border-default)] flex items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16} />
            <input 
              type="text" 
              placeholder="Search by Target or Issue..." 
              className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-lg pl-9 pr-4 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[#ff6600] transition-colors"
            />
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--color-bg-subtle)]">
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Ticket ID</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Target System</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Issue Description</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Priority</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-subtle)]">
            {TASKS.map((task) => (
              <tr key={task.id} className="hover:bg-[var(--color-bg-subtle)] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Wrench size={16} className="text-amber-500" />
                    </div>
                    <div className="font-mono text-xs text-[var(--color-text-secondary)]">{task.id}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-[var(--color-text-primary)]">{task.target}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-[var(--color-text-secondary)]">{task.issue}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    task.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                    'bg-yellow-500/10 text-amber-500'
                  }`}>
                    {task.priority.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    task.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                    'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      task.status === 'resolved' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}></span>
                    {task.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1.5 text-[var(--color-text-muted)] hover:text-amber-500 hover:bg-amber-500/10 rounded transition-colors" title="Investigate">
                      <AlertTriangle size={18} />
                    </button>
                    <button className="p-1.5 text-[var(--color-text-muted)] hover:text-indigo-500 hover:bg-indigo-500/10 rounded transition-colors" title="Re-sync">
                      <RefreshCw size={18} />
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
