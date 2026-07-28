'use client';

import React, { useState, useRef, useEffect, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Edit2, Trash2, Key, Loader2 } from 'lucide-react';
import { revokeInternalAdmin, updateInternalAdminRole, resetInternalAdminPassword } from './actions';
import { toast } from 'sonner';

export function AdminRowActions({ adminId, currentRole }: { adminId: string, currentRole: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        right: window.innerWidth - rect.right,
      });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen && 
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    
    // Close on window resize or scroll as fixed coords will become invalid
    const handleScrollOrResize = () => setIsOpen(false);

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true); // true for capturing phase to catch inner scrolls

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen]);

  const handleEditRole = async () => {
    const newRole = currentRole === 'super_admin' ? 'solutions_admin' : 'super_admin';
    const roleName = newRole === 'super_admin' ? 'Super Admin' : 'Solutions Admin';
    
    if (confirm(`Are you sure you want to change this user's role to ${roleName}?`)) {
      startTransition(async () => {
        const result = await updateInternalAdminRole(adminId, newRole);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success(`Role updated to ${roleName}.`);
          setIsOpen(false);
        }
      });
    }
  };

  const handleResetPassword = async () => {
    if (confirm('Are you sure you want to send a password reset email to this admin?')) {
      startTransition(async () => {
        const result = await resetInternalAdminPassword(adminId);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success(`Password reset email sent to ${result.email}.`);
          setIsOpen(false);
        }
      });
    }
  };

  const handleRevoke = async () => {
    if (confirm('Are you sure you want to completely revoke access for this admin? This action cannot be undone.')) {
      startTransition(async () => {
        const result = await revokeInternalAdmin(adminId);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success('Access revoked successfully.');
          setIsOpen(false);
        }
      });
    }
  };

  return (
    <>
      <button 
        ref={buttonRef}
        onClick={toggleMenu}
        disabled={isPending}
        className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-colors disabled:opacity-50"
      >
        {isPending ? <Loader2 size={18} className="animate-spin" /> : <MoreVertical size={18} />}
      </button>

      {mounted && isOpen && typeof document !== 'undefined' && createPortal(
        <div 
          ref={menuRef}
          className="fixed w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl z-[9999] py-1 origin-top-right animate-in fade-in zoom-in-95 duration-100"
          style={{ 
            top: `${coords.top + 4}px`, 
            right: `${coords.right}px` 
          }}
        >
          <button 
            className="w-full px-4 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 flex items-center gap-2 transition-colors disabled:opacity-50"
            onClick={handleEditRole}
            disabled={isPending}
          >
            <Edit2 size={14} /> Edit Role
          </button>
          <button 
            className="w-full px-4 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 flex items-center gap-2 transition-colors disabled:opacity-50"
            onClick={handleResetPassword}
            disabled={isPending}
          >
            <Key size={14} /> Reset Password
          </button>
          <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1"></div>
          <button 
            className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 transition-colors disabled:opacity-50"
            onClick={handleRevoke}
            disabled={isPending}
          >
            <Trash2 size={14} /> Revoke Access
          </button>
        </div>,
        document.body
      )}
    </>
  );
}
