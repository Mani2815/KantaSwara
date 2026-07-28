export default function OrganizationsApiPage() {
  return (
    <article className="max-w-none space-y-6 text-neutral-800 dark:text-neutral-200">
      <h1 className="text-4xl font-bold mb-4 mt-0 text-neutral-900 dark:text-white">Organizations API</h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-400">
        Manage organization details, team members, and role assignments programmatically.
      </p>

      <div className="mt-10 border-t border-neutral-200 dark:border-neutral-800 pt-8">
        <h2 className="text-2xl font-semibold mb-2 text-neutral-900 dark:text-white">Get Organization Details</h2>
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded">GET</span>
          <code className="text-sm text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded">/organizations/{"{org_id}"}</code>
        </div>
        
        <h3 className="font-semibold mt-6 mb-2">Description</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">Retrieves the profile details, status, and subscription tier of a specific organization.</p>
        
        <h3 className="font-semibold mt-6 mb-2">Permissions</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">Requires <code>Admin</code> or <code>Manager</code> role.</p>

        <h3 className="font-semibold mt-6 mb-2">Request</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">No request body required.</p>

        <h3 className="font-semibold mt-6 mb-2">Response</h3>
        <div className="p-4 bg-neutral-900 rounded-lg overflow-x-auto text-sm text-neutral-200 font-mono mb-4">
          {`{
  "id": "org_123456",
  "name": "Acme Corp",
  "industry": "Real Estate",
  "status": "active",
  "created_at": "2026-01-15T10:30:00Z"
}`}
        </div>

        <h3 className="font-semibold mt-6 mb-2">Error Codes</h3>
        <ul className="list-disc pl-4 space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
          <li><code>401 Unauthorized</code> - Missing or invalid API key.</li>
          <li><code>403 Forbidden</code> - Insufficient permissions to access this organization.</li>
          <li><code>404 Not Found</code> - Organization ID does not exist.</li>
        </ul>
      </div>

      <div className="mt-10 border-t border-neutral-200 dark:border-neutral-800 pt-8">
        <h2 className="text-2xl font-semibold mb-2 text-neutral-900 dark:text-white">List Team Members</h2>
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded">GET</span>
          <code className="text-sm text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded">/organizations/{"{org_id}"}/members</code>
        </div>
        
        <h3 className="font-semibold mt-6 mb-2">Description</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">Returns a list of all users invited to the organization and their current RBAC roles.</p>
        
        <h3 className="font-semibold mt-6 mb-2">Permissions</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">Requires <code>Admin</code> role.</p>

        <h3 className="font-semibold mt-6 mb-2">Request</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">No request body required.</p>

        <h3 className="font-semibold mt-6 mb-2">Response</h3>
        <div className="p-4 bg-neutral-900 rounded-lg overflow-x-auto text-sm text-neutral-200 font-mono mb-4">
          {`{
  "data": [
    {
      "user_id": "usr_987",
      "email": "admin@acme.com",
      "role": "admin",
      "status": "active"
    },
    {
      "user_id": "usr_654",
      "email": "manager@acme.com",
      "role": "manager",
      "status": "pending_invite"
    }
  ],
  "total": 2
}`}
        </div>
      </div>
    </article>
  );
}
