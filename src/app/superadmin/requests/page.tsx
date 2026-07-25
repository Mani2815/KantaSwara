import React from 'react';
import { ClipboardList, Search, Filter, Clock, CheckCircle2, MoreVertical } from 'lucide-react';

// Mock data for Super Admin global queue
const MOCK_GLOBAL_REQUESTS = [
  {
    id: 'req_1',
    orgName: 'Acme Corp',
    name: 'Customer Support Bot',
    objective: 'Handle inbound customer support queries and resolve basic issues.',
    status: 'Submitted',
    submittedAt: '2026-07-20T10:00:00Z',
  },
  {
    id: 'req_2',
    orgName: 'Stark Industries',
    name: 'Sales Qualification',
    objective: 'Outbound calling to qualify leads from Facebook ads.',
    status: 'In Development',
    submittedAt: '2026-07-18T14:30:00Z',
  },
  {
    id: 'req_3',
    orgName: 'Wayne Enterprises',
    name: 'Appointment Setter',
    objective: 'Book site visits for real estate properties.',
    status: 'Testing',
    submittedAt: '2026-07-15T09:15:00Z',
  },
  {
    id: 'req_4',
    orgName: 'LexCorp',
    name: 'Billing Support',
    objective: 'Answer billing questions and process payments over phone.',
    status: 'Under Review',
    submittedAt: '2026-07-19T11:20:00Z',
  }
];

const STATUS_COLORS: Record<string, string> = {
  'Draft': 'bg-neutral-500/10 text-[var(--color-text-secondary)] border-neutral-500/20',
  'Submitted': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Under Review': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Approved': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'In Development': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Testing': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Assigned': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Live': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Rejected': 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function SuperAdminRequestsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Agent Request Queue</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Review and process incoming AI agent requirements from all organizations.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">New Requests</h3>
            <span className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs font-bold">1</span>
          </div>
          <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-2">1</p>
          <p className="text-[10px] text-blue-400 mt-1">Needs review</p>
        </div>
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">In Development</h3>
            <span className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-bold">1</span>
          </div>
          <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-2">1</p>
          <p className="text-[10px] text-amber-400 mt-1">Actively being built</p>
        </div>
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">In Testing</h3>
            <span className="w-6 h-6 rounded-md bg-orange-500/10 text-orange-400 flex items-center justify-center text-xs font-bold">1</span>
          </div>
          <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-2">1</p>
          <p className="text-[10px] text-orange-400 mt-1">QA / Client UAT</p>
        </div>
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">Total Live</h3>
            <span className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold">12</span>
          </div>
          <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-2">124</p>
          <p className="text-[10px] text-emerald-400 mt-1">Across all tenants</p>
        </div>
      </div>

      {/* Global Queue Table */}
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input 
              type="text" 
              placeholder="Search by organization or agent name..." 
              className="w-full bg-[var(--color-bg-subtle)] border border-[var(--color-border-default)] rounded-lg pl-9 pr-4 py-2 text-sm text-[var(--color-text-primary)] placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-[var(--color-bg-subtle)] border border-[var(--color-border-default)] text-xs font-medium text-[var(--color-text-primary)] rounded hover:bg-[var(--color-border-default)] transition-colors w-full sm:w-auto justify-center">
            <Filter size={14} className="text-[var(--color-text-secondary)]" />
            Filter Status
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-bg-surface)] border-b border-[var(--color-border-default)]">
                <th className="px-6 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Organization</th>
                <th className="px-6 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Requested Agent</th>
                <th className="px-6 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider hidden md:table-cell">Objective</th>
                <th className="px-6 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2738]">
              {MOCK_GLOBAL_REQUESTS.map((req) => (
                <tr key={req.id} className="hover:bg-[var(--color-bg-subtle)] transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-[var(--color-text-primary)]">{req.orgName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-sm text-[var(--color-text-primary)]">{req.name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)] hidden md:table-cell max-w-[250px] truncate">
                    {req.objective}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-[var(--color-text-secondary)] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(req.submittedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_COLORS[req.status] || STATUS_COLORS['Draft']}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] p-1 rounded-md hover:bg-[var(--color-border-default)] transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
