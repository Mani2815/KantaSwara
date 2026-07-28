export default function AISolutionsDashboardPage() {
  return (
    <article className="max-w-none space-y-6 text-neutral-800 dark:text-neutral-200">
      <h1 className="text-4xl font-bold mb-4 mt-0 text-neutral-900 dark:text-white">AI Solutions Dashboard</h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-400">
        Internal tools used by the KantaSwara delivery team to build, manage, and deploy client agents.
      </p>

      <div className="my-8 p-4 bg-orange-50 dark:bg-orange-500/10 border-l-4 border-orange-500 rounded-r-lg">
        <p className="m-0 text-orange-800 dark:text-orange-200">
          <strong>Note:</strong> This dashboard is only accessible to KantaSwara internal employees. Customer organizations cannot access these tools.
        </p>
      </div>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Delivery Console Workflow</h2>
      <p className="leading-relaxed">
        The AI Solutions dashboard (often called the Delivery Console) provides a unified view of all pending client requirements, active development tasks, and production agent health.
      </p>

      <h3 className="text-xl font-semibold mt-8 mb-4 text-neutral-900 dark:text-white">1. Requirement Queue</h3>
      <p className="leading-relaxed">
        When a customer submits a new agent requirement, it lands in the Requirement Queue. AI Engineers can review the requested use case, target audience, and provided knowledge documents before claiming the ticket and initiating a kickoff call.
      </p>

      <h3 className="text-xl font-semibold mt-8 mb-4 text-neutral-900 dark:text-white">2. Builder Interface</h3>
      <p className="leading-relaxed">
        This is the core engineering workspace where the agent is actually constructed.
      </p>
      <ul className="list-disc pl-6 space-y-2 m-0 text-neutral-700 dark:text-neutral-300">
        <li><strong>Prompt Engineering:</strong> Direct access to the system prompt configuration. Engineers define persona, strict conversational rules, and fallback behaviors.</li>
        <li><strong>Knowledge Mapping:</strong> Tools to ingest client documents, manually edit vector chunks, and test retrieval accuracy using similarity search queries.</li>
        <li><strong>Tool Configuration:</strong> Defining the JSON schemas for function calling (e.g., mapping a "BookAppointment" intent to a client's specific Calendar API format).</li>
      </ul>

      <h3 className="text-xl font-semibold mt-8 mb-4 text-neutral-900 dark:text-white">3. Internal Simulator</h3>
      <p className="leading-relaxed">
        Before handing the agent over for User Acceptance Testing (UAT), engineers use the Internal Simulator to have live audio conversations with the draft agent directly through their browser, testing edge cases and latency.
      </p>

      <h3 className="text-xl font-semibold mt-8 mb-4 text-neutral-900 dark:text-white">4. Deployment Manager</h3>
      <p className="leading-relaxed">
        Once UAT passes, the deployment manager allows engineers to provision Twilio numbers, map them to the finalized agent configuration, and switch the agent from "Development" to "Production" status.
      </p>
    </article>
  );
}
