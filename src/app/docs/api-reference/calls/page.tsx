export default function CallsApiPage() {
  return (
    <article className="max-w-none space-y-6 text-neutral-800 dark:text-neutral-200">
      <h1 className="text-4xl font-bold mb-4 mt-0 text-neutral-900 dark:text-white">Calls API</h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-400">
        Trigger outbound calls and retrieve historical call logs and transcripts.
      </p>

      <div className="mt-10 border-t border-neutral-200 dark:border-neutral-800 pt-8">
        <h2 className="text-2xl font-semibold mb-2 text-neutral-900 dark:text-white">Trigger Outbound Call</h2>
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded">POST</span>
          <code className="text-sm text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded">/calls/outbound</code>
        </div>
        
        <h3 className="font-semibold mt-6 mb-2">Description</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">Initiates an outbound phone call from a specific AI agent to a target phone number.</p>
        
        <h3 className="font-semibold mt-6 mb-2">Permissions</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">Requires <code>Admin</code> or <code>Manager</code> role.</p>

        <h3 className="font-semibold mt-6 mb-2">Request Body</h3>
        <div className="p-4 bg-neutral-900 rounded-lg overflow-x-auto text-sm text-neutral-200 font-mono mb-4">
          {`{
  "agent_id": "agt_112233",
  "recipient_number": "+1234567890",
  "metadata": {
    "crm_lead_id": "lead_9988",
    "first_name": "Jane"
  }
}`}
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">Note: The <code>metadata</code> object is passed to the agent's prompt, allowing it to personalize the greeting (e.g., "Hi Jane...").</p>

        <h3 className="font-semibold mt-6 mb-2">Response</h3>
        <div className="p-4 bg-neutral-900 rounded-lg overflow-x-auto text-sm text-neutral-200 font-mono mb-4">
          {`{
  "call_id": "call_554433",
  "status": "queued",
  "message": "Call has been queued for dialing."
}`}
        </div>
      </div>

      <div className="mt-10 border-t border-neutral-200 dark:border-neutral-800 pt-8">
        <h2 className="text-2xl font-semibold mb-2 text-neutral-900 dark:text-white">Get Call Details</h2>
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded">GET</span>
          <code className="text-sm text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded">/calls/{"{call_id}"}</code>
        </div>
        
        <h3 className="font-semibold mt-6 mb-2">Description</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">Retrieves the full details, transcript, and recording URL of a completed call.</p>

        <h3 className="font-semibold mt-6 mb-2">Permissions</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">Requires any role (<code>Admin</code>, <code>Manager</code>, or <code>Viewer</code>).</p>

        <h3 className="font-semibold mt-6 mb-2">Response</h3>
        <div className="p-4 bg-neutral-900 rounded-lg overflow-x-auto text-sm text-neutral-200 font-mono mb-4">
          {`{
  "call_id": "call_554433",
  "agent_id": "agt_112233",
  "status": "completed",
  "duration_seconds": 125,
  "disposition": "Lead Qualified",
  "recording_url": "https://storage.kantaswara.com/audio/call_554433.mp3",
  "transcript": [
    {"speaker": "agent", "text": "Hi Jane, this is KantaSwara calling..."},
    {"speaker": "user", "text": "Yes, I am interested..."}
  ]
}`}
        </div>
      </div>
    </article>
  );
}
