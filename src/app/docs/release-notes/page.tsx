export default function ReleaseNotesPage() {
  return (
    <article className="max-w-none space-y-6 text-neutral-800 dark:text-neutral-200">
      <h1 className="text-4xl font-bold mb-4 mt-0 text-neutral-900 dark:text-white">Release Notes</h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-400">
        Stay up to date with the latest features, improvements, and bug fixes to the KantaSwara platform.
      </p>

      <div className="mt-10 space-y-12">
        {/* Release Entry */}
        <div className="relative pl-6 sm:pl-8 border-l border-neutral-200 dark:border-neutral-800">
          <div className="absolute w-3 h-3 bg-orange-500 rounded-full -left-[6.5px] top-1.5 ring-4 ring-white dark:ring-neutral-950"></div>
          <h2 className="text-2xl font-semibold mb-1 text-neutral-900 dark:text-white">July 2026 - Official Platform Launch</h2>
          <div className="text-sm text-neutral-500 mb-4 font-mono">v1.0.0</div>
          
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-white mb-2">Platform Launch</h3>
          <p className="leading-relaxed mb-4">
            Welcome to KantaSwara! We are thrilled to announce the official 1.0 release of our B2B AI Voice Agent platform.
          </p>

          <h3 className="font-semibold text-lg text-neutral-900 dark:text-white mb-2">Core Features Released</h3>
          <ul className="list-disc pl-6 space-y-2 mb-4 text-neutral-700 dark:text-neutral-300">
            <li><strong>Organization Dashboard:</strong> Complete management interface for monitoring active voice agents, live calls, and call history.</li>
            <li><strong>Knowledge Base (RAG):</strong> Upload PDFs, text files, and website URLs to ground your agents with proprietary business data.</li>
            <li><strong>Role-Based Access Control:</strong> Invite team members as Admins, Managers, or Viewers.</li>
            <li><strong>Analytics & Metrics:</strong> Track agent success rates, average call durations, and detailed transcripts.</li>
            <li><strong>API Access:</strong> Full REST API for programmatic access to agents, billing, and call logs.</li>
          </ul>
        </div>

        {/* Release Entry */}
        <div className="relative pl-6 sm:pl-8 border-l border-neutral-200 dark:border-neutral-800">
          <div className="absolute w-3 h-3 bg-neutral-300 dark:bg-neutral-600 rounded-full -left-[6.5px] top-1.5 ring-4 ring-white dark:ring-neutral-950"></div>
          <h2 className="text-2xl font-semibold mb-1 text-neutral-900 dark:text-white">June 2026 - Public Beta</h2>
          <div className="text-sm text-neutral-500 mb-4 font-mono">v0.9.0</div>
          
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-white mb-2">Beta Milestones</h3>
          <ul className="list-disc pl-6 space-y-2 mb-4 text-neutral-700 dark:text-neutral-300">
            <li>Successfully completed User Acceptance Testing (UAT) for early enterprise partners.</li>
            <li>Finalized the core telephony integration and achieved sub-second latency on voice generation.</li>
            <li>Deployed the internal AI Solutions Delivery Console for our engineering team.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
