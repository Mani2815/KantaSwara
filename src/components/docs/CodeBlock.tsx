'use client';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export function CodeBlock({ code, language = 'bash', title }: CodeBlockProps) {
  return (
    <div className="rounded-xl overflow-hidden bg-[#1E1E1E] border border-neutral-800 shadow-xl">
      {title && (
        <div className="px-4 py-2 bg-[#2D2D2D] border-b border-neutral-800 text-xs font-mono text-neutral-400">
          {title}
        </div>
      )}
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono leading-relaxed text-neutral-300 whitespace-pre-wrap break-words">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
