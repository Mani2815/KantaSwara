import React from 'react';
import { BarChart3, TrendingUp, AlertCircle, Clock, Users, ShieldCheck, CheckCircle2, Rocket } from 'lucide-react';

export const metadata = {
  title: 'Delivery Reports — Delivery Console',
};

export default function DeliveryReportsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Delivery Reports</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Analyze delivery performance, SLA compliance, and engineer productivity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-[var(--color-bg-base)] border border-[var(--color-border-default)] text-sm font-medium text-[var(--color-text-primary)] rounded-lg px-3 py-2 focus:outline-none focus:border-[#ff6600]">
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>This Year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl p-5 relative overflow-hidden group">
          <h3 className="text-[var(--color-text-secondary)] text-sm font-medium mb-1">Avg Delivery Time</h3>
          <span className="text-2xl font-bold text-[var(--color-text-primary)]">14 Days</span>
          <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1"><TrendingUp size={12} /> 12% faster</p>
          <Clock className="absolute -right-4 -bottom-4 w-24 h-24 text-[var(--color-text-muted)] opacity-5 group-hover:opacity-10 transition-opacity" />
        </div>
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl p-5 relative overflow-hidden group">
          <h3 className="text-[var(--color-text-secondary)] text-sm font-medium mb-1">SLA Compliance</h3>
          <span className="text-2xl font-bold text-[var(--color-text-primary)]">94.2%</span>
          <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1"><TrendingUp size={12} /> +2.1%</p>
          <ShieldCheck className="absolute -right-4 -bottom-4 w-24 h-24 text-[var(--color-text-muted)] opacity-5 group-hover:opacity-10 transition-opacity" />
        </div>
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl p-5 relative overflow-hidden group">
          <h3 className="text-[var(--color-text-secondary)] text-sm font-medium mb-1">QA Pass Rate</h3>
          <span className="text-2xl font-bold text-[var(--color-text-primary)]">88%</span>
          <p className="text-xs text-amber-500 mt-2 flex items-center gap-1"><AlertCircle size={12} /> Target: 95%</p>
          <CheckCircle2 className="absolute -right-4 -bottom-4 w-24 h-24 text-[var(--color-text-muted)] opacity-5 group-hover:opacity-10 transition-opacity" />
        </div>
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl p-5 relative overflow-hidden group">
          <h3 className="text-[var(--color-text-secondary)] text-sm font-medium mb-1">Projects Delivered</h3>
          <span className="text-2xl font-bold text-[var(--color-text-primary)]">42</span>
          <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1"><TrendingUp size={12} /> +8 this month</p>
          <Rocket className="absolute -right-4 -bottom-4 w-24 h-24 text-[var(--color-text-muted)] opacity-5 group-hover:opacity-10 transition-opacity" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Engineer Productivity Chart Scaffold */}
        <section className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--color-text-secondary)]" />
              Engineer Productivity
            </h2>
          </div>
          <div className="space-y-4">
            {/* Mock Chart Rows */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-[var(--color-text-secondary)]">
                <span>Alice Chen</span>
                <span>12 Delivered</span>
              </div>
              <div className="w-full bg-[var(--color-bg-elevated)] rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-[var(--color-text-secondary)]">
                <span>Sarah Jenkins</span>
                <span>9 Delivered</span>
              </div>
              <div className="w-full bg-[var(--color-bg-elevated)] rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-[var(--color-text-secondary)]">
                <span>David Kim</span>
                <span>8 Delivered</span>
              </div>
              <div className="w-full bg-[var(--color-bg-elevated)] rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '55%' }}></div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-[var(--color-text-secondary)]">
                <span>Michael Scott</span>
                <span>4 Delivered</span>
              </div>
              <div className="w-full bg-[var(--color-bg-elevated)] rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Change Request Volume Scaffold */}
        <section className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[var(--color-text-secondary)]" />
              Change Request Volume
            </h2>
          </div>
          <div className="flex items-end justify-between h-40 pt-4 border-b border-[var(--color-border-default)]">
            {/* Mock bars */}
            <div className="w-[10%] bg-indigo-500/20 hover:bg-indigo-500/40 rounded-t-md h-[40%]" title="Week 1"></div>
            <div className="w-[10%] bg-indigo-500/30 hover:bg-indigo-500/50 rounded-t-md h-[60%]" title="Week 2"></div>
            <div className="w-[10%] bg-indigo-500 hover:bg-indigo-600 rounded-t-md h-[100%]" title="Week 3"></div>
            <div className="w-[10%] bg-indigo-500/60 hover:bg-indigo-500/80 rounded-t-md h-[70%]" title="Week 4"></div>
            <div className="w-[10%] bg-indigo-500/40 hover:bg-indigo-500/60 rounded-t-md h-[50%]" title="Week 5"></div>
            <div className="w-[10%] bg-indigo-500/20 hover:bg-indigo-500/40 rounded-t-md h-[30%]" title="Week 6"></div>
          </div>
          <div className="flex justify-between text-xs text-[var(--color-text-muted)] mt-2">
            <span>6 Weeks Ago</span>
            <span>Current Week</span>
          </div>
        </section>

      </div>
    </div>
  );
}
