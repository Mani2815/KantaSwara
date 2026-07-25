import { CodeBlock } from '@/components/docs/CodeBlock';

export default function APIReferencePage() {
  return (
    <div className="flex flex-col lg:flex-row gap-12 max-w-[1400px] mx-auto">
      <div className="flex-1 min-w-0 prose prose-neutral dark:prose-invert">
        <h1>API Reference</h1>
        <p className="lead">
          The KantaSwara REST API allows you to programmatically manage organizations, query call analytics, and trigger outbound calls.
        </p>

        <hr className="my-8 border-neutral-200 dark:border-neutral-800" />

        <h2 id="authentication">Authentication</h2>
        <p>
          Authenticate your API requests by including your API key in the <code>Authorization</code> header.
        </p>
        <p>
          You can generate an API key from the Settings page in your Dashboard. Keep your API key secure; do not expose it in client-side code.
        </p>

        <hr className="my-8 border-neutral-200 dark:border-neutral-800" />

        <h2 id="get-organization">Get Organization Details</h2>
        <p>
          Retrieve the details of your organization, including usage limits and active plan.
        </p>
        
        <h3>Endpoint</h3>
        <p><code>GET /api/v1/organizations/me</code></p>
      </div>

      <div className="w-full lg:w-[450px] shrink-0 space-y-8 mt-12 lg:mt-32">
        <CodeBlock 
          title="Authentication Example"
          language="bash" 
          code={`curl -X GET "https://api.kantaswara.com/v1/organizations/me" \\
  -H "Authorization: Bearer YOUR_API_KEY"`} 
        />

        <CodeBlock 
          title="Response (200 OK)"
          language="json" 
          code={`{
  "id": "org_12345",
  "name": "Acme Corp",
  "plan": "enterprise",
  "max_agents": 5,
  "is_active": true
}`} 
        />
      </div>
    </div>
  );
}
