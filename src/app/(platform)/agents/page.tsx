'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import { Bot, Plus, ClipboardList } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export default function AgentsPage() {
  return (
    <div className="space-y-8 h-[calc(100vh-12rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Assigned Agents</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Manage AI voice agents built and assigned by KantaSwara.
          </p>
        </div>
      </div>

      {/* Empty State */}
      <div className="flex-1 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] rounded-2xl p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#ff6600] bg-opacity-15 flex items-center justify-center mb-6">
          <Bot className="w-8 h-8 text-[#ff6600]" />
        </div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">No assigned agents yet</h2>
        <p className="text-[var(--color-text-secondary)] max-w-md mb-8">
          Submit your requirements and KantaSwara will build and assign an AI agent for your organization.
        </p>
        <Link href={ROUTES.AGENT_REQUEST_NEW} className="flex items-center gap-2 bg-[#ff6600] hover:bg-[#e65c00] text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-orange-500/20">
          <ClipboardList className="w-5 h-5" />
          Request AI Agent
        </Link>
      </div>
    </div>
  );
}
