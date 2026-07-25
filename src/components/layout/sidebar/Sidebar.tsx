'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import {
  LayoutDashboard,
  Bot,
  GitGraph,
  Library,
  Users,
  PhoneCall,
  BarChart3,
  Settings,
  LifeBuoy,
  ChevronsUpDown,
} from 'lucide-react';

const MENU_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'AI Agents', icon: Bot, href: '/agents' },
  { label: 'Workflows', icon: GitGraph, href: '/workflows' },
  { label: 'Knowledge Base', icon: Library, href: '/knowledge' },
  { label: 'CRM', icon: Users, href: '/crm' },
  { label: 'Live Calls', icon: PhoneCall, href: '/calls' },
  { label: 'Analytics', icon: BarChart3, href: '/analytics' },
];

export function Sidebar() {
  const pathname = usePathname();
  // Using a mock org ID for now. This will come from context later.
  const orgId = 'acme-corp';
  
  return (
    <aside className="w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0A0A0A] hidden md:flex flex-col h-screen fixed top-0 left-0 z-40">
      
      {/* Organization Switcher */}
      <div className="h-14 flex items-center px-4 border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 cursor-pointer transition-colors mt-0">
        <div className="flex-1 flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center text-white font-bold shrink-0 text-sm">
            A
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">Acme Corp</span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate">Free Plan</span>
          </div>
        </div>
        <ChevronsUpDown className="w-4 h-4 text-neutral-500" />
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="px-3 mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Platform</div>
        {MENU_ITEMS.map((item) => {
          const href = `/${orgId}${item.href}`;
          const isActive = pathname?.startsWith(href);
          return (
            <Link
              key={item.label}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium',
                isActive 
                  ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500' 
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-100'
              )}
            >
              <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-orange-600 dark:text-orange-500" : "text-neutral-500")} />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1 h-4 bg-orange-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 space-y-1 border-t border-neutral-200 dark:border-neutral-800">
        <Link
          href={`/${orgId}/settings`}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
          )}
        >
          <Settings className="w-4 h-4 shrink-0 text-neutral-500" />
          <span>Settings</span>
        </Link>
        <Link
          href={`/support`}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
          )}
        >
          <LifeBuoy className="w-4 h-4 shrink-0 text-neutral-500" />
          <span>Support</span>
        </Link>
      </div>

    </aside>
  );
}
