import React from 'react';
import { ShieldCheck, AlertTriangle, Key, Users, Filter, Download } from 'lucide-react';

export const metadata = {
  title: 'Security & Audit — Super Admin',
};

// Mock Audit Logs
const AUDIT_LOGS = [
  { id: 1, action: 'org_suspended', user: 'admin@kantaswara.com', target: 'Acme Corp', ip: '192.168.1.5', time: '10 mins ago', severity: 'high' },
  { id: 2, action: 'feature_flag_toggled', user: 'system', target: 'global.new_voice_model', ip: 'internal', time: '1 hour ago', severity: 'medium' },
  { id: 3, action: 'failed_login', user: 'unknown', target: 'admin@acmecorp.com', ip: '45.22.11.9', time: '2 hours ago', severity: 'high' },
  { id: 4, action: 'api_key_revoked', user: 'admin@kantaswara.com', target: 'Acme Corp (Key ID: xxxx)', ip: '192.168.1.5', time: '3 hours ago', severity: 'medium' },
  { id: 5, action: 'plan_upgraded', user: 'billing@stripe.com', target: 'Stark Industries', ip: 'stripe-webhook', time: '5 hours ago', severity: 'low' },
];

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Security & Audit Center</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Global audit logs, compliance events, and security monitoring.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bg-subtle)] border border-[var(--color-border-default)] text-sm font-medium text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-border-default)] transition-colors">
            <Download size={16} className="text-[var(--color-text-secondary)]" />
            Export Logs
          </button>
        </div>
      </div>

      {/* Security KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle size={18} className="text-red-500" />
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">Security Incidents</h3>
          </div>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">2</p>
          <p className="text-[10px] text-red-500 mt-1">Requires attention</p>
        </div>
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Users size={18} className="text-yellow-500" />
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">Failed Logins (24h)</h3>
          </div>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">143</p>
          <p className="text-[10px] text-yellow-500 mt-1">+12% from yesterday</p>
        </div>
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Key size={18} className="text-blue-500" />
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">Active API Keys</h3>
          </div>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">1,204</p>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Across all tenants</p>
        </div>
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck size={18} className="text-emerald-500" />
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">Compliance Status</h3>
          </div>
          <p className="text-lg font-bold text-emerald-400 mt-1">SOC2 Compliant</p>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Last audit: 2 months ago</p>
        </div>
      </div>

      {/* Global Audit Log */}
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mt-8 mb-4">Global Audit Log</h2>
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border-default)] flex items-center justify-between">
          <div className="text-sm font-medium text-[var(--color-text-primary)]">Recent Activity</div>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-bg-subtle)] border border-[var(--color-border-default)] text-xs font-medium text-[var(--color-text-primary)] rounded hover:bg-[var(--color-border-default)] transition-colors">
            <Filter size={14} className="text-[var(--color-text-secondary)]" />
            Filter Logs
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-bg-surface)] border-b border-[var(--color-border-default)]">
                <th className="px-6 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Actor / User</th>
                <th className="px-6 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Target</th>
                <th className="px-6 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2738]">
              {AUDIT_LOGS.map((log) => (
                <tr key={log.id} className="hover:bg-[var(--color-bg-subtle)] transition-colors">
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      log.severity === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      log.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                      'bg-neutral-500/10 text-[var(--color-text-primary)] border-neutral-500/20'
                    }`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--color-text-primary)]">{log.user}</td>
                  <td className="px-6 py-4 text-sm text-[var(--color-text-primary)]">{log.target}</td>
                  <td className="px-6 py-4 text-sm text-[var(--color-text-muted)] font-mono text-xs">{log.ip}</td>
                  <td className="px-6 py-4 text-sm text-[var(--color-text-muted)]">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
