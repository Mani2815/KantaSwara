'use client';

import React, { useState } from 'react';
import { 
  Settings, FileText, Bot, MessageSquare, Workflow, Database, 
  Mic, Plug, Variable, PlayCircle, ClipboardCheck, Rocket, 
  Building, History, Clock, Users, Save, CheckCircle2, ChevronLeft
} from 'lucide-react';
import Link from 'next/link';

// Tab Definitions
const BUILDER_TABS = [
  { id: 'overview', label: 'Overview', icon: FileText, category: 'General' },
  { id: 'requirements', label: 'Requirement Summary', icon: ClipboardCheck, category: 'General' },
  { id: 'agent', label: 'Agent Configuration', icon: Bot, category: 'Configuration' },
  { id: 'prompts', label: 'Prompt Configuration', icon: MessageSquare, category: 'Configuration' },
  { id: 'workflow', label: 'Workflow Configuration', icon: Workflow, category: 'Configuration' },
  { id: 'knowledge', label: 'Knowledge Configuration', icon: Database, category: 'Configuration' },
  { id: 'voice', label: 'Voice Configuration', icon: Mic, category: 'Configuration' },
  { id: 'integrations', label: 'Integrations', icon: Plug, category: 'Configuration' },
  { id: 'variables', label: 'Variables & Rules', icon: Variable, category: 'Configuration' },
  { id: 'testing', label: 'Testing Center', icon: PlayCircle, category: 'Validation' },
  { id: 'qa', label: 'QA Checklist', icon: CheckCircle2, category: 'Validation' },
  { id: 'deployment', label: 'Deployment', icon: Rocket, category: 'Lifecycle' },
  { id: 'assignment', label: 'Organization Assignment', icon: Building, category: 'Lifecycle' },
  { id: 'versions', label: 'Version Management', icon: History, category: 'Lifecycle' },
  { id: 'history', label: 'Change History', icon: Clock, category: 'Lifecycle' },
  { id: 'notes', label: 'Notes & Collaboration', icon: Users, category: 'Lifecycle' },
];

export default function AgentBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const [activeTab, setActiveTab] = useState('overview');

  const isNew = unwrappedParams.id === 'new';
  const agentName = isNew ? 'Untitled Agent' : 'Acme Support Bot';
  const orgName = isNew ? 'Unassigned' : 'Acme Corp';

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[var(--color-bg-base)]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-[var(--color-bg-surface)] border-b border-[var(--color-border-default)] px-6 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/delivery-console/builder" className="p-2 -ml-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)] rounded-lg transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-[var(--color-text-primary)] leading-tight">{agentName}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">DRAFT</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono text-[var(--color-text-muted)] bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">{isNew ? 'v0.0.1-draft' : 'v1.0.0-draft'}</span>
            </div>
            <div className="text-xs text-[var(--color-text-muted)] mt-0.5 flex items-center gap-2">
              <span>Project: {isNew ? 'New' : unwrappedParams.id}</span>
              <span>•</span>
              <span>{orgName}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-bg-base)] border border-[var(--color-border-default)] text-sm font-medium text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-bg-subtle)] transition-colors">
            <Save size={16} />
            Save Draft
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-sm font-medium rounded-lg hover:bg-indigo-500/20 transition-colors">
            <CheckCircle2 size={16} />
            Validate
          </button>
          <button className="flex items-center gap-2 px-4 py-1.5 bg-[#ff6600] text-white text-sm font-medium rounded-lg hover:bg-[#e65c00] transition-colors shadow-sm">
            <Rocket size={16} />
            Deploy
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Vertical Tabs Sidebar */}
        <aside className="w-64 flex-shrink-0 bg-[var(--color-bg-surface)] border-r border-[var(--color-border-default)] overflow-y-auto hidden md:block">
          <nav className="p-3 space-y-6">
            {['General', 'Configuration', 'Validation', 'Lifecycle'].map(category => (
              <div key={category}>
                <h3 className="px-3 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                  {category}
                </h3>
                <ul className="space-y-0.5">
                  {BUILDER_TABS.filter(tab => tab.category === category).map(tab => (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-left ${
                          activeTab === tab.id 
                            ? 'bg-indigo-500/10 text-indigo-500 font-medium' 
                            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-primary)]'
                        }`}
                      >
                        <tab.icon size={16} className={activeTab === tab.id ? 'text-indigo-500' : 'text-[var(--color-text-muted)]'} />
                        <span className="truncate">{tab.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-[var(--color-bg-base)] p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl p-5">
                    <h3 className="text-[var(--color-text-secondary)] text-xs font-semibold uppercase tracking-wider mb-1">Organization</h3>
                    <span className="text-lg font-bold text-[var(--color-text-primary)]">Acme Corp</span>
                  </div>
                  <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl p-5">
                    <h3 className="text-[var(--color-text-secondary)] text-xs font-semibold uppercase tracking-wider mb-1">Assigned Engineer</h3>
                    <span className="text-lg font-bold text-[var(--color-text-primary)]">Alice Chen</span>
                  </div>
                  <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl p-5">
                    <h3 className="text-[var(--color-text-secondary)] text-xs font-semibold uppercase tracking-wider mb-1">Target Launch</h3>
                    <span className="text-lg font-bold text-emerald-500">Oct 24, 2026</span>
                  </div>
                </div>

                <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl p-6">
                  <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Project Meta</h2>
                  <div className="grid grid-cols-2 gap-y-4 text-sm">
                    <div><span className="text-[var(--color-text-muted)] block">Agent Name</span><span className="font-medium">Acme Support Bot</span></div>
                    <div><span className="text-[var(--color-text-muted)] block">Business Domain</span><span className="font-medium">HVAC Maintenance</span></div>
                    <div><span className="text-[var(--color-text-muted)] block">Priority</span><span className="font-medium text-[#ff6600]">High</span></div>
                    <div><span className="text-[var(--color-text-muted)] block">Customer Contact</span><span className="font-medium">j.doe@acme.corp</span></div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'requirements' && (
              <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl p-6 space-y-6">
                <div>
                  <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">Primary Use Case</h2>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    Outbound voice agent for scheduling HVAC maintenance appointments. The agent needs to call existing customers whose maintenance contracts are due for renewal, qualify their availability, and book an appointment directly into our ServiceTitan calendar.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--color-border-default)]">
                  <div>
                    <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">Business Rules</h2>
                    <ul className="list-disc pl-4 text-sm text-[var(--color-text-secondary)] space-y-1">
                      <li>Only schedule between 9 AM and 5 PM EST.</li>
                      <li>Never offer discounts unless explicitly asked.</li>
                      <li>Escalate to human if customer is angry.</li>
                    </ul>
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">Technical Constraints</h2>
                    <ul className="list-disc pl-4 text-sm text-[var(--color-text-secondary)] space-y-1">
                      <li>Integrate with ServiceTitan via API.</li>
                      <li>English (US) only for v1.0.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'agent' && (
              <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl p-6 space-y-6">
                <h2 className="text-base font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border-default)] pb-3">Agent Configuration</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Internal Agent Name</label>
                    <input type="text" defaultValue="Acme Support Bot" className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#ff6600]" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Customer Display Name</label>
                    <input type="text" defaultValue="Acme Virtual Assistant" className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#ff6600]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Agent Description</label>
                  <textarea rows={3} defaultValue="Handles inbound scheduling and triage." className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#ff6600] resize-none" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[var(--color-border-default)]">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Default Language</label>
                    <select className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#ff6600]">
                      <option>English (US)</option>
                      <option>Spanish (ES)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Fallback Behavior</label>
                    <select className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#ff6600]">
                      <option>Transfer to Human</option>
                      <option>Disconnect Call</option>
                      <option>Play Voicemail</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Call Timeout (s)</label>
                    <input type="number" defaultValue="3600" className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#ff6600]" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'prompts' && (
              <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl flex flex-col h-[600px]">
                <div className="p-4 border-b border-[var(--color-border-default)] flex gap-2 overflow-x-auto">
                  {['System', 'Greeting', 'Conversation', 'Qualification', 'Booking', 'Escalation'].map((p, i) => (
                    <button key={p} className={`px-3 py-1.5 text-xs font-medium rounded-full flex-shrink-0 transition-colors ${i === 0 ? 'bg-indigo-500/10 text-indigo-500' : 'bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}>
                      {p} Prompt
                    </button>
                  ))}
                </div>
                <div className="flex-1 p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">System Prompt Context</label>
                    <span className="text-[10px] bg-[var(--color-bg-base)] border border-[var(--color-border-default)] px-2 py-0.5 rounded text-[var(--color-text-muted)] font-mono">Tokens: ~420</span>
                  </div>
                  <textarea 
                    className="flex-1 w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl p-4 text-sm text-[var(--color-text-primary)] font-mono focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                    defaultValue="You are {{agent_name}}, a helpful assistant for {{company_name}}. You handle inbound calls strictly regarding HVAC maintenance scheduling. You must ALWAYS confirm the caller's address before proceeding..."
                  />
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-[var(--color-bg-subtle)] text-[10px] font-mono text-[var(--color-text-secondary)] rounded">{"{{agent_name}}"}</span>
                      <span className="px-2 py-1 bg-[var(--color-bg-subtle)] text-[10px] font-mono text-[var(--color-text-secondary)] rounded">{"{{company_name}}"}</span>
                    </div>
                    <button className="text-sm font-medium text-indigo-500 hover:underline">Insert Variable</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'workflow' && (
              <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl p-6 h-[600px] flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--color-text-primary)_1px,_transparent_1px)]" style={{ backgroundSize: '24px 24px' }}></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                    <Workflow size={32} className="text-indigo-500" />
                  </div>
                  <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Workflow Designer</h2>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-6 text-center max-w-sm">
                    Drag and drop nodes to define conversation logic, intent routing, and API triggers.
                  </p>
                  <button className="px-6 py-2 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition-colors shadow-sm">
                    Open Canvas Editor
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'voice' && (
              <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-[var(--color-border-default)] pb-4">
                  <div>
                    <h2 className="text-base font-bold text-[var(--color-text-primary)]">Voice Configuration</h2>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">Configure TTS provider and latency settings.</p>
                  </div>
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] text-xs font-medium text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-bg-subtle)] transition-colors">
                    <PlayCircle size={14} className="text-emerald-500" />
                    Preview Voice
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Voice Provider</label>
                    <select className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#ff6600]">
                      <option>ElevenLabs</option>
                      <option>PlayHT</option>
                      <option>Azure TTS</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Voice Model</label>
                    <select className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#ff6600]">
                      <option>Rachel (American, Professional)</option>
                      <option>Drew (American, News)</option>
                      <option>Antoni (British, Professional)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Speed (1.0x)</label>
                    <input type="range" min="0.5" max="2.0" step="0.1" defaultValue="1.0" className="w-full accent-[#ff6600]" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Pitch (0)</label>
                    <input type="range" min="-10" max="10" step="1" defaultValue="0" className="w-full accent-[#ff6600]" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Stability</label>
                    <input type="range" min="0" max="100" step="1" defaultValue="75" className="w-full accent-[#ff6600]" />
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--color-border-default)] flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-[var(--color-text-primary)]">Interruption Handling</h4>
                    <p className="text-xs text-[var(--color-text-secondary)]">Allow the user to interrupt the agent mid-sentence.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-9 h-5 bg-[var(--color-border-subtle)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-[var(--color-border-default)] pb-4">
                  <div>
                    <h2 className="text-base font-bold text-[var(--color-text-primary)]">Connected Integrations</h2>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">APIs and services this agent can trigger.</p>
                  </div>
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-[#ff6600] text-white text-xs font-medium rounded-lg hover:bg-[#e65c00] transition-colors">
                    Add Integration
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Database className="text-emerald-500" size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-[var(--color-text-primary)]">ServiceTitan Booking API</h4>
                        <p className="text-xs text-[var(--color-text-secondary)]">POST /v2/appointments</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-[10px] font-medium bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">Connected</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <MessageSquare className="text-blue-500" size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-[var(--color-text-primary)]">Twilio SMS Follow-up</h4>
                        <p className="text-xs text-[var(--color-text-secondary)]">Sends booking confirmation text</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-[10px] font-medium bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">Connected</span>
                  </div>
                </div>
              </div>
            )}

            {/* Fallback for Scaffolded Tabs */}
            {!['overview', 'requirements', 'agent', 'prompts', 'workflow', 'voice', 'integrations'].includes(activeTab) && (
              <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] flex items-center justify-center mb-4">
                  {React.createElement(BUILDER_TABS.find(t => t.id === activeTab)?.icon || Settings, { 
                    size: 32, 
                    className: 'text-[var(--color-text-muted)]' 
                  })}
                </div>
                <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
                  {BUILDER_TABS.find(t => t.id === activeTab)?.label}
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] max-w-md">
                  This configuration section is currently under construction. Schema migrations are complete and API integration is pending.
                </p>
              </div>
            )}

          </div>
        </main>

      </div>
    </div>
  );
}
