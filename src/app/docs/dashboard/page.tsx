export default function OrganizationDashboardPage() {
  return (
    <article className="max-w-none space-y-6 text-neutral-800 dark:text-neutral-200">
      <h1 className="text-4xl font-bold mb-4 mt-0 text-neutral-900 dark:text-white">Organization Dashboard</h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-400">
        Your central hub for managing your AI agents, viewing analytics, and configuring your workspace.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Dashboard Modules</h2>
      
      <div className="space-y-6 my-6">
        <div className="p-6 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 shadow-sm">
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-white mb-2">1. Active Agents</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">View the status of all your deployed voice agents. You can see their current call volume, average handling time, and active status.</p>
          <ul className="list-disc pl-4 space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
            <li><strong>Pause/Resume:</strong> Temporarily stop an agent from taking calls if your human team is overwhelmed or if a system goes down.</li>
            <li><strong>Agent Settings:</strong> View the specific phone numbers assigned to each agent.</li>
          </ul>
        </div>

        <div className="p-6 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 shadow-sm">
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-white mb-2">2. Live Calls & Transcripts</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">Monitor conversations as they happen in real-time or review historical call logs.</p>
          <ul className="list-disc pl-4 space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
            <li><strong>Audio Recordings:</strong> Play back the full audio of any completed call.</li>
            <li><strong>Transcripts:</strong> Read the text version of the conversation with speaker diarization (User vs. Agent).</li>
            <li><strong>Dispositions:</strong> See the AI's automatically generated call summary and outcome tag (e.g., "Lead Qualified", "Left Voicemail").</li>
          </ul>
        </div>

        <div className="p-6 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 shadow-sm">
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-white mb-2">3. Knowledge Base</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">Manage the proprietary data your agents use to answer questions.</p>
          <ul className="list-disc pl-4 space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
            <li><strong>Upload Files:</strong> Add PDFs, Word documents, or text files containing product info or FAQs.</li>
            <li><strong>Sync Status:</strong> Check if a recently uploaded document has been fully vectorized and is ready for the agent to use.</li>
          </ul>
        </div>

        <div className="p-6 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 shadow-sm">
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-white mb-2">4. Settings & Billing</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">Manage your organization's administrative details.</p>
          <ul className="list-disc pl-4 space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
            <li><strong>Team Members:</strong> Invite colleagues and assign them Admin, Manager, or Viewer roles.</li>
            <li><strong>Billing:</strong> Add credit cards, view current Voice Minute usage, and download past invoices.</li>
            <li><strong>API Keys:</strong> Generate secure tokens for custom integrations.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
