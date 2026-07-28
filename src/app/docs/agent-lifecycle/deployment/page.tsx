export default function DeploymentGoLivePage() {
  return (
    <article className="max-w-none space-y-6 text-neutral-800 dark:text-neutral-200">
      <h1 className="text-4xl font-bold mb-4 mt-0 text-neutral-900 dark:text-white">Deployment & Go Live</h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-400">
        The final steps to push your AI voice agent into production and monitor its ongoing performance.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Moving to Production</h2>
      <p className="leading-relaxed">
        Once you approve the agent during the UAT phase, we begin the production deployment process. This transitions the agent from a testing environment to handling live customer traffic.
      </p>

      <h3 className="text-xl font-semibold mt-8 mb-4 text-neutral-900 dark:text-white">1. Provisioning a Production Number</h3>
      <p className="leading-relaxed">
        KantaSwara will provision a dedicated production phone number for your agent. You can choose the area code, or optionally port an existing number over to our carrier network (Twilio).
      </p>

      <h3 className="text-xl font-semibold mt-8 mb-4 text-neutral-900 dark:text-white">2. Production Integrations</h3>
      <p className="leading-relaxed">
        If we used sandbox environments during testing (e.g., Salesforce Sandbox), we will securely swap the API keys and endpoints to point to your live production systems.
      </p>

      <h3 className="text-xl font-semibold mt-8 mb-4 text-neutral-900 dark:text-white">3. Go Live</h3>
      <p className="leading-relaxed">
        The agent is activated on the production number. You can begin routing traffic to it via marketing campaigns, website widgets, or IVR forwarding.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Continuous Monitoring</h2>
      <p className="leading-relaxed">
        Deployment is not the end of the lifecycle. KantaSwara provides continuous monitoring to ensure the agent performs optimally over time.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        <div className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">Daily Log Reviews</h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Our team reviews anonymized call transcripts to identify areas where the agent hesitated or misunderstood user intent.</p>
        </div>
        <div className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">Prompt Refinement</h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">If users ask novel questions, we tweak the system prompt and add edge-case instructions to handle them in the future.</p>
        </div>
        <div className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">Knowledge Updates</h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">You can upload new documents to the Knowledge Base at any time from your dashboard to keep the agent's brain up to date.</p>
        </div>
      </div>

      <div className="my-8 p-4 bg-orange-50 dark:bg-orange-500/10 border-l-4 border-orange-500 rounded-r-lg">
        <p className="m-0 text-orange-800 dark:text-orange-200">
          <strong>Need Changes?</strong> If your business logic changes (e.g., you launch a new product line), simply submit a revision request through the dashboard. Our team will handle the complex prompt engineering required to safely update your live agent.
        </p>
      </div>
    </article>
  );
}
