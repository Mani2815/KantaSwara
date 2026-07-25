'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs() {
  const pathname = usePathname();
  const paths = pathname?.split('/').filter(Boolean) || [];

  return (
    <nav className="hidden md:flex items-center space-x-1 text-sm text-neutral-500 dark:text-neutral-400">
      <Link href="/dashboard" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
        <Home className="w-4 h-4" />
      </Link>
      
      {paths.map((path, index) => {
        const isLast = index === paths.length - 1;
        const href = `/${paths.slice(0, index + 1).join('/')}`;
        
        // Skip rendering org ID as a breadcrumb if it's the first element and looks like an ID
        if (index === 0 && path !== 'superadmin' && path !== 'dashboard') {
          return null; // Usually the org ID
        }

        const formattedPath = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');

        return (
          <div key={path} className="flex items-center space-x-1">
            <ChevronRight className="w-4 h-4 shrink-0 text-neutral-400 dark:text-neutral-600" />
            {isLast ? (
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {formattedPath}
              </span>
            ) : (
              <Link href={href} className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                {formattedPath}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
