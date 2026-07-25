import React from 'react';
import { Search, Database, FileText, CheckCircle2, AlertCircle, RefreshCw, Filter, MoreVertical } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Knowledge Configuration — Delivery Console',
};

const KNOWLEDGE_DOCS = [
  { id: 'DOC-101', project: 'Acme Corp', name: 'Product_Catalog_2026.pdf', status: 'completed', chunks: 450, date: 'Oct 15, 10:30 AM' },
  { id: 'DOC-102', project: 'Acme Corp', name: 'Support_Macros.docx', status: 'processing', chunks: 0, date: 'Oct 15, 11:45 AM' },
  { id: 'DOC-103', project: 'Global Tech', name: 'Sales_Objections.txt', status: 'failed', chunks: 0, date: 'Oct 14, 09:15 AM' },
  { id: 'DOC-104', project: 'HealthPlus Inc', name: 'Triage_Guidelines_v2.pdf', status: 'completed', chunks: 1200, date: 'Oct 13, 14:20 PM' },
];

export default function KnowledgeConfigPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Knowledge Processing</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Monitor RAG document preparation, embedding queues, and indexing status.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl p-5">
          <h3 className="text-[var(--color-text-secondary)] text-sm font-medium mb-1">Pending Documents</h3>
          <span className="text-2xl font-bold text-[var(--color-text-primary)]">12</span>
        </div>
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl p-5">
          <h3 className="text-[var(--color-text-secondary)] text-sm font-medium mb-1">Embedding Queue</h3>
          <span className="text-2xl font-bold text-indigo-500">4</span>
        </div>
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl p-5">
          <h3 className="text-[var(--color-text-secondary)] text-sm font-medium mb-1">Failed Documents</h3>
          <span className="text-2xl font-bold text-red-500">2</span>
        </div>
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm rounded-2xl p-5">
          <h3 className="text-[var(--color-text-secondary)] text-sm font-medium mb-1">Completed (7 Days)</h3>
          <span className="text-2xl font-bold text-emerald-500">148</span>
        </div>
      </div>

      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[var(--color-border-default)] flex items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16} />
            <input 
              type="text" 
              placeholder="Search by Document Name or Project..." 
              className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-default)] rounded-lg pl-9 pr-4 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[#ff6600] transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-bg-base)] border border-[var(--color-border-default)] text-sm font-medium text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-bg-subtle)] transition-colors">
            <Filter size={14} className="text-[var(--color-text-muted)]" />
            Filter
          </button>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--color-bg-subtle)]">
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Document</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Project</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Vector Chunks</th>
              <th className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-subtle)]">
            {KNOWLEDGE_DOCS.map((doc) => (
              <tr key={doc.id} className="hover:bg-[var(--color-bg-subtle)] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] flex items-center justify-center flex-shrink-0">
                      <FileText size={16} className="text-[var(--color-text-secondary)]" />
                    </div>
                    <div>
                      <div className="font-medium text-sm text-[var(--color-text-primary)]">{doc.name}</div>
                      <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{doc.id} • {doc.date}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-[var(--color-text-primary)]">{doc.project}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    doc.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                    doc.status === 'processing' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' :
                    'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    {doc.status === 'completed' && <CheckCircle2 size={12} />}
                    {doc.status === 'processing' && <RefreshCw size={12} className="animate-spin" />}
                    {doc.status === 'failed' && <AlertCircle size={12} />}
                    {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-[var(--color-text-primary)]">{doc.chunks > 0 ? doc.chunks.toLocaleString() : '-'}</div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-[var(--color-text-muted)] hover:text-indigo-500 hover:bg-indigo-500/10 rounded transition-colors" title="Reprocess">
                      <RefreshCw size={18} />
                    </button>
                    <button className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] rounded transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
