import React from 'react';
import Link from 'next/link';
import { Plus, ClipboardList, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

// Mock data since we haven't built the agent_requests table yet
const MOCK_REQUESTS = [
  {
    id: 'req_1',
    name: 'Customer Support Bot',
    objective: 'Handle inbound customer support queries and resolve basic issues.',
    status: 'In Development',
    submittedAt: '2026-07-15T10:00:00Z',
    expectedLaunch: '2026-07-22T00:00:00Z'
  },
  {
    id: 'req_2',
    name: 'Sales Qualification',
    objective: 'Outbound calling to qualify leads from Facebook ads.',
    status: 'Testing',
    submittedAt: '2026-07-10T14:30:00Z',
    expectedLaunch: '2026-07-21T00:00:00Z'
  },
  {
    id: 'req_3',
    name: 'Appointment Setter',
    objective: 'Book site visits for real estate properties.',
    status: 'Live',
    submittedAt: '2026-06-01T09:15:00Z',
    expectedLaunch: '2026-06-10T00:00:00Z'
  }
];

const STATUS_COLORS: Record<string, string> = {
  'Draft': 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)]',
  'Submitted': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'Under Review': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  'Approved': 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  'In Development': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  'Testing': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  'Assigned': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  'Live': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  'Rejected': 'bg-red-500/10 text-red-500 border-red-500/20',
};

export default function AgentRequestsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-[#ff6600]" /> Agent Requests
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Submit your business requirements and track the status of your bespoke AI agents.
          </p>
        </div>
        <Link 
          href={ROUTES.AGENT_REQUEST_NEW}
          className="flex items-center gap-2 bg-[#ff6600] hover:bg-[#ff6600]/90 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Request AI Agent
        </Link>
      </div>

      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl overflow-hidden">
        {MOCK_REQUESTS.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] flex items-center justify-center mb-4">
              <ClipboardList className="w-8 h-8 text-[var(--color-text-muted)]" />
            </div>
            <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">No Requests Found</h3>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-sm mx-auto mb-6">
              You haven&apos;t submitted any requirements for AI agents yet. Request your first agent to automate your business workflows.
            </p>
            <Link 
              href={ROUTES.AGENT_REQUEST_NEW}
              className="flex items-center gap-2 bg-[var(--color-bg-base)] border border-[var(--color-border-default)] hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)] text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" /> Start New Request
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--color-bg-subtle)] border-b border-[var(--color-border-default)]">
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Agent Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider hidden md:table-cell">Primary Objective</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {MOCK_REQUESTS.map((req) => (
                  <tr key={req.id} className="hover:bg-[var(--color-bg-subtle)] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-sm text-[var(--color-text-primary)]">{req.name}</div>
                      <div className="text-xs text-[var(--color-text-muted)] mt-0.5 md:hidden line-clamp-1">{req.objective}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)] hidden md:table-cell max-w-[300px] truncate">
                      {req.objective}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[var(--color-text-secondary)] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(req.submittedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[req.status] || STATUS_COLORS['Draft']}`}>
                        {req.status === 'Live' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs font-medium text-[#ff6600] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1 ml-auto">
                        View Details <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
