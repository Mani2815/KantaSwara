import React from 'react';
import { Search, Filter, Mail, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { supabaseAdmin } from '@server/lib/supabase/admin';

export const metadata = {
  title: 'Agent Requests — Delivery Console',
};

async function getAgentRequests() {
  const { data, error } = await supabaseAdmin
    .from('agent_requests')
    .select(`
      id,
      organization_id,
      domain,
      priority,
      status,
      created_at
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching agent requests:', error);
    return [];
  }
  return data;
}

export default async function AgentRequestsPage() {
  const requests = await getAgentRequests();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Agent Requests</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Review incoming customer requirements and convert them into implementation projects.
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
              placeholder="Search by ID or Organization..." 
              className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-lg pl-9 pr-4 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[#ff6600] transition-colors"
            />
          </div>
          <div className="text-sm text-[var(--color-text-secondary)]">
            {requests.length} Requests
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--color-bg-subtle)]">
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Request ID</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Organization</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Domain</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Priority</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Submitted Date</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-subtle)]">
            {requests.map((req: any) => (
              <tr key={req.id} className="hover:bg-[var(--color-bg-subtle)] transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-mono text-xs text-indigo-500">{req.id.split('-')[0]}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-[var(--color-text-primary)]">{req.organization_id}</div>
                </td>
                <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                  {req.domain}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    req.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                    req.priority === 'medium' ? 'bg-yellow-500/10 text-amber-500' :
                    'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]'
                  }`}>
                    {req.priority.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-blue-500/10 text-blue-500 border-blue-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    {req.status.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                  {new Date(req.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1.5 text-[var(--color-text-muted)] hover:text-indigo-500 hover:bg-indigo-500/10 rounded transition-colors" title="View Requirements">
                      <FileText size={18} />
                    </button>
                    <button className="p-1.5 text-[var(--color-text-muted)] hover:text-emerald-500 hover:bg-emerald-500/10 rounded transition-colors" title="Approve & Convert to Project">
                      <CheckCircle2 size={18} />
                    </button>
                    <button className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded transition-colors" title="Reject Request">
                      <XCircle size={18} />
                    </button>
                    <button className="p-1.5 text-[var(--color-text-muted)] hover:text-amber-500 hover:bg-amber-500/10 rounded transition-colors" title="Request Clarification">
                      <Mail size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {requests.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-[var(--color-text-muted)] text-sm">
                  No agent requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
