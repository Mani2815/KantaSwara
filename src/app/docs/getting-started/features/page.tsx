export default function FeaturesPage() {
  return (
    <article className="max-w-none space-y-6 text-neutral-800 dark:text-neutral-200">
      <h1 className="text-4xl font-bold mb-4 mt-0 text-neutral-900 dark:text-white">Features</h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-400">
        Explore every major capability that powers the KantaSwara platform, designed to deliver enterprise-grade AI voice solutions.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">AI Voice Agents</h2>
      <p className="leading-relaxed">
        Our core offering is highly intelligent, conversational AI Voice Agents that engage customers in natural, human-like dialogue. These agents handle interruptions gracefully, recognize intent, and navigate complex conversational flows to achieve specific business goals like qualifying leads or resolving support issues.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Knowledge Base Integration</h2>
      <p className="leading-relaxed">
        Ground your AI agents on your proprietary data. Upload documents (PDF, DOCX, TXT), link website URLs, or add raw text to the Knowledge Base. KantaSwara processes and vectors this data, ensuring your agents answer questions accurately based solely on the information you provide, mitigating hallucinations.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Workflow Automation</h2>
      <p className="leading-relaxed">
        Beyond just talking, KantaSwara agents take action. Through Workflow Automation, agents can execute tasks during or after a call—such as sending a follow-up SMS, checking database availability, or routing the call to a human agent if a specific condition is met.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Prompt Engineering & Guardrails</h2>
      <p className="leading-relaxed">
        The KantaSwara AI Solutions Team designs intricate prompts that define the agent's persona, tone, and strict conversational boundaries. Security guardrails prevent the AI from discussing competitor products, offering unsanctioned discounts, or deviating from the core objective.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">CRM & Calendar Integration</h2>
      <p className="leading-relaxed">
        KantaSwara integrates with major CRMs (Salesforce, HubSpot, Zoho) and calendar providers (Google Calendar, Outlook). Agents can query CRM records in real-time to personalize conversations and instantly book appointments based on real-time availability.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Advanced Analytics & Call Logs</h2>
      <p className="leading-relaxed">
        Monitor performance through the comprehensive Analytics Dashboard. Access detailed metrics including call volume, average duration, success rate, and outcome dispositions. Every interaction includes a full transcript and audio recording for QA and compliance.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Billing & Usage Management</h2>
      <p className="leading-relaxed">
        Transparent billing allows organization administrators to track Voice Minute usage in real-time, view past invoices, manage subscription tiers, and securely update payment methods directly from the dashboard.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Team Management & Security</h2>
      <p className="leading-relaxed">
        Invite multiple team members to your organization and assign specific roles (Admin, Manager, Viewer). Our platform is built on a multi-tenant architecture with strict data isolation, encryption in transit and at rest, and detailed audit logs tracking all user activity.
      </p>
    </article>
  );
}
