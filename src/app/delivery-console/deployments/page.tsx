import React from 'react';
import { Search, Filter, Rocket, Activity, RotateCcw, AlertTriangle, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

export const metadata = {
  title: 'Deployments — Delivery Console',
};

// Scaffolded data
const DEPLOYMENTS = [
  { id: 'DEP-901', project: 'Customer Support Bot', organization: 'Acme Corp', version: 'v1.2.0', status: 'success', environment: 'production', type: 'scheduled', approval: 'approved', date: '2026-10-21T09:30:00Z' },
  { id: 'DEP-902', project: 'Outbound Lead Gen', organization: 'Global Tech', version: 'v0.9.5', status: 'pending', environment: 'staging', type: 'scheduled', approval: 'pending_client', date: '2026-10-21T11:00:00Z' },
  { id: 'DEP-903', project: 'HR Assistant', organization: 'HealthPlus Inc', version: 'v2.0.1', status: 'failed', environment: 'production', type: 'hotfix', approval: 'approved', date: '2026-10-20T16:45:00Z' },
];

export default async function DeploymentsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Deployments</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Track release versions, monitor rollout status, and manage environments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#ff6600] text-white text-sm font-medium rounded-lg hover:bg-[#e65c00] transition-colors shadow-sm">
            <Rocket size={16} />
            New Deployment
          </button>
        </div>
      </div>

      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[var(--color-border-default)] flex items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16} />
            <input 
              type="text" 
              placeholder="Search by ID, Project, or Org..." 
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
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Deployment ID</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Project / Org</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Environment & Type</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Approval</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-subtle)]">
            {DEPLOYMENTS.map((dep) => (
              <tr key={dep.id} className="hover:bg-[var(--color-bg-subtle)] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Rocket size={16} className="text-emerald-500" />
                    </div>
                    <div className="font-mono text-xs text-[var(--color-text-secondary)]">{dep.id}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-[var(--color-text-primary)]">{dep.project}</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">{dep.organization}</div>
                  <div className="mt-1">
                    <span className="font-mono text-[10px] text-[var(--color-text-secondary)] bg-[var(--color-bg-elevated)] px-1.5 py-0.5 rounded border border-[var(--color-border-subtle)]">{dep.version}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5 items-start">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      dep.environment === 'production' ? 'bg-[#ff6600]/10 text-[#ff6600]' :
                      'bg-indigo-500/10 text-indigo-500'
                    }`}>
                      {dep.environment.toUpperCase()}
                    </span>
                    {dep.type === 'hotfix' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-red-500">
                        <AlertTriangle size={10} />
                        HOTFIX
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {dep.approval === 'approved' ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-500">
                      <ShieldCheck size={14} />
                      Approved
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-amber-500">
                      <Clock size={14} />
                      Client Pending
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    dep.status === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                    dep.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                    'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      dep.status === 'success' ? 'bg-emerald-500' :
                      dep.status === 'pending' ? 'bg-amber-500' :
                      'bg-red-500'
                    }`}></span>
                    {dep.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                  {new Date(dep.date).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1.5 text-[var(--color-text-muted)] hover:text-indigo-500 hover:bg-indigo-500/10 rounded transition-colors" title="View Logs">
                      <Activity size={18} />
                    </button>
                    {(dep.status === 'failed' || dep.status === 'success') && dep.environment === 'production' && (
                      <button className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded transition-colors" title="Rollback">
                        <RotateCcw size={18} />
                      </button>
                    )}
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
