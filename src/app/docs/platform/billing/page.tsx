export default function BillingPage() {
  return (
    <article className="max-w-none space-y-6 text-neutral-800 dark:text-neutral-200">
      <h1 className="text-4xl font-bold mb-4 mt-0 text-neutral-900 dark:text-white">Billing & Pricing</h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-400">
        Understand how KantaSwara calculates usage and bills for services.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Usage-Based Pricing</h2>
      <p className="leading-relaxed">
        KantaSwara operates on a simple, transparent, usage-based model. You only pay for the time your AI agent is actively on a phone call. We measure usage in <strong>Voice Minutes</strong>.
      </p>
      
      <div className="p-6 my-6 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50 dark:bg-neutral-900/50">
        <ul className="list-disc pl-6 space-y-3 m-0 text-neutral-700 dark:text-neutral-300">
          <li><strong>Billed by the Second:</strong> After the first 30 seconds, calls are billed precisely to the second, so you aren't penalized for short interactions.</li>
          <li><strong>All-Inclusive:</strong> The per-minute rate includes the telephony costs (Twilio), speech-to-text, large language model generation, text-to-speech, and dashboard access. There are no hidden sub-provider fees.</li>
        </ul>
      </div>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Implementation Fees</h2>
      <p className="leading-relaxed">
        Because KantaSwara is a managed service, standard deployments incur a one-time Implementation Fee. This covers the cost of our AI Solutions Team analyzing your business logic, engineering the system prompts, setting up your Knowledge Base, and conducting rigorous internal QA before handing the agent over for UAT.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Subscription Tiers</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
        <div className="p-6 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-neutral-200 dark:bg-neutral-800 px-3 py-1 text-xs font-semibold rounded-bl-lg">Growth</div>
          <h3 className="font-bold text-xl text-neutral-900 dark:text-white mb-2">Growth Tier</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">Ideal for SMBs automating support or lead qualification.</p>
          <ul className="text-sm space-y-2 text-neutral-700 dark:text-neutral-300 mb-6">
            <li className="flex items-center gap-2">✓ Standard Support (Email)</li>
            <li className="flex items-center gap-2">✓ Basic Integrations (Zapier, Webhooks)</li>
            <li className="flex items-center gap-2">✓ Up to 5 Active Agents</li>
          </ul>
        </div>

        <div className="p-6 border-2 border-orange-500 rounded-lg bg-white dark:bg-neutral-900 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-orange-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">Enterprise</div>
          <h3 className="font-bold text-xl text-neutral-900 dark:text-white mb-2">Enterprise Tier</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">For high-volume operations requiring complex workflows.</p>
          <ul className="text-sm space-y-2 text-neutral-700 dark:text-neutral-300 mb-6">
            <li className="flex items-center gap-2">✓ Dedicated Account Manager</li>
            <li className="flex items-center gap-2">✓ Custom API & CRM Integrations</li>
            <li className="flex items-center gap-2">✓ Volume Discounting on Minutes</li>
            <li className="flex items-center gap-2">✓ Unlimited Agents</li>
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Invoicing</h2>
      <p className="leading-relaxed">
        Invoices are generated automatically on the 1st of every month for the previous month's usage. Admins can download PDF invoices directly from the <strong>Settings &gt; Billing</strong> section of the Organization Dashboard.
      </p>
    </article>
  );
}
