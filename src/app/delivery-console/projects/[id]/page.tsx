import React from 'react';
import { 
  FolderKanban, 
  Settings, 
  User, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  FileText, 
  MessageSquare,
  CheckCircle2,
  MoreVertical,
  Activity,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Project Details — Delivery Console',
};

// Mock data
const PROJECT = {
  id: 'PRJ-8422-911',
  request_id: 'REQ-4911-302',
  organization_id: 'Acme Corp',
  status: 'in_development',
  completion_pct: 45,
  priority: 'high',
  sla_status: 'on_track',
  target_date: '2026-10-24T00:00:00Z',
  assigned_to: 'Alice Chen',
  description: 'Outbound voice agent for scheduling HVAC maintenance appointments.',
};

const TIMELINE = [
  { stage: 'Requirement Submitted', status: 'completed', date: 'Oct 1' },
  { stage: 'Requirement Reviewed', status: 'completed', date: 'Oct 3' },
  { stage: 'Development Started', status: 'completed', date: 'Oct 5' },
  { stage: 'Prompt Configuration', status: 'in_progress', date: 'In Progress' },
  { stage: 'Knowledge Processing', status: 'pending', date: 'Est. Oct 15' },
  { stage: 'Internal Testing', status: 'pending', date: 'Est. Oct 18' },
  { stage: 'QA', status: 'pending', date: 'Est. Oct 20' },
  { stage: 'Deployment', status: 'pending', date: 'Est. Oct 24' },
];

const CUSTOMER_INTERACTIONS = [
  { id: 1, type: 'note', text: 'Clarified appointment scheduling constraints.', author: 'Alice Chen', date: '2 hours ago' },
  { id: 2, type: 'upload', text: 'Customer uploaded latest FAQ document.', author: 'System', date: 'Yesterday' },
  { id: 3, type: 'approval', text: 'Customer approved initial persona voice.', author: 'System', date: 'Oct 8, 2026' },
];

export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Breadcrumbs & Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-3">
          <Link href="/delivery-console/projects" className="hover:text-[var(--color-text-primary)] transition-colors">Projects</Link>
          <span>/</span>
          <span className="text-[var(--color-text-secondary)]">{PROJECT.id}</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight flex items-center gap-3">
              {PROJECT.organization_id} Agent Build
              <span className={`text-xs px-2 py-1 rounded font-medium border ${
                PROJECT.priority === 'high' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
              }`}>
                {PROJECT.priority.toUpperCase()}
              </span>
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-2 max-w-2xl">
              {PROJECT.description}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-sm font-medium text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-bg-subtle)] transition-colors shadow-sm">
              View Request
            </button>
            <button className="px-4 py-2 bg-[#ff6600] text-white text-sm font-medium rounded-lg hover:bg-[#e65c00] transition-colors shadow-sm">
              Open Builder
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left / Main Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Delivery Timeline Summary */}
          <section className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-6">Delivery Pipeline</h2>
            <div className="relative">
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-[var(--color-border-subtle)]" />
              <div className="space-y-6 relative">
                {TIMELINE.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="relative mt-0.5">
                      {item.status === 'completed' ? (
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white ring-4 ring-[var(--color-bg-surface)] z-10 relative">
                          <CheckCircle2 size={16} />
                        </div>
                      ) : item.status === 'in_progress' ? (
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white ring-4 ring-[var(--color-bg-surface)] z-10 relative">
                          <Activity size={16} />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] flex items-center justify-center text-[var(--color-text-muted)] ring-4 ring-[var(--color-bg-surface)] z-10 relative">
                          <div className="w-2 h-2 rounded-full bg-[var(--color-border-subtle)]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 pt-1.5 pb-2">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-medium ${
                          item.status === 'completed' ? 'text-[var(--color-text-primary)]' :
                          item.status === 'in_progress' ? 'text-indigo-500' :
                          'text-[var(--color-text-secondary)]'
                        }`}>{item.stage}</h4>
                        <span className="text-xs text-[var(--color-text-muted)]">{item.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Internal Notes */}
          <section className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[var(--color-border-default)] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--color-text-secondary)]" />
                Internal Engineering Notes
              </h2>
            </div>
            
            <div className="flex border-b border-[var(--color-border-default)] px-4 pt-4 gap-6 bg-[var(--color-bg-base)]">
              <div className="pb-3 border-b-2 border-[#ff6600] text-[#ff6600] text-sm font-medium cursor-pointer">
                Technical Notes
              </div>
              <div className="pb-3 border-b-2 border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-sm font-medium cursor-pointer">
                Business Logic
              </div>
              <div className="pb-3 border-b-2 border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-sm font-medium cursor-pointer">
                Risks / Dependencies
              </div>
            </div>

            <div className="p-5">
              <div className="space-y-4">
                <div className="bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl p-4 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  <p className="mb-2"><strong className="text-[var(--color-text-primary)]">Integration Dependency:</strong> Waiting on customer to provide Sandbox API keys for the HVAC scheduling CRM.</p>
                  <p>In the meantime, mock API responses are being used in the <code>/scheduling</code> tool configuration.</p>
                </div>
                <div className="relative">
                  <textarea 
                    className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl p-4 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[#ff6600] transition-colors resize-none"
                    rows={3}
                    placeholder="Add a new technical note..."
                  />
                  <div className="absolute bottom-3 right-3">
                    <button className="px-3 py-1.5 bg-[#ff6600]/10 text-[#ff6600] text-xs font-medium rounded hover:bg-[#ff6600]/20 transition-colors">
                      Save Note
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Right / Sidebar Column */}
        <div className="space-y-6">
          
          {/* Status Overview */}
          <section className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Project Meta</h2>
            <div className="space-y-4">
              
              <div>
                <span className="block text-xs text-[var(--color-text-muted)] mb-1">Assigned Engineer</span>
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-500 font-medium flex items-center justify-center border border-indigo-500/30">
                    {PROJECT.assigned_to.charAt(0)}
                  </div>
                  {PROJECT.assigned_to}
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--color-border-default)]">
                <span className="block text-xs text-[var(--color-text-muted)] mb-1">Target Delivery</span>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span className="text-sm text-[var(--color-text-primary)]">{new Date(PROJECT.target_date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--color-border-default)]">
                <span className="block text-xs text-[var(--color-text-muted)] mb-2">Overall Progress</span>
                <div className="flex items-center gap-3">
                  <div className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] rounded-full h-2 overflow-hidden">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${PROJECT.completion_pct}%` }}></div>
                  </div>
                  <span className="text-xs font-medium text-[var(--color-text-secondary)]">{PROJECT.completion_pct}%</span>
                </div>
              </div>

            </div>
          </section>

          {/* Customer Interactions */}
          <section className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 flex items-center justify-between">
              Customer Timeline
              <button className="text-[var(--color-text-muted)] hover:text-[#ff6600] transition-colors"><MoreVertical size={16}/></button>
            </h2>
            <div className="space-y-4">
              {CUSTOMER_INTERACTIONS.map((interaction) => (
                <div key={interaction.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] flex items-center justify-center flex-shrink-0 text-[var(--color-text-muted)]">
                    <MessageSquare size={14} />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--color-text-primary)] leading-snug">{interaction.text}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-[var(--color-text-muted)]">
                      <span>{interaction.author}</span>
                      <span>•</span>
                      <span>{interaction.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 border border-[var(--color-border-default)] rounded-lg text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] transition-colors">
              Add Update
            </button>
          </section>

        </div>

      </div>
    </div>
  );
}
