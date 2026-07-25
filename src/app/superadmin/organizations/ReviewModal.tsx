'use client';
import { useState } from 'react';
import { approveOrganization, rejectOrganization } from './actions';
import { Check, X, Loader2, FileText, Building2, Globe, Phone, MapPin, Clock, Users, Languages, Info, ChevronRight, Briefcase } from 'lucide-react';
import { Modal } from '@/components/ui/Modal'; // Assuming there's a generic Modal, or I'll just build an inline one. Wait, looking at the UI list, there is a Modal in src/components/ui/Modal. Let's see if it works, or I'll build a custom overlay for safety.

interface ReviewModalProps {
  organization: any;
}

export default function ReviewModal({ organization }: ReviewModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingReject, setLoadingReject] = useState(false);

  const handleApprove = async () => {
    setLoadingApprove(true);
    const res = await approveOrganization(organization.id);
    if (!res.success) {
      alert(res.error || 'Failed to approve');
    } else {
      setIsOpen(false);
    }
    setLoadingApprove(false);
  };

  const handleReject = async () => {
    const reason = window.prompt('Enter rejection reason (optional):');
    if (reason === null) return; 
    
    setLoadingReject(true);
    const res = await rejectOrganization(organization.id, reason);
    if (!res.success) {
      alert(res.error || 'Failed to reject');
    } else {
      setIsOpen(false);
    }
    setLoadingReject(false);
  };

  const adminProfile = organization.profiles?.find((p: any) => p.role === 'org_admin') || organization.profiles?.[0];
  const bp = organization.settings?.business_profile || {};

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md text-xs font-medium transition-colors border border-zinc-700"
      >
        <FileText className="w-3.5 h-3.5" />
        Review Details
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
              <h2 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-500" />
                Review Organization: {organization.name}
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-zinc-300 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left Column */}
                <div className="space-y-6">
                  
                  {/* Account Info */}
                  <div className="bg-zinc-900/40 rounded-lg p-5 border border-zinc-800/50">
                    <h3 className="text-zinc-100 font-medium mb-4 flex items-center gap-2 border-b border-zinc-800 pb-2">
                      <Users className="w-4 h-4 text-zinc-400" /> Account Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="text-zinc-500 text-xs mb-0.5">Contact Person</div>
                        <div className="text-zinc-200">{adminProfile?.full_name || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-zinc-500 text-xs mb-0.5">Work Email</div>
                        <div className="text-zinc-200">{adminProfile?.email || 'N/A'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Organization Info */}
                  <div className="bg-zinc-900/40 rounded-lg p-5 border border-zinc-800/50">
                    <h3 className="text-zinc-100 font-medium mb-4 flex items-center gap-2 border-b border-zinc-800 pb-2">
                      <Building2 className="w-4 h-4 text-zinc-400" /> Organization Information
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-zinc-500 text-xs mb-0.5">Organization Name</div>
                          <div className="text-zinc-200">{organization.name}</div>
                        </div>
                        <div>
                          <div className="text-zinc-500 text-xs mb-0.5">Business Domain</div>
                          <div className="text-zinc-200">{bp.business_domain || 'N/A'}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="min-w-0">
                          <div className="text-zinc-500 text-xs mb-0.5">Website</div>
                          <div className="text-zinc-200 truncate" title={bp.company_website || ''}>{bp.company_website ? <a href={bp.company_website} target="_blank" rel="noreferrer" className="text-orange-500 hover:underline">{bp.company_website}</a> : 'N/A'}</div>
                        </div>
                        <div className="min-w-0">
                          <div className="text-zinc-500 text-xs mb-0.5">Contact Number</div>
                          <div className="text-zinc-200 truncate" title={bp.business_contact_number || ''}>{bp.business_contact_number || 'N/A'}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-zinc-500 text-xs mb-0.5">Location & Timezone</div>
                        <div className="text-zinc-200 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                          {[bp.city, bp.state_province, bp.country].filter(Boolean).join(', ') || 'N/A'} 
                          <span className="text-zinc-500 ml-2">({bp.timezone || 'UTC'})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  
                  {/* Business Profile */}
                  <div className="bg-zinc-900/40 rounded-lg p-5 border border-zinc-800/50">
                    <h3 className="text-zinc-100 font-medium mb-4 flex items-center gap-2 border-b border-zinc-800 pb-2">
                      <Briefcase className="w-4 h-4 text-zinc-400" /> Business Profile
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-zinc-500 text-xs mb-0.5">Company Size</div>
                        <div className="text-zinc-200">{bp.company_size || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-zinc-500 text-xs mb-0.5">Monthly Call Volume</div>
                        <div className="text-zinc-200">{bp.monthly_call_volume || 'N/A'}</div>
                      </div>
                    </div>
                  </div>

                  {/* AI Requirements */}
                  <div className="bg-zinc-900/40 rounded-lg p-5 border border-zinc-800/50">
                    <h3 className="text-zinc-100 font-medium mb-4 flex items-center gap-2 border-b border-zinc-800 pb-2">
                      <Info className="w-4 h-4 text-zinc-400" /> AI Voice Requirements
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="text-zinc-500 text-xs mb-0.5">Primary Use Case</div>
                        <div className="text-orange-400 font-medium bg-orange-500/10 inline-block px-2 py-0.5 rounded text-xs border border-orange-500/20">{bp.primary_use_case || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-zinc-500 text-xs mb-0.5">Business Description</div>
                        <div className="text-zinc-300 bg-zinc-900 p-3 rounded-md text-sm border border-zinc-800">
                          {bp.business_description || 'No description provided.'}
                        </div>
                      </div>
                      <div>
                        <div className="text-zinc-500 text-xs mb-0.5">Additional Requirements</div>
                        <div className="text-zinc-300 bg-zinc-900 p-3 rounded-md text-sm border border-zinc-800">
                          {bp.additional_requirements || 'None provided.'}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-3">
              <button 
                onClick={handleReject}
                disabled={loadingApprove || loadingReject}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-medium transition-colors border border-red-500/20 disabled:opacity-50"
              >
                {loadingReject ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                Reject Registration
              </button>
              <button 
                onClick={handleApprove}
                disabled={loadingApprove || loadingReject}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {loadingApprove ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Approve & Activate
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
