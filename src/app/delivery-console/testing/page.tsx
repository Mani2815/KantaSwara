import React from 'react';
import { TestTube, Search, Filter, Play } from 'lucide-react';

export const metadata = {
  title: 'Testing Center — Delivery Console',
};

// Scaffolded data until actual testing tables are implemented
const TEST_SUITES = [
  { id: 'TEST-001', name: 'Core Booking Flow', type: 'E2E', status: 'passed', last_run: '2026-10-21T10:00:00Z', duration: '45s' },
  { id: 'TEST-002', name: 'Fallback Intents', type: 'Integration', status: 'failed', last_run: '2026-10-20T14:30:00Z', duration: '12s' },
  { id: 'TEST-003', name: 'Voice Synthesis Quality', type: 'Manual', status: 'pending', last_run: '-', duration: '-' },
];

export default async function TestingCenterPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Testing Center</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Run automated test suites and review execution histories across agent versions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-sm font-medium text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-bg-subtle)] transition-colors shadow-sm">
            <Filter size={16} className="text-[var(--color-text-muted)]" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#ff6600] text-white text-sm font-medium rounded-lg hover:bg-[#e65c00] transition-colors shadow-sm">
            <Play size={16} />
            Run All Tests
          </button>
        </div>
      </div>

      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[var(--color-border-default)] flex items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16} />
            <input 
              type="text" 
              placeholder="Search by Test Name or ID..." 
              className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-lg pl-9 pr-4 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[#ff6600] transition-colors"
            />
          </div>
          <div className="text-sm text-[var(--color-text-secondary)]">
            {TEST_SUITES.length} Suites
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--color-bg-subtle)]">
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Suite ID</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Last Run</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-subtle)]">
            {TEST_SUITES.map((suite) => (
              <tr key={suite.id} className="hover:bg-[var(--color-bg-subtle)] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                      <TestTube size={16} className="text-indigo-500" />
                    </div>
                    <div className="font-mono text-xs text-indigo-500">{suite.id}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-[var(--color-text-primary)]">{suite.name}</div>
                </td>
                <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                  {suite.type}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    suite.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                    suite.status === 'failed' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                    'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      suite.status === 'pending' ? 'bg-amber-500' :
                      suite.status === 'failed' ? 'bg-red-500' :
                      'bg-emerald-500'
                    }`}></span>
                    {suite.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                  {suite.last_run !== '-' ? new Date(suite.last_run).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)] text-right">
                  {suite.duration}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
