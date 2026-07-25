import React from 'react';
import { Search, Users, ShieldCheck, Mail } from 'lucide-react';

export const metadata = {
  title: 'Assignments — Delivery Console',
};

// Scaffolded data
const TEAM = [
  { id: 'USR-1', name: 'Alice Chen', role: 'Solutions Engineer', projects: 4, status: 'active' },
  { id: 'USR-2', name: 'Bob Smith', role: 'Implementation Specialist', projects: 2, status: 'active' },
  { id: 'USR-3', name: 'Charlie Davis', role: 'Prompt Engineer', projects: 5, status: 'away' },
];

export default async function AssignmentsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Team Assignments</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Manage your delivery team workload and project allocations.
          </p>
        </div>
      </div>

      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[var(--color-border-default)] flex items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16} />
            <input 
              type="text" 
              placeholder="Search by Name or Role..." 
              className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-lg pl-9 pr-4 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[#ff6600] transition-colors"
            />
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--color-bg-subtle)]">
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Team Member</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Active Projects</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-subtle)]">
            {TEAM.map((member) => (
              <tr key={member.id} className="hover:bg-[var(--color-bg-subtle)] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] flex items-center justify-center font-medium text-[var(--color-text-primary)]">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--color-text-primary)]">{member.name}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">{member.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-[var(--color-text-secondary)]">{member.role}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">{member.projects}</span>
                    <span className="text-xs text-[var(--color-text-muted)]">assigned</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    member.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                    'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      member.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}></span>
                    {member.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1.5 text-[var(--color-text-muted)] hover:text-indigo-500 hover:bg-indigo-500/10 rounded transition-colors" title="Manage Workload">
                      <ShieldCheck size={18} />
                    </button>
                    <button className="p-1.5 text-[var(--color-text-muted)] hover:text-indigo-500 hover:bg-indigo-500/10 rounded transition-colors" title="Message">
                      <Mail size={18} />
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
