'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import { DocsSearch } from './DocsSearch';

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
        <DocsSearch />
        <Link href="/login" className="text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-orange-500 transition-colors">
          Dashboard
        </Link>
      </div>
    </header>
  );
}
