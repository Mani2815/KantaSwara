'use client';

import { ReactNode } from 'react';
import { Sidebar } from '../sidebar/Sidebar';
import { GlobalHeader } from '../header/GlobalHeader';

interface PlatformLayoutProps {
  children: ReactNode;
}

export function PlatformLayout({ children }: PlatformLayoutProps) {
  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-black text-neutral-900 dark:text-neutral-100 font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 md:ml-64 relative">
        <GlobalHeader />
        
        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
