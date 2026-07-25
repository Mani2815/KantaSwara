import React from 'react';
import { 
  FolderKanban, 
  Code2, 
  TestTube, 
  CheckCircle, 
  Rocket,
  Clock,
  AlertCircle,
  Database,
  UserCheck,
  Settings,
  AlertOctagon,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Delivery Dashboard — KantaSwara',
};

// Expanded Metrics
const METRICS = [
  { label: 'Live Projects', value: '34', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10', trend: '+2 this week' },
  { label: 'In Development', value: '8', icon: Code2, color: 'text-indigo-500', bg: 'bg-indigo-500/10', trend: 'On track' },
  { label: 'QA Pending', value: '5', icon: TestTube, color: 'text-amber-500', bg: 'bg-amber-500/10', trend: '-2 since yesterday' },
  { label: 'Deployments', value: '3', icon: Rocket, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: '2 scheduled today' },
  { label: 'Knowledge Queue', value: '12', icon: Database, color: 'text-purple-500', bg: 'bg-purple-500/10', trend: 'Processing' },
  { label: 'Acceptance Pending', value: '4', icon: UserCheck, color: 'text-teal-500', bg: 'bg-teal-500/10', trend: 'Waiting on client' },
  { label: 'Change Requests', value: '7', icon: Settings, color: 'text-orange-500', bg: 'bg-orange-500/10', trend: '3 new' },
  { label: 'Blocked Projects', value: '2', icon: AlertOctagon, color: 'text-red-500', bg: 'bg-red-500/10', trend: 'Requires attention' },
];

const PIPELINE_STAGES = [
  { label: 'Req. Submitted', count: 4, status: 'normal' },
  { label: 'Review', count: 2, status: 'normal' },
  { label: 'Development', count: 8, status: 'normal' },
  { label: 'Knowledge', count: 3, status: 'normal' },
  { label: 'Int. Testing', count: 2, status: 'normal' },
  { label: 'QA', count: 5, status: 'warning' },
  { label: 'Deployment', count: 3, status: 'normal' },
  { label: 'Acceptance', count: 4, status: 'normal' },
  { label: 'Production', count: 34, status: 'success' },
];

export default function DeliveryDashboardPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">Delivery Operations Console</h1>
        <p className="text-[var(--color-text-secondary)] mt-2 text-sm">
          Manage customer projects through their complete delivery lifecycle.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {METRICS.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl p-5 hover:border-[#ff6600]/30 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${metric.bg}`}>
                  <Icon size={20} className={metric.color} />
                </div>
              </div>
              <span className="text-3xl font-bold text-[var(--color-text-primary)] mb-1">{metric.value}</span>
              <h3 className="text-[var(--color-text-secondary)] text-sm font-medium mt-1">{metric.label}</h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-2">{metric.trend}</p>
            </div>
          );
        })}
      </div>

      {/* Pipeline Summary */}
      <section className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-6">Delivery Pipeline Summary</h2>
        <div className="flex items-center justify-between overflow-x-auto pb-4 gap-2">
          {PIPELINE_STAGES.map((stage, index) => (
            <React.Fragment key={stage.label}>
              <div className="flex flex-col items-center flex-shrink-0 min-w-[80px]">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2 ${
                  stage.status === 'success' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' :
                  stage.status === 'warning' ? 'border-amber-500 bg-amber-500/10 text-amber-500' :
                  'border-[var(--color-border-default)] bg-[var(--color-bg-base)] text-[var(--color-text-primary)]'
                }`}>
                  {stage.count}
                </div>
                <span className="text-xs font-medium text-[var(--color-text-secondary)] mt-3 text-center leading-tight">{stage.label}</span>
              </div>
              {index < PIPELINE_STAGES.length - 1 && (
                <div className="flex-shrink-0 text-[var(--color-border-default)]">
                  <ArrowRight size={16} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Wider) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Workload - Engineer Specific */}
          <section className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[var(--color-border-default)] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-[var(--color-text-secondary)]" />
                My Assigned Projects
              </h2>
              <Link href="/delivery-console/projects" className="text-xs text-[#ff6600] hover:underline">
                View all
              </Link>
            </div>
            <div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]">
                    <th className="px-5 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Project / Org</th>
                    <th className="px-5 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Stage</th>
                    <th className="px-5 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Target Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-subtle)]">
                  <tr className="hover:bg-[var(--color-bg-subtle)] transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-medium text-[var(--color-text-primary)] text-sm">Customer Support Bot</div>
                      <div className="text-xs text-[var(--color-text-muted)] mt-0.5">Acme Corp</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-indigo-500/10 text-indigo-500 border-indigo-500/20">
                        Knowledge Configuration
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-secondary)]">Oct 24, 2026</td>
                  </tr>
                  <tr className="hover:bg-[var(--color-bg-subtle)] transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-medium text-[var(--color-text-primary)] text-sm">Outbound Sales Lead Gen</div>
                      <div className="text-xs text-[var(--color-text-muted)] mt-0.5">Global Tech</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-amber-500/10 text-amber-500 border-amber-500/20">
                        QA Pending
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-secondary)] flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                      <span className="text-red-500">Oct 21, 2026</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Change Requests */}
          <section className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2 mb-4">
              <Settings className="w-4 h-4 text-orange-500" />
              Active Change Requests
            </h2>
            <div className="space-y-3">
              <div className="bg-[var(--color-bg-base)] border border-[var(--color-border-default)] shadow-sm rounded-xl p-4 flex items-start gap-4 hover:border-[#ff6600]/30 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[var(--color-text-primary)]">Update Greeting Prompt</h4>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">Acme Corp requested to modify the holiday greeting script before Nov 1st.</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-[var(--color-text-muted)]">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 2 hours ago</span>
                    <span className="px-2 py-0.5 rounded bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]">Prompt Config</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Right Column (Narrow) */}
        <div className="space-y-6">
          
          {/* My Workload Summary */}
          <section className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl overflow-hidden flex flex-col p-5">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">My Workload</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl p-3 text-center">
                <span className="block text-2xl font-bold text-[var(--color-text-primary)]">4</span>
                <span className="text-xs text-[var(--color-text-secondary)]">Assigned</span>
              </div>
              <div className="bg-[var(--color-bg-base)] border border-red-500/30 rounded-xl p-3 text-center">
                <span className="block text-2xl font-bold text-red-500">1</span>
                <span className="text-xs text-red-500">Overdue</span>
              </div>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <input type="checkbox" className="mt-0.5 rounded border-[var(--color-border-default)] bg-[var(--color-bg-base)] text-[#ff6600] focus:ring-[#ff6600]" />
                <span className="text-sm text-[var(--color-text-secondary)]">Review Acme Corp requirements</span>
              </li>
              <li className="flex items-start gap-3">
                <input type="checkbox" className="mt-0.5 rounded border-[var(--color-border-default)] bg-[var(--color-bg-base)] text-[#ff6600] focus:ring-[#ff6600]" />
                <span className="text-sm text-[var(--color-text-secondary)]">Fix Global Tech latency spikes</span>
              </li>
            </ul>
          </section>

          {/* Upcoming Deliveries */}
          <section className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl overflow-hidden flex flex-col p-5">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Upcoming Deliveries</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-xl p-3">
                <div>
                  <div className="text-sm font-medium text-[var(--color-text-primary)]">Staging Deployment</div>
                  <div className="text-xs text-[var(--color-text-muted)]">Global Tech</div>
                </div>
                <div className="text-sm font-semibold text-amber-500">Today</div>
              </div>
              <div className="flex justify-between items-center bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-xl p-3">
                <div>
                  <div className="text-sm font-medium text-[var(--color-text-primary)]">Production Launch</div>
                  <div className="text-xs text-[var(--color-text-muted)]">Acme Corp</div>
                </div>
                <div className="text-sm font-semibold text-emerald-500">In 3 days</div>
              </div>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
