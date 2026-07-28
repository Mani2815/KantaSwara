export default function AgentLifecyclePage() {
  return (
    <article className="max-w-none space-y-6 text-neutral-800 dark:text-neutral-200">
      <h1 className="text-4xl font-bold mb-4 mt-0 text-neutral-900 dark:text-white">AI Agent Lifecycle</h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-400">
        Understand every stage of your custom AI Voice Agent's lifecycle, from initial requirement to continuous optimization.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Lifecycle Stages</h2>
      
      <div className="space-y-4 my-6">
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-1">
            <span className="flex items-center justify-center h-8 w-8 rounded-full border-2 border-orange-500 text-orange-500 font-bold text-sm">1</span>
          </div>
          <div className="ml-4">
            <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">Requirement & Business Analysis</h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">You submit a detailed requirement. Our AI Solutions Team analyzes the business logic, target audience, and desired outcomes to scope the project.</p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex-shrink-0 mt-1">
            <span className="flex items-center justify-center h-8 w-8 rounded-full border-2 border-orange-500 text-orange-500 font-bold text-sm">2</span>
          </div>
          <div className="ml-4">
            <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">Prompt & Workflow Design</h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">We engineer the system prompts to give the agent its persona and establish the conversational state machine (workflow design) so it can handle interruptions and specific intents.</p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex-shrink-0 mt-1">
            <span className="flex items-center justify-center h-8 w-8 rounded-full border-2 border-orange-500 text-orange-500 font-bold text-sm">3</span>
          </div>
          <div className="ml-4">
            <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">Knowledge Configuration</h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">Your uploaded documents are processed into vector embeddings. We test the agent's ability to retrieve and synthesize accurate answers from this knowledge base.</p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex-shrink-0 mt-1">
            <span className="flex items-center justify-center h-8 w-8 rounded-full border-2 border-orange-500 text-orange-500 font-bold text-sm">4</span>
          </div>
          <div className="ml-4">
            <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">Integration Setup</h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">Webhooks and API connections are established so the agent can read from or write to your CRM during a live call.</p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex-shrink-0 mt-1">
            <span className="flex items-center justify-center h-8 w-8 rounded-full border-2 border-orange-500 text-orange-500 font-bold text-sm">5</span>
          </div>
          <div className="ml-4">
            <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">Testing & QA</h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">The agent is rigorously tested internally for edge cases, hallucination checks, and latency. You are then provided a test number for User Acceptance Testing (UAT).</p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex-shrink-0 mt-1">
            <span className="flex items-center justify-center h-8 w-8 rounded-full border-2 border-orange-500 text-orange-500 font-bold text-sm">6</span>
          </div>
          <div className="ml-4">
            <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">Deployment & Monitoring</h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">The agent is assigned a production number and goes live. We monitor the first batches of calls to ensure stability.</p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex-shrink-0 mt-1">
            <span className="flex items-center justify-center h-8 w-8 rounded-full border-2 border-orange-500 text-orange-500 font-bold text-sm">7</span>
          </div>
          <div className="ml-4">
            <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">Continuous Improvement</h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">Call transcripts are regularly audited. The knowledge base and prompts are iteratively updated to handle new customer objections or queries.</p>
          </div>
        </div>
      </div>
    </article>
  );
}
