'use client';

import { Bell } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils/cn';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
      >
        <Bell className="w-5 h-5" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white dark:border-[#0A0A0A]" />
      </button>

      {/* Popover */}
      {isOpen && (
        <>
          {/* Invisible backdrop to close on click outside */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white dark:bg-[#1A1A1A] border border-neutral-200 dark:border-neutral-800 z-50 overflow-hidden transform origin-top-right">
            <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Notifications</h3>
              <button className="text-xs text-orange-600 dark:text-orange-500 font-medium hover:underline">Mark all as read</button>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {/* Empty state for now */}
              <div className="p-8 text-center text-sm text-neutral-500 dark:text-neutral-400 flex flex-col items-center">
                <Bell className="w-8 h-8 mb-2 opacity-20" />
                <p>You&apos;re all caught up!</p>
              </div>
            </div>
            
            <div className="p-2 border-t border-neutral-200 dark:border-neutral-800 text-center">
              <button className="text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 w-full p-2 rounded hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                View all notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
