export default function DevelopmentTestingPage() {
  return (
    <article className="max-w-none space-y-6 text-neutral-800 dark:text-neutral-200">
      <h1 className="text-4xl font-bold mb-4 mt-0 text-neutral-900 dark:text-white">Development & Testing</h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-400">
        How the AI Solutions Team builds and tests your custom AI voice agent.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">The Build Process</h2>
      <p className="leading-relaxed">
        Once your requirements are reviewed, our engineering team begins the development phase. This involves multiple parallel tracks to ensure the agent is both conversational and functional.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm">
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">Persona & Prompt Design</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">We construct a system prompt that dictates the agent's tone (e.g., professional, empathetic) and defines the conversational boundaries it must operate within.</p>
        </div>
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm">
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">Workflow Logic</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">We map out the call flow. For example, if a user asks about pricing, the agent first asks for their company size to qualify the lead before quoting.</p>
        </div>
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm">
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">Knowledge Ingestion</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">We process your uploaded documents and website URLs, breaking them down into searchable vector embeddings for real-time retrieval during calls.</p>
        </div>
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm">
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">Custom Tools & APIs</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">We implement function calls that allow the agent to execute actions, like booking a calendar slot or pushing data to your CRM.</p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Internal Testing & QA</h2>
      <p className="leading-relaxed mb-4">
        Before you ever hear the agent, it undergoes rigorous internal testing by our QA team:
      </p>
      <ul className="list-disc pl-6 space-y-2 m-0 text-neutral-700 dark:text-neutral-300">
        <li><strong>Adversarial Testing:</strong> We attempt to make the agent hallucinate, swear, or leak prompt instructions to ensure guardrails are solid.</li>
        <li><strong>Latency Optimization:</strong> We fine-tune the Voice Activity Detection (VAD) models so the agent replies quickly but doesn't cut the user off prematurely.</li>
        <li><strong>Accuracy Checks:</strong> We ask obscure questions to verify the agent accurately retrieves data from the knowledge base rather than making things up.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">User Acceptance Testing (UAT)</h2>
      <p className="leading-relaxed">
        Once internal QA passes, we provide you with a temporary <strong>Test Phone Number</strong>. Your team can call this number to roleplay various customer scenarios. 
      </p>
      <div className="my-8 p-4 bg-orange-50 dark:bg-orange-500/10 border-l-4 border-orange-500 rounded-r-lg">
        <p className="m-0 text-orange-800 dark:text-orange-200">
          <strong>Best Practice:</strong> During UAT, have different team members test the agent. Have some speak slowly, some with accents, and some who try to interrupt the AI. Provide detailed feedback in your dashboard on what worked well and what needs adjustment.
        </p>
      </div>
    </article>
  );
}
