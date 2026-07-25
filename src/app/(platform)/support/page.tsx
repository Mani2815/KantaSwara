import React from 'react';
import { LifeBuoy, Book, MessageSquare, Mail, Phone, ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'Support — KantaSwara',
};

export default function SupportPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">Support & Help Center</h1>
        <p className="text-[var(--color-text-secondary)] mt-2">
          Find answers, read documentation, or get in touch with our team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Documentation Card */}
        <a href="#" className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-2xl p-6 shadow-sm hover:border-[#ff6600]/30 hover:shadow transition-all group flex flex-col">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 text-indigo-500">
            <Book size={24} />
          </div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">Documentation</h3>
          <p className="text-sm text-[var(--color-text-secondary)] flex-grow">
            Browse our comprehensive guides, API references, and step-by-step tutorials.
          </p>
          <div className="mt-4 flex items-center text-sm font-medium text-indigo-500 group-hover:text-indigo-400 transition-colors">
            Read the docs <ExternalLink size={14} className="ml-1" />
          </div>
        </a>

        {/* Live Chat Card */}
        <button className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-2xl p-6 shadow-sm hover:border-[#ff6600]/30 hover:shadow transition-all group flex flex-col text-left">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-500">
            <MessageSquare size={24} />
          </div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">Live Chat</h3>
          <p className="text-sm text-[var(--color-text-secondary)] flex-grow">
            Connect directly with our support team in real-time for quick assistance.
          </p>
          <div className="mt-4 flex items-center text-sm font-medium text-emerald-500 group-hover:text-emerald-400 transition-colors">
            Start a chat &rarr;
          </div>
        </button>

        {/* Email Support Card */}
        <a href="mailto:support@kantaswara.com" className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-2xl p-6 shadow-sm hover:border-[#ff6600]/30 hover:shadow transition-all group flex flex-col">
          <div className="w-12 h-12 rounded-xl bg-[#ff6600]/10 flex items-center justify-center mb-4 text-[#ff6600]">
            <Mail size={24} />
          </div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">Email Support</h3>
          <p className="text-sm text-[var(--color-text-secondary)] flex-grow">
            Send us a detailed message. We typically respond within 24 hours.
          </p>
          <div className="mt-4 flex items-center text-sm font-medium text-[#ff6600] group-hover:text-[#ff6600]/80 transition-colors">
            support@kantaswara.com
          </div>
        </a>

      </div>

      {/* Enterprise Support Section */}
      <div className="mt-12 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-2xl p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-center flex-shrink-0 text-[var(--color-text-primary)]">
          <Phone size={32} />
        </div>
        <div className="flex-grow text-center sm:text-left">
          <h3 className="text-xl font-bold text-[var(--color-text-primary)]">Enterprise Dedicated Support</h3>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Need an SLA, dedicated success manager, or phone support? Upgrade to our Enterprise plan.
          </p>
        </div>
        <div>
          <button className="px-6 py-2.5 bg-[var(--color-bg-primary)] text-white font-medium rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap bg-black dark:bg-white dark:text-black">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
}
