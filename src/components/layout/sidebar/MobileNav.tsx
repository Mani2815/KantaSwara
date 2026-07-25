'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { Menu, X, LayoutDashboard, Bot, GitGraph, Library, Users, PhoneCall, BarChart3, Settings, LifeBuoy } from 'lucide-react';

const MENU_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'AI Agents', icon: Bot, href: '/agents' },
  { label: 'Workflows', icon: GitGraph, href: '/workflows' },
  { label: 'Knowledge Base', icon: Library, href: '/knowledge' },
  { label: 'CRM', icon: Users, href: '/crm' },
  { label: 'Live Calls', icon: PhoneCall, href: '/calls' },
  { label: 'Analytics', icon: BarChart3, href: '/analytics' },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const orgId = 'acme-corp'; // Mock org ID

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="md:hidden p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Sidebar */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-[#0A0A0A] border-r border-neutral-200 dark:border-neutral-800 shadow-xl">
            <div className="absolute top-0 right-0 -mr-12 pt-4">
              <button
                onClick={() => setIsOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white bg-neutral-900"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* Header */}
            <div className="h-14 flex items-center px-4 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center text-white font-bold text-sm">
                  A
                </div>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">Acme Corp</span>
              </div>
            </div>

            {/* Links */}
            <div className="flex-1 h-0 overflow-y-auto pt-5 pb-4 px-3 space-y-1">
              <div className="px-3 mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Platform</div>
              {MENU_ITEMS.map((item) => {
                const href = `/${orgId}${item.href}`;
                const isActive = pathname?.startsWith(href);
                return (
                  <Link
                    key={item.label}
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-base font-medium',
                      isActive 
                        ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500' 
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-100'
                    )}
                  >
                    <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-orange-600 dark:text-orange-500" : "text-neutral-500")} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-neutral-200 dark:border-neutral-800">
              <Link
                href={`/${orgId}/settings`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-base font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
              >
                <Settings className="w-5 h-5 text-neutral-500" />
                <span>Settings</span>
              </Link>
              <Link
                href={`/support`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-base font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
              >
                <LifeBuoy className="w-5 h-5 text-neutral-500" />
                <span>Support</span>
              </Link>
            </div>
          </div>
          
          <div className="shrink-0 w-14" aria-hidden="true" />
        </div>
      )}
    </>
  );
}
