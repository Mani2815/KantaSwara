export default function OrganizationRolesPage() {
  return (
    <article className="max-w-none space-y-6 text-neutral-800 dark:text-neutral-200">
      <h1 className="text-4xl font-bold mb-4 mt-0 text-neutral-900 dark:text-white">Organization Roles</h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-400">
        Manage access and permissions using KantaSwara's Role-Based Access Control (RBAC) system.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Role-Based Access Control (RBAC)</h2>
      <p className="leading-relaxed">
        KantaSwara enforces strict role-based access control within your organization. Every invited team member must be assigned a role that determines what they can view and modify on the dashboard.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Available Roles</h2>
      
      <div className="overflow-x-auto my-6">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white">
              <th className="py-3 px-4 font-semibold">Role</th>
              <th className="py-3 px-4 font-semibold">Description</th>
              <th className="py-3 px-4 font-semibold">Key Permissions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
              <td className="py-4 px-4 font-medium text-neutral-900 dark:text-white align-top">Admin</td>
              <td className="py-4 px-4 text-neutral-600 dark:text-neutral-400 align-top">Full access to the organization's workspace, settings, and billing.</td>
              <td className="py-4 px-4 text-neutral-600 dark:text-neutral-400 align-top">
                <ul className="list-disc pl-4 space-y-1 m-0">
                  <li>Manage billing and invoices</li>
                  <li>Invite/remove users</li>
                  <li>Submit AI agent requirements</li>
                  <li>View all call logs and analytics</li>
                </ul>
              </td>
            </tr>
            <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
              <td className="py-4 px-4 font-medium text-neutral-900 dark:text-white align-top">Manager</td>
              <td className="py-4 px-4 text-neutral-600 dark:text-neutral-400 align-top">Operational access to manage AI agents and view performance, but no access to billing.</td>
              <td className="py-4 px-4 text-neutral-600 dark:text-neutral-400 align-top">
                <ul className="list-disc pl-4 space-y-1 m-0">
                  <li>Update Knowledge Base documents</li>
                  <li>View call transcripts and recordings</li>
                  <li>Configure CRM integrations</li>
                  <li>Cannot manage billing</li>
                </ul>
              </td>
            </tr>
            <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
              <td className="py-4 px-4 font-medium text-neutral-900 dark:text-white align-top">Operator / Viewer</td>
              <td className="py-4 px-4 text-neutral-600 dark:text-neutral-400 align-top">Read-only access for monitoring live calls and reviewing transcripts.</td>
              <td className="py-4 px-4 text-neutral-600 dark:text-neutral-400 align-top">
                <ul className="list-disc pl-4 space-y-1 m-0">
                  <li>View active agents</li>
                  <li>Listen to call recordings</li>
                  <li>View basic analytics</li>
                  <li>Cannot make any changes</li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Managing Roles</h2>
      <p className="leading-relaxed mb-4">
        Only <strong>Admins</strong> can manage roles. To change a team member's role:
      </p>
      <ol className="list-decimal pl-6 space-y-2 m-0 text-neutral-700 dark:text-neutral-300">
        <li>Log in to the Organization Dashboard.</li>
        <li>Navigate to <strong>Settings</strong> &gt; <strong>Team Members</strong>.</li>
        <li>Find the user in the list and click the edit icon (pencil).</li>
        <li>Select the new role from the dropdown menu and click <strong>Save</strong>.</li>
      </ol>
      <p className="leading-relaxed mt-4">
        Changes take effect immediately upon their next login or page refresh.
      </p>
    </article>
  );
}
