export default function CallsAnalyticsPage() {
  return (
    <article className="max-w-none space-y-6 text-neutral-800 dark:text-neutral-200">
      <h1 className="text-4xl font-bold mb-4 mt-0 text-neutral-900 dark:text-white">Calls & Analytics</h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-400">
        Monitor live conversations, review historical logs, and track agent performance metrics.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Live Calls</h2>
      <p className="leading-relaxed">
        The dashboard provides a real-time feed of active calls. You can see the caller's phone number, the duration of the call, and a live transcription of the conversation as it happens. This is invaluable for QA teams ensuring new agents are handling traffic correctly.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Call History & Logs</h2>
      <p className="leading-relaxed">
        Every completed call is permanently logged in your dashboard. Selecting a specific call provides:
      </p>
      <ul className="list-disc pl-6 space-y-2 m-0 text-neutral-700 dark:text-neutral-300">
        <li><strong>Audio Recording:</strong> High-quality playback of the entire conversation.</li>
        <li><strong>Full Transcript:</strong> A speaker-diarized text log (AI vs. User).</li>
        <li><strong>Metadata:</strong> Call duration, latency metrics, and timestamp.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Performance Metrics</h2>
      <p className="leading-relaxed">
        The Analytics tab provides a high-level view of your AI's impact over time.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        <div className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">Agent Success Rate</h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">The percentage of calls where the agent successfully achieved its objective without human intervention.</p>
        </div>
        <div className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">Lead Conversion</h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">For sales agents, this tracks how many raw inquiries resulted in a qualified lead synced to your CRM.</p>
        </div>
        <div className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">Appointment Statistics</h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">The total number of meetings booked by the AI on your calendar.</p>
        </div>
        <div className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">Average Duration</h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Helps identify if callers are getting stuck in loops or resolving issues quickly.</p>
        </div>
      </div>

      <div className="my-8 p-4 bg-orange-50 dark:bg-orange-500/10 border-l-4 border-orange-500 rounded-r-lg">
        <p className="m-0 text-orange-800 dark:text-orange-200">
          <strong>Pro Tip:</strong> Use the "Export" button in the Call History view to download a CSV of your call logs for external reporting in tools like Tableau or PowerBI.
        </p>
      </div>
    </article>
  );
}
