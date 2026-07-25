/* eslint-disable react-hooks/purity */
import React from 'react';
import { Activity, Server, Database, PhoneCall, HardDrive, Cpu, Network, Zap } from 'lucide-react';

export const metadata = {
  title: 'Infrastructure — Super Admin',
};

// Mock data for infrastructure services
const SERVICES = [
  {
    name: 'Core API Gateway',
    status: 'operational',
    latency: '45ms',
    uptime: '99.99%',
    icon: Network,
    details: 'Routing traffic and handling API rate limits.',
  },
  {
    name: 'Supabase PostgreSQL',
    status: 'operational',
    latency: '12ms',
    uptime: '99.98%',
    icon: Database,
    details: 'Primary relational datastore and Auth provider.',
  },
  {
    name: 'ChromaDB Vector Store',
    status: 'operational',
    latency: '89ms',
    uptime: '99.95%',
    icon: HardDrive,
    details: 'Storing and retrieving RAG embeddings.',
  },
  {
    name: 'Twilio Voice API',
    status: 'degraded',
    latency: '420ms',
    uptime: '98.50%',
    icon: PhoneCall,
    details: 'Inbound and outbound PSTN connectivity.',
  },
  {
    name: 'Redis Cache (Upstash)',
    status: 'operational',
    latency: '3ms',
    uptime: '99.99%',
    icon: Zap,
    details: 'Session management and ephemeral state.',
  },
  {
    name: 'Background Workers',
    status: 'operational',
    latency: 'N/A',
    uptime: '99.9%',
    icon: Cpu,
    details: 'Processing async workflow actions and webhooks.',
  },
];

export default function InfrastructurePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Infrastructure Monitoring</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Real-time status of all microservices, databases, and third-party APIs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bg-subtle)] border border-[var(--color-border-default)] text-sm font-medium text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-border-default)] transition-colors">
            <Activity size={16} className="text-[var(--color-text-secondary)]" />
            Run Diagnostics
          </button>
        </div>
      </div>

      {/* System Resources (Mock Graphs area) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-4">CPU Usage (Aggregated)</h3>
          <div className="h-40 flex items-end justify-between gap-2">
            {/* Mock chart bars */}
            {Array.from({ length: 24 }).map((_, i) => (
              <div 
                key={i} 
                className="w-full bg-orange-500/20 rounded-t-sm"
                style={{ height: `${Math.max(15, Math.random() * 80)}%` }}
              ></div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-[var(--color-text-muted)]">
            <span>24 hours ago</span>
            <span>Now</span>
          </div>
        </div>

        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-4">Active Database Connections</h3>
          <div className="h-40 flex items-end justify-between gap-2">
            {/* Mock chart bars */}
            {Array.from({ length: 24 }).map((_, i) => (
              <div 
                key={i} 
                className="w-full bg-blue-500/20 rounded-t-sm"
                style={{ height: `${Math.max(20, Math.random() * 60)}%` }}
              ></div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-[var(--color-text-muted)]">
            <span>24 hours ago</span>
            <span>Now</span>
          </div>
        </div>
      </div>

      {/* Services Status Grid */}
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mt-8 mb-4">Service Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SERVICES.map((service) => (
          <div key={service.name} className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl p-5 shadow-sm flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  service.status === 'operational' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-500'
                }`}>
                  <service.icon size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--color-text-primary)] text-sm">{service.name}</h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{service.details}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-auto grid grid-cols-3 gap-2 pt-4 border-t border-[var(--color-border-default)]">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Status</p>
                <p className={`text-xs font-semibold ${
                  service.status === 'operational' ? 'text-emerald-400' : 'text-yellow-500'
                }`}>
                  {service.status === 'operational' ? 'Operational' : 'Degraded'}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Latency</p>
                <p className="text-xs font-medium text-[var(--color-text-primary)]">{service.latency}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Uptime</p>
                <p className="text-xs font-medium text-[var(--color-text-primary)]">{service.uptime}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
