import { CodeBlock } from '@/components/docs/CodeBlock';

export default function CallsApiPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-12 max-w-[1400px] mx-auto">
      <div className="flex-1 min-w-0 space-y-6 text-neutral-800 dark:text-neutral-200">
        <h1 className="text-4xl font-bold mb-4 mt-0 text-neutral-900 dark:text-white">Calls API</h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Trigger outbound calls and fetch transcripts.
        </p>

        <hr className="my-8 border-neutral-200 dark:border-neutral-800" />

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Trigger Outbound Call</h2>
        <p>
          Initiate a new outbound call to a prospect using a specific agent.
        </p>
        
        <h3 className="text-xl font-semibold mt-8 mb-4 text-neutral-900 dark:text-white">Endpoint</h3>
        <p><code>POST /api/v1/calls/outbound</code></p>
      </div>

      <div className="w-full lg:w-[450px] shrink-0 space-y-8 mt-12 lg:mt-32">
        <CodeBlock 
          title="Trigger Call Request"
          language="bash" 
          code={`curl -X POST "https://api.kantaswara.com/v1/calls/outbound" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent_id": "agt_998877",
    "phone_number": "+919876543210",
    "metadata": {
      "lead_source": "Facebook Ads"
    }
  }'`} 
        />

        <CodeBlock 
          title="Response (202 Accepted)"
          language="json" 
          code={`{
  "call_id": "call_123456",
  "status": "queued",
  "estimated_start": "2026-07-23T10:00:00Z"
}`} 
        />
      </div>
    </div>
  );
}
