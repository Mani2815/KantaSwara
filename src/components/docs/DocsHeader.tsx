'use client';

import { Search, Menu } from 'lucide-react';
import Link from 'next/link';

export function DocsHeader() {
  return (
    <header className="h-14 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0A0A0A] flex items-center justify-between px-4 lg:px-8 shrink-0 box-border">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
          <Menu className="w-5 h-5" />
        </button>
        {/* Placeholder for Breadcrumbs if needed later */}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-neutral-400" />
          </div>
          <input
            type="text"
            className="block w-64 p-2 pl-10 text-sm text-neutral-900 border border-neutral-300 rounded-lg bg-neutral-50 focus:ring-orange-500 focus:border-orange-500 dark:bg-neutral-900 dark:border-neutral-700 dark:placeholder-neutral-400 dark:text-white dark:focus:ring-orange-500 dark:focus:border-orange-500"
            placeholder="Search documentation... (Ctrl+K)"
          />
        </div>
        <Link href="/login" className="text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-orange-500 transition-colors">
          Dashboard
        </Link>
      </div>
    </header>
  );
}
