export default function SuperAdminDashboardPage() {
  return (
    <article className="max-w-none space-y-6 text-neutral-800 dark:text-neutral-200">
      <h1 className="text-4xl font-bold mb-4 mt-0 text-neutral-900 dark:text-white">Super Admin Dashboard</h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-400">
        Platform-wide management for KantaSwara executives and operations managers.
      </p>

      <div className="my-8 p-4 bg-orange-50 dark:bg-orange-500/10 border-l-4 border-orange-500 rounded-r-lg">
        <p className="m-0 text-orange-800 dark:text-orange-200">
          <strong>Note:</strong> This dashboard is only accessible to personnel with the `Superadmin` platform role.
        </p>
      </div>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Core Capabilities</h2>
      
      <h3 className="text-xl font-semibold mt-8 mb-4 text-neutral-900 dark:text-white">1. Organization Management</h3>
      <p className="leading-relaxed">
        Superadmins oversee all customer organizations registered on the platform.
      </p>
      <ul className="list-disc pl-6 space-y-2 m-0 text-neutral-700 dark:text-neutral-300">
        <li><strong>Approvals:</strong> Review incoming registrations and click "Approve" to activate a customer's workspace.</li>
        <li><strong>Suspensions:</strong> Temporarily suspend an organization (e.g., for non-payment) which immediately stops all their active voice agents.</li>
        <li><strong>Impersonation:</strong> Temporarily view the dashboard exactly as a specific customer sees it to help troubleshoot issues.</li>
      </ul>

      <h3 className="text-xl font-semibold mt-8 mb-4 text-neutral-900 dark:text-white">2. Platform Billing & Revenue</h3>
      <p className="leading-relaxed">
        A macro view of the platform's financial health.
      </p>
      <ul className="list-disc pl-6 space-y-2 m-0 text-neutral-700 dark:text-neutral-300">
        <li><strong>Aggregate Usage:</strong> View total voice minutes consumed across all organizations.</li>
        <li><strong>Invoice Management:</strong> Review auto-generated Stripe invoices, apply manual credits for service disruptions, or override pricing tiers for custom enterprise deals.</li>
      </ul>

      <h3 className="text-xl font-semibold mt-8 mb-4 text-neutral-900 dark:text-white">3. Global Infrastructure Monitoring</h3>
      <p className="leading-relaxed">
        Ensure the core AI engines and telephony providers are healthy.
      </p>
      <ul className="list-disc pl-6 space-y-2 m-0 text-neutral-700 dark:text-neutral-300">
        <li><strong>Provider Status:</strong> Real-time latency tracking for Text-to-Speech (TTS), Speech-to-Text (STT), and Large Language Model (LLM) providers.</li>
        <li><strong>Active Calls:</strong> A live counter of how many concurrent calls are happening across the entire platform.</li>
      </ul>

      <h3 className="text-xl font-semibold mt-8 mb-4 text-neutral-900 dark:text-white">4. User Access Management</h3>
      <p className="leading-relaxed">
        Manage internal KantaSwara employee accounts. Superadmins can invite new engineers to the Delivery Console and revoke access when employees depart.
      </p>
    </article>
  );
}
