import type { Metadata } from 'next';
import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { DocsHeader } from '@/components/docs/DocsHeader';

export const metadata: Metadata = {
  title: 'KantaSwara Documentation',
  description: 'Guides, API Reference, and Integration Docs for KantaSwara',
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#0A0A0A]">
      <DocsSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <DocsHeader />
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="mx-auto max-w-4xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
