import { Plug } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Settings</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Manage your API keys and billing preferences.
          </p>
        </div>
      </div>

      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl overflow-hidden mt-8">
        <div className="p-6 border-b border-[var(--color-border-default)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-subtle)] flex items-center justify-center">
            <Plug className="w-5 h-5 text-[var(--color-primary)]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">API & Billing</h2>
            <p className="text-sm text-[var(--color-text-muted)]">This section is under construction.</p>
          </div>
        </div>
        <div className="p-6">
          <p className="text-[var(--color-text-secondary)]">Settings and configuration will be available here soon.</p>
        </div>
      </div>
    </div>
  );
}
