/* eslint-disable react-hooks/purity */
import React from 'react';
import { Search, FolderKanban, MoreVertical, PlayCircle, Settings, User, AlertCircle, Clock, ShieldCheck, Filter } from 'lucide-react';
import { supabaseAdmin } from '@server/lib/supabase/admin';
import Link from 'next/link';

export const metadata = {
  title: 'Projects — Delivery Console',
};

async function getAgentProjects() {
  const { data, error } = await supabaseAdmin
    .from('agent_projects')
    .select(`
      id,
      request_id,
      organization_id,
      status,
      completion_pct,
      created_at
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching agent projects:', error);
    return [];
  }
  return data;
}

export default async function AgentProjectsPage() {
  const fetchedProjects = await getAgentProjects();

  // Mocking priority, target date, and SLA for UI scaffolding
  const projects = fetchedProjects.map((p, i) => ({
    ...p,
    priority: i === 0 ? 'critical' : i % 3 === 0 ? 'high' : 'medium',
    sla_status: i === 0 ? 'at_risk' : 'on_track',
    target_date: new Date(Date.now() + (i * 2 - 1) * 24 * 60 * 60 * 1000).toISOString(),
    assigned_to: i % 2 === 0 ? 'Alice Chen' : 'Unassigned',
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Active Projects</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Manage the build, configuration, and delivery of customer AI agents.
          </p>
        </div>
      </div>

      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-2xl overflow-hidden shadow-sm flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-[var(--color-border-default)] px-4 pt-4 gap-6">
          <div className="pb-3 border-b-2 border-[#ff6600] text-[#ff6600] text-sm font-medium cursor-pointer">
            All Projects
          </div>
          <div className="pb-3 border-b-2 border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-sm font-medium cursor-pointer flex items-center gap-2">
            Priority Queue
            <span className="bg-red-500/10 text-red-500 py-0.5 px-2 rounded-full text-xs">2</span>
          </div>
          <div className="pb-3 border-b-2 border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-sm font-medium cursor-pointer">
            My Projects
          </div>
        </div>

        <div className="p-4 border-b border-[var(--color-border-default)] flex items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16} />
            <input 
              type="text" 
              placeholder="Search by Project ID or Organization..." 
              className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-lg pl-9 pr-4 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[#ff6600] transition-colors"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-bg-base)] border border-[var(--color-border-default)] text-sm font-medium text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-bg-subtle)] transition-colors">
              <Filter size={14} className="text-[var(--color-text-muted)]" />
              Filter
            </button>
            <div className="text-sm text-[var(--color-text-secondary)] pl-3 border-l border-[var(--color-border-default)]">
              {projects.length} Projects
            </div>
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--color-bg-subtle)]">
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Project / Org</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Stage & Progress</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Priority</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">SLA Target</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Assigned</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-subtle)]">
            {projects.map((proj: any) => (
              <tr key={proj.id} className="hover:bg-[var(--color-bg-subtle)] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <FolderKanban size={16} className="text-indigo-500" />
                    </div>
                    <div>
                      <Link href={`/delivery-console/projects/${proj.id}`} className="font-medium text-sm text-[var(--color-text-primary)] hover:text-[#ff6600] transition-colors flex items-center gap-2">
                        {proj.organization_id}
                      </Link>
                      <div className="font-mono text-xs text-[var(--color-text-secondary)] mt-0.5">ID: {proj.id.split('-')[0]}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-2">
                    <span className={`inline-flex self-start items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      proj.status === 'in_development' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' :
                      proj.status === 'qa' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      proj.status === 'deployed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)]'
                    }`}>
                      {proj.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] rounded-full h-1.5 max-w-[120px] overflow-hidden">
                        <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${proj.completion_pct}%` }}></div>
                      </div>
                      <span className="text-xs font-medium text-[var(--color-text-muted)]">{proj.completion_pct}%</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    proj.priority === 'critical' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                    proj.priority === 'high' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                    'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]'
                  }`}>
                    {proj.priority.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {proj.sla_status === 'at_risk' ? (
                      <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                    ) : (
                      <ShieldCheck size={14} className="text-emerald-500 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${proj.sla_status === 'at_risk' ? 'text-red-500' : 'text-[var(--color-text-secondary)]'}`}>
                      {new Date(proj.target_date).toLocaleDateString()}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {proj.assigned_to === 'Unassigned' ? (
                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                      <div className="w-6 h-6 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] flex items-center justify-center">
                        <User size={12} />
                      </div>
                      Unassigned
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-primary)]">
                      <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-500 font-medium flex items-center justify-center border border-indigo-500/30">
                        {proj.assigned_to.charAt(0)}
                      </div>
                      {proj.assigned_to}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/delivery-console/projects/${proj.id}`} className="p-1.5 text-[var(--color-text-muted)] hover:text-[#ff6600] hover:bg-[#ff6600]/10 rounded transition-colors" title="Open Project">
                      <Settings size={18} />
                    </Link>
                    <button className="p-1.5 text-[var(--color-text-muted)] hover:text-emerald-500 hover:bg-emerald-500/10 rounded transition-colors" title="Test Agent">
                      <PlayCircle size={18} />
                    </button>
                    <button className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] rounded transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {projects.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[var(--color-text-muted)] text-sm">
                  No active projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
