'use client';

import { useState } from 'react';
import { approveOrganization, rejectOrganization } from './actions';
import { Check, X, Loader2 } from 'lucide-react';

interface ApprovalButtonsProps {
  organizationId: string;
}

export default function ApprovalButtons({ organizationId }: ApprovalButtonsProps) {
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingReject, setLoadingReject] = useState(false);

  const handleApprove = async () => {
    setLoadingApprove(true);
    const res = await approveOrganization(organizationId);
    if (!res.success) {
      alert(res.error || 'Failed to approve');
    }
    setLoadingApprove(false);
  };

  const handleReject = async () => {
    const reason = window.prompt('Enter rejection reason (optional):');
    if (reason === null) return; // User cancelled
    
    setLoadingReject(true);
    const res = await rejectOrganization(organizationId, reason);
    if (!res.success) {
      alert(res.error || 'Failed to reject');
    }
    setLoadingReject(false);
  };

  return (
    <div className="flex items-center gap-2 justify-end">
      <button 
        onClick={handleApprove}
        disabled={loadingApprove || loadingReject}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-md text-xs font-medium transition-colors border border-emerald-500/20 disabled:opacity-50"
      >
        {loadingApprove ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
        Approve
      </button>
      <button 
        onClick={handleReject}
        disabled={loadingApprove || loadingReject}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-md text-xs font-medium transition-colors border border-red-500/20 disabled:opacity-50"
      >
        {loadingReject ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
        Reject
      </button>
    </div>
  );
}
