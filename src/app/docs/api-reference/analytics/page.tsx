export default function AnalyticsApiPage() {
  return (
    <article className="max-w-none space-y-6 text-neutral-800 dark:text-neutral-200">
      <h1 className="text-4xl font-bold mb-4 mt-0 text-neutral-900 dark:text-white">Analytics API</h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-400">
        Retrieve aggregated metrics and performance data for your AI agents.
      </p>

      <div className="mt-10 border-t border-neutral-200 dark:border-neutral-800 pt-8">
        <h2 className="text-2xl font-semibold mb-2 text-neutral-900 dark:text-white">Get Agent Metrics</h2>
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded">GET</span>
          <code className="text-sm text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded">/analytics/agents/{"{agent_id}"}</code>
        </div>
        
        <h3 className="font-semibold mt-6 mb-2">Description</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">Fetches aggregated performance data for a specific agent over a given time period.</p>
        
        <h3 className="font-semibold mt-6 mb-2">Permissions</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">Requires <code>Admin</code> or <code>Manager</code> role.</p>

        <h3 className="font-semibold mt-6 mb-2">Query Parameters</h3>
        <ul className="list-disc pl-4 space-y-1 text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          <li><code>start_date</code> (ISO 8601 string) - Required. The beginning of the reporting period.</li>
          <li><code>end_date</code> (ISO 8601 string) - Required. The end of the reporting period.</li>
        </ul>

        <h3 className="font-semibold mt-6 mb-2">Response</h3>
        <div className="p-4 bg-neutral-900 rounded-lg overflow-x-auto text-sm text-neutral-200 font-mono mb-4">
          {`{
  "agent_id": "agt_112233",
  "period": {
    "start": "2026-07-01T00:00:00Z",
    "end": "2026-07-31T23:59:59Z"
  },
  "metrics": {
    "total_calls": 1450,
    "success_rate_percentage": 82.5,
    "average_duration_seconds": 110,
    "total_appointments_booked": 340
  }
}`}
        </div>
      </div>
    </article>
  );
}
