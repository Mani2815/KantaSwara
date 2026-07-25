'use client';

import { useState } from 'react';
import { Trash2, Loader2, MoreVertical } from 'lucide-react';
import { deleteOrganization } from './actions';
import { toast } from 'sonner';

export default function DeleteOrganizationButton({ organizationId, organizationName }: { organizationId: string, organizationName: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete the organization "${organizationName}"? This action cannot be undone.`)) {
      setShowConfirm(false);
      return;
    }

    setIsDeleting(true);
    const result = await deleteOrganization(organizationId);
    
    if (result.success) {
      toast.success(`Organization "${organizationName}" deleted successfully`);
    } else {
      toast.error(`Failed to delete: ${result.error}`);
    }
    setIsDeleting(false);
    setShowConfirm(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setShowConfirm(!showConfirm)}
        className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors rounded-lg hover:bg-[var(--color-border-default)] opacity-0 group-hover:opacity-100 focus:opacity-100"
      >
        <MoreVertical size={16} />
      </button>

      {showConfirm && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowConfirm(false)} />
          <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-lg shadow-xl z-50 overflow-hidden">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2"
            >
              {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              {isDeleting ? 'Deleting...' : 'Delete Organization'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
