export default function AgentRequestsApiPage() {
  return (
    <article className="max-w-none space-y-6 text-neutral-800 dark:text-neutral-200">
      <h1 className="text-4xl font-bold mb-4 mt-0 text-neutral-900 dark:text-white">Agent Requests API</h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-400">
        Submit new requirements and check the build status of your AI voice agents.
      </p>

      <div className="mt-10 border-t border-neutral-200 dark:border-neutral-800 pt-8">
        <h2 className="text-2xl font-semibold mb-2 text-neutral-900 dark:text-white">Submit New Request</h2>
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded">POST</span>
          <code className="text-sm text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded">/agents/requests</code>
        </div>
        
        <h3 className="font-semibold mt-6 mb-2">Description</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">Creates a new ticket in the KantaSwara Delivery Console for our AI Solutions team to begin building your custom agent.</p>
        
        <h3 className="font-semibold mt-6 mb-2">Permissions</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">Requires <code>Admin</code> role.</p>

        <h3 className="font-semibold mt-6 mb-2">Request Body</h3>
        <div className="p-4 bg-neutral-900 rounded-lg overflow-x-auto text-sm text-neutral-200 font-mono mb-4">
          {`{
  "name": "Outbound Lead Qualifier",
  "objective": "Call new leads from HubSpot and ask 3 qualifying questions.",
  "target_audience": "B2B Marketing Managers",
  "required_integrations": ["hubspot", "calendly"]
}`}
        </div>

        <h3 className="font-semibold mt-6 mb-2">Response</h3>
        <div className="p-4 bg-neutral-900 rounded-lg overflow-x-auto text-sm text-neutral-200 font-mono mb-4">
          {`{
  "request_id": "req_778899",
  "status": "pending_review",
  "message": "Your request has been submitted successfully."
}`}
        </div>

        <h3 className="font-semibold mt-6 mb-2">Error Codes</h3>
        <ul className="list-disc pl-4 space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
          <li><code>400 Bad Request</code> - Missing required fields (e.g., objective).</li>
          <li><code>422 Unprocessable Entity</code> - Integration specified is not supported.</li>
        </ul>
      </div>

      <div className="mt-10 border-t border-neutral-200 dark:border-neutral-800 pt-8">
        <h2 className="text-2xl font-semibold mb-2 text-neutral-900 dark:text-white">Check Build Status</h2>
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded">GET</span>
          <code className="text-sm text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded">/agents/requests/{"{request_id}"}</code>
        </div>
        
        <h3 className="font-semibold mt-6 mb-2">Description</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">Checks the current development phase of an agent build request.</p>

        <h3 className="font-semibold mt-6 mb-2">Response</h3>
        <div className="p-4 bg-neutral-900 rounded-lg overflow-x-auto text-sm text-neutral-200 font-mono mb-4">
          {`{
  "request_id": "req_778899",
  "status": "in_development",
  "assigned_engineer": "Alex M.",
  "estimated_uat_date": "2026-08-01T00:00:00Z"
}`}
        </div>
      </div>
    </article>
  );
}
