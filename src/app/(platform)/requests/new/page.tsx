'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, ArrowLeft, ArrowRight, CheckCircle2, Building, Target, Phone, Book, Database, Globe } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export default function NewAgentRequestPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    description: '',
    objective: '',
    callPurpose: 'inbound',
    goals: [] as string[],
    knowledgeFiles: null,
    websiteUrl: '',
    crm: '',
    leadFields: '',
    languages: 'english',
    integrations: [] as string[],
    additionalNotes: ''
  });

  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    else router.push(ROUTES.AGENT_REQUESTS);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here we would typically save the request to Supabase
    // For now, redirect back to the list
    router.push(ROUTES.AGENT_REQUESTS);
  };

  const toggleArrayItem = (field: 'goals' | 'integrations', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <div className="flex items-center gap-4 flex-shrink-0">
        <button 
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Agent Requirement Form</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Submit your business requirements to our engineering team.</p>
        </div>
      </div>

      <div className="flex-1 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Progress Sidebar */}
        <div className="md:w-64 bg-[var(--color-bg-subtle)] border-b md:border-b-0 md:border-r border-[var(--color-border-default)] p-6">
          <div className="space-y-6">
            <StepIndicator step={1} currentStep={currentStep} title="General Info" icon={Building} />
            <StepIndicator step={2} currentStep={currentStep} title="Call Strategy" icon={Target} />
            <StepIndicator step={3} currentStep={currentStep} title="Knowledge & CRM" icon={Database} />
            <StepIndicator step={4} currentStep={currentStep} title="Setup & Launch" icon={Globe} />
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 p-6 md:p-8">
          <form onSubmit={currentStep === totalSteps ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
            
            {currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)] border-b border-[var(--color-border-subtle)] pb-2 mb-4">1. General Information</h2>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--color-text-primary)]">Agent Name <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#ff6600]" placeholder="e.g. Sales Assistant" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--color-text-primary)]">Business Domain</label>
                  <input type="text" value={formData.domain} onChange={e => setFormData({...formData, domain: e.target.value})} className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#ff6600]" placeholder="e.g. Real Estate, EdTech, Automobile" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--color-text-primary)]">Business Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#ff6600] min-h-[80px]" placeholder="Briefly describe what your business does..." />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--color-text-primary)]">Primary Objective <span className="text-red-500">*</span></label>
                  <textarea required value={formData.objective} onChange={e => setFormData({...formData, objective: e.target.value})} className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#ff6600] min-h-[80px]" placeholder="What is the main goal of this AI Agent?" />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)] border-b border-[var(--color-border-subtle)] pb-2 mb-4">2. Call Strategy</h2>
                
                <div className="space-y-3">
                  <label className="text-sm font-medium text-[var(--color-text-primary)]">Call Purpose</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {['inbound', 'outbound', 'both'].map(type => (
                      <label key={type} className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-colors ${formData.callPurpose === type ? 'bg-[#ff6600]/10 border-[#ff6600] text-[#ff6600]' : 'bg-[var(--color-bg-base)] border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-subtle)]'}`}>
                        <input type="radio" name="callPurpose" className="hidden" checked={formData.callPurpose === type} onChange={() => setFormData({...formData, callPurpose: type})} />
                        <span className="text-sm font-medium capitalize">{type} Calls</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 mt-6">
                  <label className="text-sm font-medium text-[var(--color-text-primary)]">Business Goals (Select all that apply)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {['Book Site Visits', 'Schedule Counselling', 'Book Test Drives', 'Customer Support', 'Lead Qualification', 'Follow-up Calls'].map(goal => (
                      <label key={goal} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${formData.goals.includes(goal) ? 'bg-[#ff6600]/10 border-[#ff6600]' : 'bg-[var(--color-bg-base)] border-[var(--color-border-default)] hover:border-[#ff6600]/50'}`}>
                        <input type="checkbox" className="hidden" checked={formData.goals.includes(goal)} onChange={() => toggleArrayItem('goals', goal)} />
                        <div className={`w-5 h-5 rounded flex items-center justify-center mt-0.5 border ${formData.goals.includes(goal) ? 'bg-[#ff6600] border-[#ff6600]' : 'border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]'}`}>
                          {formData.goals.includes(goal) && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`text-sm font-medium ${formData.goals.includes(goal) ? 'text-[#ff6600]' : 'text-[var(--color-text-primary)]'}`}>{goal}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)] border-b border-[var(--color-border-subtle)] pb-2 mb-4">3. Knowledge & CRM</h2>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--color-text-primary)]">Knowledge Sources (Website URL)</label>
                  <input type="url" value={formData.websiteUrl} onChange={e => setFormData({...formData, websiteUrl: e.target.value})} className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#ff6600]" placeholder="https://www.yourdomain.com/faq" />
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">You will be able to upload Documents and Brochures once the agent is assigned.</p>
                </div>

                <div className="space-y-1.5 mt-6">
                  <label className="text-sm font-medium text-[var(--color-text-primary)]">CRM Used</label>
                  <select value={formData.crm} onChange={e => setFormData({...formData, crm: e.target.value})} className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#ff6600] appearance-none">
                    <option value="">Select a CRM...</option>
                    <option value="salesforce">Salesforce</option>
                    <option value="hubspot">HubSpot</option>
                    <option value="zoho">Zoho</option>
                    <option value="custom">Custom / Internal</option>
                    <option value="none">None (Use KantaSwara internal Leads)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--color-text-primary)]">Lead Data to Collect</label>
                  <textarea value={formData.leadFields} onChange={e => setFormData({...formData, leadFields: e.target.value})} className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#ff6600] min-h-[80px]" placeholder="e.g. Name, Email, Budget, Timeline to buy" />
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)] border-b border-[var(--color-border-subtle)] pb-2 mb-4">4. Setup & Launch</h2>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--color-text-primary)]">Primary Language</label>
                  <select value={formData.languages} onChange={e => setFormData({...formData, languages: e.target.value})} className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#ff6600] appearance-none">
                    <option value="english">English (US/UK/IN)</option>
                    <option value="spanish">Spanish</option>
                    <option value="hindi">Hindi</option>
                    <option value="arabic">Arabic</option>
                    <option value="multilingual">Multilingual (Auto-detect)</option>
                  </select>
                </div>

                <div className="space-y-3 mt-6">
                  <label className="text-sm font-medium text-[var(--color-text-primary)]">Integrations Required</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {['Calendar', 'Email', 'SMS', 'Webhook', 'API'].map(integration => (
                      <label key={integration} className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${formData.integrations.includes(integration) ? 'bg-[#ff6600]/10 border-[#ff6600]' : 'bg-[var(--color-bg-base)] border-[var(--color-border-default)] hover:border-[#ff6600]/50'}`}>
                        <input type="checkbox" className="hidden" checked={formData.integrations.includes(integration)} onChange={() => toggleArrayItem('integrations', integration)} />
                        <div className={`w-4 h-4 rounded-sm flex items-center justify-center border ${formData.integrations.includes(integration) ? 'bg-[#ff6600] border-[#ff6600]' : 'border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]'}`}>
                          {formData.integrations.includes(integration) && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`text-sm ${formData.integrations.includes(integration) ? 'text-[#ff6600] font-medium' : 'text-[var(--color-text-primary)]'}`}>{integration}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 mt-6">
                  <label className="text-sm font-medium text-[var(--color-text-primary)]">Additional Notes</label>
                  <textarea value={formData.additionalNotes} onChange={e => setFormData({...formData, additionalNotes: e.target.value})} className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#ff6600] min-h-[80px]" placeholder="Any specific tone of voice, priorities, or expected launch date?" />
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
              <button 
                type="button"
                onClick={handleBack}
                className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </button>
              
              <button 
                type="submit"
                className="flex items-center gap-2 bg-[#ff6600] hover:bg-[#ff6600]/90 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                {currentStep === totalSteps ? (
                  <>Submit Requirement <CheckCircle2 className="w-4 h-4" /></>
                ) : (
                  <>Next Step <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ step, currentStep, title, icon: Icon }: { step: number; currentStep: number; title: string; icon: React.ElementType }) {
  const isCompleted = step < currentStep;
  const isCurrent = step === currentStep;
  const isPending = step > currentStep;

  return (
    <div className={`flex items-center gap-3 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-sm font-bold transition-colors ${
        isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 
        isCurrent ? 'bg-[#ff6600]/10 border-[#ff6600] text-[#ff6600]' : 
        'bg-[var(--color-bg-surface)] border-[var(--color-border-subtle)] text-[var(--color-text-muted)]'
      }`}>
        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step}
      </div>
      <div>
        <div className={`text-xs font-semibold uppercase tracking-wider ${isCurrent ? 'text-[#ff6600]' : 'text-[var(--color-text-muted)]'}`}>
          Step {step}
        </div>
        <div className={`text-sm font-medium ${isCurrent || isCompleted ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
          {title}
        </div>
      </div>
    </div>
  );
}
