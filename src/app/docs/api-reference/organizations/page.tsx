import { CodeBlock } from '@/components/docs/CodeBlock';

export default function OrganizationsApiPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-12 max-w-[1400px] mx-auto">
      <div className="flex-1 min-w-0 space-y-6 text-neutral-800 dark:text-neutral-200">
        <h1 className="text-4xl font-bold mb-4 mt-0 text-neutral-900 dark:text-white">Organizations API</h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Manage organizations programmatically.
        </p>

        <hr className="my-8 border-neutral-200 dark:border-neutral-800" />

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Update Organization Settings</h2>
          Update your organization's timezone and callback numbers.
        
        <h3 className="text-xl font-semibold mt-8 mb-4 text-neutral-900 dark:text-white">Endpoint</h3>
        <p><code>PATCH /api/v1/organizations/settings</code></p>
      </div>

      <div className="w-full lg:w-[450px] shrink-0 space-y-8 mt-12 lg:mt-32">
        <CodeBlock 
          title="Update Settings Request"
          language="bash" 
          code={`curl -X PATCH "https://api.kantaswara.com/v1/organizations/settings" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "timezone": "Asia/Kolkata"
  }'`} 
        />

        <CodeBlock 
          title="Response (200 OK)"
          language="json" 
          code={`{
  "success": true,
  "updated_fields": ["timezone"]
}`} 
        />
      </div>
    </div>
  );
}
