'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const DOCS_INDEX = [
  { title: 'Introduction', href: '/docs', category: 'Getting Started' },
  { title: 'Platform Overview', href: '/docs/getting-started/platform-overview', category: 'Getting Started' },
  { title: 'Features', href: '/docs/getting-started/features', category: 'Getting Started' },
  { title: 'How KantaSwara Works', href: '/docs/getting-started/how-it-works', category: 'Getting Started' },
  { title: 'Register Organization', href: '/docs/onboarding', category: 'Organization Onboarding' },
  { title: 'Approval Process', href: '/docs/onboarding/approval', category: 'Organization Onboarding' },
  { title: 'Organization Roles', href: '/docs/onboarding/roles', category: 'Organization Onboarding' },
  { title: 'Lifecycle Overview', href: '/docs/agent-lifecycle', category: 'AI Agent Lifecycle' },
  { title: 'Development & Testing', href: '/docs/agent-lifecycle/development', category: 'AI Agent Lifecycle' },
  { title: 'Deployment & Go Live', href: '/docs/agent-lifecycle/deployment', category: 'AI Agent Lifecycle' },
  { title: 'Organization Dashboard', href: '/docs/dashboard', category: 'Dashboard Guides' },
  { title: 'AI Solutions Dashboard', href: '/docs/dashboard/ai-solutions', category: 'Dashboard Guides' },
  { title: 'Super Admin Dashboard', href: '/docs/dashboard/super-admin', category: 'Dashboard Guides' },
  { title: 'Knowledge Base', href: '/docs/knowledge-base', category: 'Core Features' },
  { title: 'Calls & Analytics', href: '/docs/calls-analytics', category: 'Core Features' },
  { title: 'Integrations Overview', href: '/docs/integrations', category: 'Integrations' },
  { title: 'Overview & Authentication', href: '/docs/api-reference', category: 'API Reference' },
  { title: 'Organizations API', href: '/docs/api-reference/organizations', category: 'API Reference' },
  { title: 'Agent Requests API', href: '/docs/api-reference/agent-requests', category: 'API Reference' },
  { title: 'Knowledge Base API', href: '/docs/api-reference/knowledge-base', category: 'API Reference' },
  { title: 'Calls API', href: '/docs/api-reference/calls', category: 'API Reference' },
  { title: 'Analytics API', href: '/docs/api-reference/analytics', category: 'API Reference' },
  { title: 'Billing API', href: '/docs/api-reference/billing', category: 'API Reference' },
  { title: 'Security', href: '/docs/platform/security', category: 'Platform & Support' },
  { title: 'Billing', href: '/docs/platform/billing', category: 'Platform & Support' },
  { title: 'Support', href: '/docs/support', category: 'Platform & Support' },
  { title: 'Release Notes', href: '/docs/release-notes', category: 'Platform & Support' },
];

export function DocsSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 10);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const filteredDocs = DOCS_INDEX.filter((doc) =>
    doc.title.toLowerCase().includes(query.toLowerCase()) ||
    doc.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative hidden sm:flex items-center text-left w-64 p-2 text-sm text-neutral-500 border border-neutral-300 rounded-lg bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900 dark:border-neutral-700 dark:hover:bg-neutral-800 dark:text-neutral-400 transition-colors"
      >
        <Search className="w-4 h-4 mr-2 shrink-0" />
        <span className="truncate flex-1">Search documentation...</span>
        <kbd className="ml-2 shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
          Ctrl+K
        </kbd>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-neutral-900/50 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-xl shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center border-b border-neutral-200 dark:border-neutral-800 p-3">
              <Search className="w-5 h-5 text-neutral-500 ml-2" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search documentation..."
                className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-neutral-900 dark:text-white px-4 text-base"
              />
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filteredDocs.length > 0 ? (
                filteredDocs.map((doc, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setIsOpen(false);
                      router.push(doc.href);
                    }}
                    className="w-full flex items-center p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors text-left"
                  >
                    <FileText className="w-5 h-5 text-neutral-400 mr-3 shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-neutral-900 dark:text-white">
                        {doc.title}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {doc.category}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-neutral-500 text-sm">
                  No results found for &quot;{query}&quot;
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
