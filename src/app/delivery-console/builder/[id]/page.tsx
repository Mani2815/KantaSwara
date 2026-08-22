'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Settings, FileText, Bot, MessageSquare, Workflow, Database, 
  Mic, Plug, Variable, PlayCircle, ClipboardCheck, Rocket, 
  Building, History, Clock, Users, Save, CheckCircle2, ChevronLeft, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/services/api';
import { toast } from 'sonner';

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
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [data, setData] = useState<any>(null);
  
  const isNew = unwrappedParams.id === 'new';

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<{ data: any }>(`/builder/agents/${unwrappedParams.id}`);
      setData(res.data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load agent configuration');
    } finally {
      setIsLoading(false);
    }
  }, [unwrappedParams.id]);

  useEffect(() => {
    if (isNew) {
      setData({
        overview: { name: 'Untitled Agent', description: '', status: 'draft', active_version: 'v0.0.1-draft', org_name: 'Unassigned', project_id: 'Unassigned' },
        agent: { language: 'en-US', fallback_behavior: 'escalate', call_timeout_seconds: 3600, max_conversation_duration: 7200, welcome_message: '' },
        prompts: { system_prompt: '' },
        workflow: {},
        voice: { provider: 'elevenlabs', speed: 1.0, pitch: 1.0, interrupt_handling: true },
        integrations: {},
        variables: [],
        validation: {},
        deployment: {},
        versions: []
      });
      setIsLoading(false);
    } else {
      loadData();
    }
  }, [unwrappedParams.id, isNew, loadData]);

  const handleSaveDraft = async () => {
    if (!data) return;
    setIsSaving(true);
    try {
      let payloadData = data[activeTab] || {};
      if (activeTab === 'overview') {
         payloadData = { name: data.overview?.name, description: data.overview?.description };
      }
      
      if (isNew) {
         const createRes = await apiClient.post<{ data: { id: string } }>('/builder/agents', { name: data.overview?.name || 'Untitled Agent' });
         const newId = createRes.data.id;
         await apiClient.patch(`/builder/agents/${newId}`, { tab: activeTab, data: payloadData });
         toast.success('Agent created and draft saved');
         router.replace(`/delivery-console/builder/${newId}`);
      } else {
         await apiClient.patch(`/builder/agents/${unwrappedParams.id}`, { tab: activeTab, data: payloadData });
         toast.success('Draft saved successfully');
         setIsSaving(false);
      }
    } catch (err: any) {
      toast.error('Failed to save draft');
      setIsSaving(false);
    }
  };

  const handleValidate = async () => {
    try {
      const res = await apiClient.post<{ data: any }>(`/builder/agents/${unwrappedParams.id}/validate`);
      setData({ ...data, validation: res.data });
      toast.success(`Validation completed. Score: ${res.data.score}`);
    } catch (err: any) {
      toast.error('Validation failed');
    }
  };

  const handlePublish = async () => {
    try {
      await apiClient.post(`/builder/agents/${unwrappedParams.id}/publish`);
      toast.success('Agent published successfully');
      loadData();
    } catch (err: any) {
      toast.error('Publish failed');
    }
  };

  const handleDeploy = async () => {
    try {
      await apiClient.post(`/builder/agents/${unwrappedParams.id}/deploy`, { environment: 'production' });
      toast.success('Deployment initiated');
      loadData();
    } catch (err: any) {
      toast.error('Deployment failed');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-[var(--color-bg-base)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
          <p className="text-sm text-[var(--color-text-muted)]">Loading Agent Workspace...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-[var(--color-bg-base)]">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Agent Not Found</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mt-2">The requested agent could not be found or failed to load.</p>
        <button onClick={() => router.push('/delivery-console/builder')} className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm">Return to Builder</button>
      </div>
    );
  }

  const { overview = {}, agent = {}, prompts = {}, workflow = {}, voice = {}, integrations = {}, variables = [], validation = {}, deployment = {}, versions = [] } = data || {};

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
              <h1 className="text-lg font-bold text-[var(--color-text-primary)] leading-tight">{overview.name || 'Untitled Agent'}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">{overview.status?.toUpperCase() || 'DRAFT'}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono text-[var(--color-text-muted)] bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">{overview.active_version || 'v0.0.1-draft'}</span>
            </div>
            <div className="text-xs text-[var(--color-text-muted)] mt-0.5 flex items-center gap-2">
              <span>Project: {overview.project_id || 'Unassigned'}</span>
              <span>•</span>
              <span>{overview.org_name || 'Unassigned'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSaveDraft} disabled={isSaving} className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-bg-base)] border border-[var(--color-border-default)] text-sm font-medium text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-bg-subtle)] transition-colors disabled:opacity-50">
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Draft
          </button>
          <button onClick={handleValidate} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-sm font-medium rounded-lg hover:bg-indigo-500/20 transition-colors">
            <CheckCircle2 size={16} />
            Validate
          </button>
          <button onClick={handlePublish} className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-bg-base)] border border-[var(--color-border-default)] text-sm font-medium text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-bg-subtle)] transition-colors">
            <ClipboardCheck size={16} />
            Publish
          </button>
          <button onClick={handleDeploy} className="flex items-center gap-2 px-4 py-1.5 bg-[#ff6600] text-white text-sm font-medium rounded-lg hover:bg-[#e65c00] transition-colors shadow-sm">
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl p-5">
                    <h3 className="text-[var(--color-text-secondary)] text-xs font-semibold uppercase tracking-wider mb-1">Organization</h3>
                    <span className="text-lg font-bold text-[var(--color-text-primary)] truncate block">{overview.org_name || 'Unassigned'}</span>
                  </div>
                  <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl p-5">
                    <h3 className="text-[var(--color-text-secondary)] text-xs font-semibold uppercase tracking-wider mb-1">Current Status</h3>
                    <span className="text-lg font-bold text-[var(--color-text-primary)] capitalize">{overview.status || 'Active'}</span>
                  </div>
                  <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl p-5">
                    <h3 className="text-[var(--color-text-secondary)] text-xs font-semibold uppercase tracking-wider mb-1">Last Deployment</h3>
                    <span className={`text-lg font-bold ${overview.last_deployment ? 'text-emerald-500' : 'text-[var(--color-text-muted)]'}`}>
                      {overview.last_deployment?.created_at ? new Date(overview.last_deployment.created_at).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                  <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl p-5">
                    <h3 className="text-[var(--color-text-secondary)] text-xs font-semibold uppercase tracking-wider mb-1">Validation Score</h3>
                    <span className={`text-lg font-bold ${validation?.checklist?.score === 100 ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {validation?.checklist?.score !== undefined ? `${validation.checklist.score}/100` : 'Not Validated'}
                    </span>
                  </div>
                </div>

                <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl p-6">
                  <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Agent Identity (Editable)</h2>
                  <div className="grid grid-cols-1 gap-y-4 text-sm">
                    <div>
                      <label className="text-[var(--color-text-muted)] block mb-1">Agent Name</label>
                      <input 
                        type="text" 
                        value={overview.name || ''} 
                        onChange={e => setData((prev: any) => ({...prev, overview: {...prev?.overview, name: e.target.value}}))}
                        className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-lg px-3 py-2 text-[var(--color-text-primary)] focus:border-indigo-500 focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-[var(--color-text-muted)] block mb-1">Description</label>
                      <textarea 
                        rows={3}
                        value={overview.description || ''} 
                        onChange={e => setData((prev: any) => ({...prev, overview: {...prev?.overview, description: e.target.value}}))}
                        className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-lg px-3 py-2 text-[var(--color-text-primary)] focus:border-indigo-500 focus:outline-none resize-none" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'agent' && (
              <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl p-6 space-y-6">
                <h2 className="text-base font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border-default)] pb-3">Agent Configuration</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Default Language</label>
                    <select 
                      value={agent.language || 'en-US'}
                      onChange={e => setData((prev: any) => ({...prev, agent: {...prev?.agent, language: e.target.value}}))}
                      className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#ff6600]"
                    >
                      <option value="en-US">English (US)</option>
                      <option value="es-ES">Spanish (ES)</option>
                      <option value="fr-FR">French (FR)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Fallback Behavior</label>
                    <select 
                      value={agent.fallback_behavior || 'escalate'}
                      onChange={e => setData((prev: any) => ({...prev, agent: {...prev?.agent, fallback_behavior: e.target.value}}))}
                      className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#ff6600]"
                    >
                      <option value="escalate">Transfer to Human</option>
                      <option value="disconnect">Disconnect Call</option>
                      <option value="voicemail">Play Voicemail</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Call Timeout (s)</label>
                    <input 
                      type="number" 
                      value={agent.call_timeout_seconds || 3600}
                      onChange={e => setData((prev: any) => ({...prev, agent: {...prev?.agent, call_timeout_seconds: parseInt(e.target.value)}}))}
                      className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#ff6600]" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Max Duration (s)</label>
                    <input 
                      type="number" 
                      value={agent.max_conversation_duration || 7200}
                      onChange={e => setData((prev: any) => ({...prev, agent: {...prev?.agent, max_conversation_duration: parseInt(e.target.value)}}))}
                      className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#ff6600]" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Welcome Message</label>
                  <textarea 
                    rows={3} 
                    value={agent.welcome_message || ''}
                    onChange={e => setData((prev: any) => ({...prev, agent: {...prev?.agent, welcome_message: e.target.value}}))}
                    className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#ff6600] resize-none" 
                  />
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
                  </div>
                  <textarea 
                    className="flex-1 w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl p-4 text-sm text-[var(--color-text-primary)] font-mono focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                    value={prompts.system_prompt || ''}
                    onChange={e => setData((prev: any) => ({...prev, prompts: {...prev?.prompts, system_prompt: e.target.value}}))}
                    placeholder="You are a helpful assistant..."
                  />
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
                    <select 
                      value={voice.provider || 'elevenlabs'}
                      onChange={e => setData((prev: any) => ({...prev, voice: {...prev?.voice, provider: e.target.value}}))}
                      className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#ff6600]"
                    >
                      <option value="elevenlabs">ElevenLabs</option>
                      <option value="playht">PlayHT</option>
                      <option value="azure">Azure TTS</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Voice Model</label>
                    <input 
                      type="text"
                      value={voice.model || ''}
                      onChange={e => setData((prev: any) => ({...prev, voice: {...prev?.voice, model: e.target.value}}))}
                      className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#ff6600]"
                      placeholder="e.g. Rachel, Drew"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Speed ({voice.speed || 1.0}x)</label>
                    <input 
                      type="range" min="0.5" max="2.0" step="0.1" 
                      value={voice.speed || 1.0} 
                      onChange={e => setData((prev: any) => ({...prev, voice: {...prev?.voice, speed: parseFloat(e.target.value)}}))}
                      className="w-full accent-[#ff6600]" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Pitch ({voice.pitch || 1.0})</label>
                    <input 
                      type="range" min="0.5" max="2.0" step="0.1" 
                      value={voice.pitch || 1.0} 
                      onChange={e => setData((prev: any) => ({...prev, voice: {...prev?.voice, pitch: parseFloat(e.target.value)}}))}
                      className="w-full accent-[#ff6600]" 
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--color-border-default)] flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-[var(--color-text-primary)]">Interruption Handling</h4>
                    <p className="text-xs text-[var(--color-text-secondary)]">Allow the user to interrupt the agent mid-sentence.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={voice.interrupt_handling ?? true}
                      onChange={e => setData((prev: any) => ({...prev, voice: {...prev?.voice, interrupt_handling: e.target.checked}}))}
                    />
                    <div className="w-9 h-5 bg-[var(--color-border-subtle)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>
            )}

            {/* Fallback for Scaffolded Tabs */}
            {!['overview', 'agent', 'prompts', 'voice'].includes(activeTab) && (
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
                  This configuration section is dynamically loaded from the database via the Builder Aggregate API. The UI fields for editing this specific section are being built.
                </p>
                <div className="mt-6 w-full max-w-md p-4 bg-[var(--color-bg-elevated)] rounded-lg text-left overflow-auto max-h-48 text-xs font-mono text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]">
                  {JSON.stringify(data[activeTab], null, 2)}
                </div>
              </div>
            )}

          </div>
        </main>

      </div>
    </div>
  );
}
