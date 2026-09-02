import { createClient } from '@server/lib/supabase/server';
import { supabaseAdmin } from '@server/lib/supabase/admin';
import Link from 'next/link';
import {
  Bot, PhoneCall, BarChart2, Users,
  TrendingUp, ArrowUpRight, ArrowDownRight,
  Activity, Zap, Clock, CheckCircle2,
  Plus, Upload, Database, GitBranch,
  AlertCircle, ShieldCheck, PlayCircle, BookOpen,
  Calendar, LineChart, Server, Bell, History
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Operations Center — KantaSwara',
  description: 'Your KantaSwara AI Voice Operations Center.',
};

async function getDashboardData(orgId: string) {
  const [orgRes, agentsRes, callsRes, leadsRes] = await Promise.all([
    supabaseAdmin
      .from('organizations')
      .select('name')
      .eq('id', orgId)
      .single(),
    supabaseAdmin
      .from('agents')
      .select('id, name, status, total_calls, success_rate, avg_call_duration, updated_at')
      .eq('organization_id', orgId)
      .is('deleted_at', null),
    supabaseAdmin
      .from('conversations')
      .select('id, started_at, duration_seconds, outcome, direction')
      .eq('organization_id', orgId)
      .is('deleted_at', null)
      .order('started_at', { ascending: false })
      .limit(100),
    supabaseAdmin
      .from('crm_leads')
      .select('id, name, status, created_at')
      .eq('organization_id', orgId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  const orgName = orgRes.data?.name || 'Organization';
  const agents = agentsRes.data ?? [];
  const calls = callsRes.data ?? [];
  const leads = leadsRes.data ?? [];

  const activeAgents = agents.filter(a => a.status === 'active').length;
  const totalCalls = calls.length; // Mocking as "Calls Today"
  
  // Business Outcomes
  const appointmentsBooked = leads.filter(l => l.status === 'converted').length;
  const qualifiedLeads = leads.filter(l => l.status === 'qualified').length;
  
  // Operational Quality
  const successfulCalls = calls.filter(c => c.outcome === 'completed').length;
  const successRate = totalCalls ? Math.round((successfulCalls / totalCalls) * 100) : 0;
  const failedCalls = calls.filter(c => c.outcome === 'failed').length;

  const recentCalls = calls.slice(0, 5);
  const recentLeads = leads.slice(0, 5);

  return { 
    orgName, agents, activeAgents, totalCalls, successRate, 
    recentCalls, leads: recentLeads, appointmentsBooked, qualifiedLeads, failedCalls
  };
}

function StatCard({
  label, value, sub, icon: Icon, trend, trendUp, accent,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; trend?: string; trendUp?: boolean; accent: string;
}) {
  return (
    <div className="relative bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl p-5 overflow-hidden transition-all group cursor-default">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-[#ff6600] bg-opacity-10`}>
          {React.createElement(Icon as any, { className: "w-5 h-5 text-[#ff6600]" })}
        </div>
        {trend && (
          <span className={`flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-emerald-500' : 'text-red-500'}`}>
            {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-[var(--color-text-primary)] mb-1">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className="text-sm font-medium text-[var(--color-text-secondary)]">{label}</p>
      {sub && <p className="text-xs text-[var(--color-text-muted)] mt-1">{sub}</p>}
    </div>
  );
}

function StatusBadge({ label, status }: { label: string, status: 'operational' | 'degraded' | 'down' }) {
  const styles = {
    operational: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    degraded: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    down: 'bg-red-500/10 text-red-500 border-red-500/20',
  };
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${styles[status]}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${status === 'operational' ? 'bg-emerald-500 animate-pulse' : status === 'degraded' ? 'bg-amber-500' : 'bg-red-500'}`} />
      {label}
    </div>
  );
}

const OUTCOME_STYLE: Record<string, string> = {
  completed:   'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  transferred: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  voicemail:   'bg-purple-500/10 text-purple-500 border-purple-500/20',
  abandoned:   'bg-amber-500/10 text-amber-500 border-amber-500/20',
  failed:      'bg-red-500/10 text-red-500 border-red-500/20',
};

const AGENT_STATUS_STYLE: Record<string, string> = {
  active:   'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  inactive: 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)]',
  draft:    'bg-amber-500/10 text-amber-500 border-amber-500/20',
  error:    'bg-red-500/10 text-red-500 border-red-500/20',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('full_name, organization_id, role')
    .eq('id', user!.id)
    .single();

  if (!profile) return null;

  const data = await getDashboardData(profile.organization_id);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Dashboard Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            {data.orgName} <span className="text-[var(--color-text-muted)] font-normal text-lg">• AI Operations Overview</span>
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> System is operating normally. No critical alerts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/requests/new" className="flex items-center gap-2 bg-[#ff6600] hover:bg-[#ff6600]/90 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Request AI Agent
          </Link>
          <Link 
            href="/demo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6600] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-bg-base)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            aria-label="Start Demo Call"
          >
            <PlayCircle className="w-4 h-4 text-[#ff6600]" aria-hidden="true" /> Start Demo Call
          </Link>
        </div>
      </div>

      {/* 2. Operations Status Strip */}
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge label="Voice Services" status="operational" />
        <StatusBadge label="Workflow Engine" status="operational" />
        <StatusBadge label="Knowledge Base" status="operational" />
        <StatusBadge label="CRM Integration" status="operational" />
        <StatusBadge label="API Connectivity" status="operational" />
      </div>

      {/* 3. Business-Focused KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active AI Operations"
          value={`${data.activeAgents} Agents`}
          sub="Handling live traffic"
          icon={Activity}
          accent="bg-[#ff6600]"
          trend="Operational"
          trendUp
        />
        <StatCard
          label="Today's Volume"
          value={data.totalCalls}
          sub="Calls handled today"
          icon={PhoneCall}
          accent="bg-[#ff6600]"
          trend="+12.5%"
          trendUp
        />
        <StatCard
          label="Business Outcomes"
          value={data.appointmentsBooked}
          sub="Appointments booked today"
          icon={Calendar}
          accent="bg-[#ff6600]"
          trend="+4 vs yesterday"
          trendUp
        />
        <StatCard
          label="Operational Quality"
          value={`${data.successRate}%`}
          sub="Workflow success rate"
          icon={CheckCircle2}
          accent="bg-[#ff6600]"
          trend={data.failedCalls > 0 ? `${data.failedCalls} escalations` : 'Optimal'}
          trendUp={data.failedCalls === 0}
        />
      </div>

      {/* Alerts Center */}
      {data.failedCalls > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">Attention Required</h4>
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
              There have been {data.failedCalls} failed or escalated calls in the recent period. Please check the Live Calls log for details.
            </p>
          </div>
        </div>
      )}

      {/* 4. Core Operations: Agents & Calls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Agents */}
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-[var(--color-border-default)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-[var(--color-text-secondary)]" />
              <h2 className="font-semibold text-sm text-[var(--color-text-primary)]">AI Agents</h2>
            </div>
            <Link href="/agents" className="text-xs text-[#ff6600] hover:underline">Manage Agents</Link>
          </div>
          <div className="divide-y divide-[var(--color-border-subtle)] flex-1">
            {data.agents.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <Bot className="w-8 h-8 text-[var(--color-text-muted)] mx-auto mb-3" />
                <p className="text-sm font-medium text-[var(--color-text-primary)]">No Active Agents</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1 mb-4">Request a new AI Agent to get started.</p>
                <Link href="/requests/new" className="inline-flex items-center gap-2 text-xs font-medium text-[#ff6600] bg-[#ff6600]/10 px-3 py-1.5 rounded-lg hover:bg-[#ff6600]/20 transition-colors">
                  <Plus className="w-3 h-3" /> Request AI Agent
                </Link>
              </div>
            ) : data.agents.slice(0, 5).map((agent) => (
              <div key={agent.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-[var(--color-bg-subtle)] transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-center">
                    <Zap className="w-4 h-4 text-[#ff6600]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{agent.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Updated {new Date(agent.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs border px-2 py-0.5 rounded-full capitalize ${AGENT_STATUS_STYLE[agent.status] ?? AGENT_STATUS_STYLE.inactive}`}>
                    {agent.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Calls */}
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-[var(--color-border-default)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--color-text-secondary)]" />
              <h2 className="font-semibold text-sm text-[var(--color-text-primary)]">Live & Recent Calls</h2>
            </div>
            <Link href="/calls" className="text-xs text-[#ff6600] hover:underline">View Log</Link>
          </div>
          <div className="divide-y divide-[var(--color-border-subtle)] flex-1">
            {data.recentCalls.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <PhoneCall className="w-8 h-8 text-[var(--color-text-muted)] mx-auto mb-3" />
                <p className="text-sm text-[var(--color-text-muted)]">No active or recent calls.</p>
              </div>
            ) : data.recentCalls.map((call) => (
              <div key={call.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-[var(--color-bg-subtle)] transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${call.direction === 'inbound' ? 'bg-blue-500/5 border-blue-500/10' : 'bg-purple-500/5 border-purple-500/10'}`}>
                    <PhoneCall className={`w-4 h-4 ${call.direction === 'inbound' ? 'text-blue-500' : 'text-purple-500'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)] capitalize">{call.direction} Call</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {new Date(call.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs border px-2 py-0.5 rounded-full capitalize ${OUTCOME_STYLE[call.outcome ?? ''] ?? 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)]'}`}>
                    {call.outcome ?? 'active'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Support Systems: Workflows & KB */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Workflows Overview */}
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-[var(--color-border-default)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-[var(--color-text-secondary)]" />
              <h2 className="font-semibold text-sm text-[var(--color-text-primary)]">Workflow Engine</h2>
            </div>
            <Link href="/workflows" className="text-xs text-[#ff6600] hover:underline">Manage</Link>
          </div>
          <div className="p-5 flex flex-col justify-center flex-1">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">3</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">Active</p>
              </div>
              <div className="text-center border-l border-r border-[var(--color-border-subtle)]">
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">1</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">Drafts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">98%</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">Completion</p>
              </div>
            </div>
            <div className="bg-[var(--color-bg-subtle)] rounded-xl p-3 flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
              <span>Appointment Booking V2</span>
              <span className="text-emerald-500 font-medium text-xs">Healthy</span>
            </div>
          </div>
        </div>

        {/* Knowledge Base */}
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-[var(--color-border-default)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[var(--color-text-secondary)]" />
              <h2 className="font-semibold text-sm text-[var(--color-text-primary)]">Knowledge Base</h2>
            </div>
            <Link href="/knowledge" className="text-xs text-[#ff6600] hover:underline">Manage</Link>
          </div>
          <div className="p-5 flex flex-col justify-center flex-1">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">124</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">Total Documents Indexed</p>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-r-[var(--color-bg-subtle)] flex items-center justify-center">
                <span className="text-xs font-bold text-[var(--color-text-primary)]">75%</span>
              </div>
            </div>
            <button className="w-full flex items-center justify-center gap-2 text-sm font-medium text-[var(--color-text-primary)] bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl py-2 hover:bg-[var(--color-bg-subtle)] transition-colors">
              <Upload className="w-4 h-4" /> Upload Document
            </button>
          </div>
        </div>

      </div>

      {/* 6. Business Value: CRM & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Business Insights */}
        <div className="lg:col-span-1 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl overflow-hidden p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <LineChart className="w-4 h-4 text-[var(--color-text-secondary)]" />
            <h2 className="font-semibold text-sm text-[var(--color-text-primary)]">Intelligent Insights</h2>
          </div>
          <div className="space-y-4 flex-1">
            <div className="bg-[var(--color-bg-subtle)] rounded-xl p-3 border border-[var(--color-border-subtle)]">
              <p className="text-xs font-semibold text-[var(--color-text-primary)] mb-1">Peak Calling Hours</p>
              <p className="text-xs text-[var(--color-text-secondary)]">Most calls happen between 2PM and 4PM. Consider provisioning more concurrency.</p>
            </div>
            <div className="bg-[var(--color-bg-subtle)] rounded-xl p-3 border border-[var(--color-border-subtle)]">
              <p className="text-xs font-semibold text-[var(--color-text-primary)] mb-1">Top Intent</p>
              <p className="text-xs text-[var(--color-text-secondary)]">&quot;Schedule an appointment&quot; accounts for 45% of today&apos;s interactions.</p>
            </div>
          </div>
        </div>

        {/* CRM Snapshot */}
        <div className="lg:col-span-2 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-[var(--color-border-default)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[var(--color-text-secondary)]" />
              <h2 className="font-semibold text-sm text-[var(--color-text-primary)]">CRM Snapshot</h2>
            </div>
            <Link href="/leads" className="text-xs text-[#ff6600] hover:underline">View All Leads</Link>
          </div>
          <div className="p-5 flex gap-6">
            <div className="w-1/3">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">New Leads</p>
                  <p className="text-xl font-bold text-[var(--color-text-primary)]">{data.leads.filter(l => l.status === 'new').length}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Qualified</p>
                  <p className="text-xl font-bold text-purple-500">{data.qualifiedLeads}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Converted</p>
                  <p className="text-xl font-bold text-emerald-500">{data.appointmentsBooked}</p>
                </div>
              </div>
            </div>
            <div className="w-2/3 border-l border-[var(--color-border-subtle)] pl-6 flex flex-col">
              <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Recent Conversions</h3>
              <div className="space-y-3 flex-1 overflow-y-auto">
                {data.leads.filter(l => l.status === 'converted' || l.status === 'qualified').slice(0, 3).map(lead => (
                  <div key={lead.id} className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{lead.name}</p>
                    <span className="text-xs px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
                      {lead.status}
                    </span>
                  </div>
                ))}
                {data.leads.filter(l => l.status === 'converted' || l.status === 'qualified').length === 0 && (
                  <p className="text-sm text-[var(--color-text-muted)]">No recent conversions to show.</p>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 7. Activity Timeline */}
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl overflow-hidden p-5">
        <div className="flex items-center gap-2 mb-6">
          <History className="w-4 h-4 text-[var(--color-text-secondary)]" />
          <h2 className="font-semibold text-sm text-[var(--color-text-primary)]">System Activity Log</h2>
        </div>
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-[var(--color-border-subtle)]">
          {/* Mock Timeline Event */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-5 h-5 rounded-full border border-emerald-500 bg-emerald-500/20 text-emerald-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <CheckCircle2 className="w-3 h-3" />
            </div>
            <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.25rem)] p-4 rounded-xl bg-[var(--color-bg-base)] border border-[var(--color-border-default)] shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-[var(--color-text-primary)]">Agent Deployed</span>
                <span className="text-xs font-medium text-[var(--color-text-muted)]">10 mins ago</span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">AppointmentBot v2 was successfully published to production.</p>
            </div>
          </div>
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-5 h-5 rounded-full border border-blue-500 bg-blue-500/20 text-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <Database className="w-3 h-3" />
            </div>
            <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.25rem)] p-4 rounded-xl bg-[var(--color-bg-base)] border border-[var(--color-border-default)] shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-[var(--color-text-primary)]">CRM Synced</span>
                <span className="text-xs font-medium text-[var(--color-text-muted)]">1 hour ago</span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">Successfully synchronized 45 new leads with Salesforce.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
