'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

const DOCS_NAVIGATION = [
  {
    title: 'Getting Started',
    links: [
      { href: '/docs', label: 'Introduction' },
      { href: '/docs/getting-started/platform-overview', label: 'Platform Overview' },
      { href: '/docs/getting-started/features', label: 'Features' },
      { href: '/docs/getting-started/how-it-works', label: 'How KantaSwara Works' },
    ],
  },
  {
    title: 'Organization Onboarding',
    links: [
      { href: '/docs/onboarding', label: 'Register Organization' },
      { href: '/docs/onboarding/approval', label: 'Approval Process' },
      { href: '/docs/onboarding/roles', label: 'Organization Roles' },
    ],
  },
  {
    title: 'AI Agent Lifecycle',
    links: [
      { href: '/docs/agent-lifecycle', label: 'Lifecycle Overview' },
      { href: '/docs/agent-lifecycle/development', label: 'Development & Testing' },
      { href: '/docs/agent-lifecycle/deployment', label: 'Deployment & Go Live' },
    ],
  },
  {
    title: 'Dashboard Guides',
    links: [
      { href: '/docs/dashboard', label: 'Organization Dashboard' },
      { href: '/docs/dashboard/ai-solutions', label: 'AI Solutions Dashboard' },
      { href: '/docs/dashboard/super-admin', label: 'Super Admin Dashboard' },
    ],
  },
  {
    title: 'Core Features',
    links: [
      { href: '/docs/knowledge-base', label: 'Knowledge Base' },
      { href: '/docs/calls-analytics', label: 'Calls & Analytics' },
    ],
  },
  {
    title: 'Integrations',
    links: [
      { href: '/docs/integrations', label: 'Integrations Overview' },
    ],
  },
  {
    title: 'API Reference',
    links: [
      { href: '/docs/api-reference', label: 'Overview & Authentication' },
      { href: '/docs/api-reference/organizations', label: 'Organizations API' },
      { href: '/docs/api-reference/agent-requests', label: 'Agent Requests API' },
      { href: '/docs/api-reference/knowledge-base', label: 'Knowledge Base API' },
      { href: '/docs/api-reference/calls', label: 'Calls API' },
      { href: '/docs/api-reference/analytics', label: 'Analytics API' },
      { href: '/docs/api-reference/billing', label: 'Billing API' },
    ],
  },
  {
    title: 'Platform & Support',
    links: [
      { href: '/docs/platform/security', label: 'Security' },
      { href: '/docs/platform/billing', label: 'Billing' },
      { href: '/docs/support', label: 'Support' },
      { href: '/docs/release-notes', label: 'Release Notes' },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 hidden md:flex flex-col h-full shrink-0">
      <div className="h-14 flex items-center px-6 border-b border-neutral-200 dark:border-neutral-800">
        <Link href="/" className="font-bold text-orange-500">
          KantaSwara Docs
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
        {DOCS_NAVIGATION.map((section) => (
          <div key={section.title}>
            <h4 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 mb-3 px-2 m-0">
              {section.title}
            </h4>
            <ul className="space-y-1 p-0 m-0 list-none">
              {section.links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        'block px-2 py-1.5 text-sm rounded-md transition-colors',
                        isActive
                          ? 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 font-medium'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100'
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
