'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Later we'll implement a full command menu using cmdk or shadcn Command.
  
  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors w-64"
      >
        <Search className="w-4 h-4" />
        <span>Search...</span>
        <div className="ml-auto flex gap-1">
          <kbd className="font-sans text-[10px] bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-300 dark:border-neutral-700">⌘</kbd>
          <kbd className="font-sans text-[10px] bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-300 dark:border-neutral-700">K</kbd>
        </div>
      </button>

      {/* Mobile Search Icon */}
      <button 
        onClick={() => setIsOpen(true)}
        className="sm:hidden p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
      >
        <Search className="w-5 h-5" />
      </button>
      
      {/* Search Modal Placeholder */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-xl rounded-xl shadow-2xl relative z-10 overflow-hidden border border-neutral-200 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
              <Search className="w-5 h-5 text-neutral-500 mr-3" />
              <input 
                autoFocus
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent border-none outline-none text-neutral-900 dark:text-neutral-100 placeholder-neutral-500"
              />
              <kbd className="font-sans text-[10px] text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700">ESC</kbd>
            </div>
            <div className="p-4 py-12 text-center text-sm text-neutral-500">
              No recent searches
            </div>
          </div>
        </div>
      )}
    </>
  );
}
