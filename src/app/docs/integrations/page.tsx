export default function IntegrationsPage() {
  return (
    <article className="max-w-none space-y-6 text-neutral-800 dark:text-neutral-200">
      <h1 className="text-4xl font-bold mb-4 mt-0 text-neutral-900 dark:text-white">Integrations Overview</h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-400">
        Connect KantaSwara to your existing business tools to create powerful, automated workflows.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Supported Integration Categories</h2>
      
      <div className="space-y-6 my-6">
        <div className="p-6 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 shadow-sm">
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-white mb-2">Customer Relationship Management (CRM)</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">Sync leads, update contact records, and log call summaries automatically.</p>
          <ul className="list-disc pl-4 space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
            <li><strong>Salesforce:</strong> Native integration via Salesforce Connected Apps.</li>
            <li><strong>HubSpot:</strong> Connect via OAuth to create/update contacts and deals.</li>
            <li><strong>Zoho CRM:</strong> Read and write leads directly during active calls.</li>
          </ul>
        </div>

        <div className="p-6 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 shadow-sm">
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-white mb-2">Calendar & Scheduling</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">Allow your AI to check your real-time availability and book appointments on the spot.</p>
          <ul className="list-disc pl-4 space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
            <li><strong>Google Calendar:</strong> Direct calendar access for scheduling.</li>
            <li><strong>Outlook / Office 365:</strong> Enterprise calendar integration.</li>
            <li><strong>Calendly:</strong> Trigger scheduling links via SMS if a direct booking isn't possible.</li>
          </ul>
        </div>

        <div className="p-6 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 shadow-sm">
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-white mb-2">Communication (Email & SMS)</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">Send follow-up materials or confirmation messages after a call concludes.</p>
          <ul className="list-disc pl-4 space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
            <li><strong>Twilio SMS:</strong> Send text messages during or after a call.</li>
            <li><strong>SendGrid:</strong> Dispatch follow-up emails containing quotes or brochures.</li>
          </ul>
        </div>

        <div className="p-6 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 shadow-sm">
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-white mb-2">Custom APIs & Webhooks</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">For proprietary internal systems, KantaSwara supports generic webhook dispatches and REST API polling.</p>
          <ul className="list-disc pl-4 space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
            <li><strong>Pre-Call Webhooks:</strong> Fetch user data based on Caller ID before answering.</li>
            <li><strong>In-Call Function Calls:</strong> Hit your custom REST endpoints mid-conversation (e.g., checking inventory).</li>
            <li><strong>Post-Call Webhooks:</strong> Receive a JSON payload containing the transcript and call summary the moment a call ends.</li>
          </ul>
        </div>
      </div>

      <div className="my-8 p-4 bg-orange-50 dark:bg-orange-500/10 border-l-4 border-orange-500 rounded-r-lg">
        <p className="m-0 text-orange-800 dark:text-orange-200">
          <strong>How to Connect:</strong> Integration setup is managed by the AI Solutions Team during your onboarding phase. You will be prompted to provide API keys or complete OAuth flows via secure links.
        </p>
      </div>
    </article>
  );
}
