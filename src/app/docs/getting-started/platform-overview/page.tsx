export default function PlatformOverviewPage() {
  return (
    <article className="max-w-none space-y-6 text-neutral-800 dark:text-neutral-200">
      <h1 className="text-4xl font-bold mb-4 mt-0 text-neutral-900 dark:text-white">Platform Overview</h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-400">
        High-level concepts and capabilities of the KantaSwara platform.
      </p>
      
      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">What is KantaSwara?</h2>
      <p className="leading-relaxed">
        KantaSwara is a managed B2B AI Voice Agent platform that enables organizations to automate customer conversations using enterprise-grade AI Voice Employees. Unlike self-service chatbot builders, KantaSwara provides end-to-end implementation, deployment, and maintenance by the KantaSwara AI Solutions Team.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Core Platform Capabilities</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm">
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">AI Voice Employees</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">Deploy conversational voice AI agents that interact naturally with customers over the phone.</p>
        </div>
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm">
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">Lead Qualification</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">Agents intelligently qualify inbound leads by asking targeted questions based on business logic.</p>
        </div>
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm">
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">Appointment Booking</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">Direct calendar integrations allow AI agents to check availability and book meetings instantly.</p>
        </div>
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm">
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">Customer Support Automation</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">Handle routine queries and support tickets via phone, reducing wait times to zero.</p>
        </div>
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm">
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">CRM & Knowledge Base Integration</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">Seamlessly sync data to your CRM and ground the AI on your proprietary knowledge documents.</p>
        </div>
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm">
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">Enterprise Security & RBAC</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">Multi-tenant architecture with strict data isolation and Role-Based Access Control.</p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Platform Architecture</h2>
      <p className="leading-relaxed mb-4">
        The KantaSwara journey from a new customer to a live production AI voice agent follows a structured architectural lifecycle:
      </p>
      
      <div className="p-6 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-x-auto">
        <pre className="text-sm text-neutral-800 dark:text-neutral-200 font-mono m-0">
          {`Customer
   │
   ▼
Organization Registration
   │
   ▼
Admin Approval
   │
   ▼
Organization Dashboard
   │
   ▼
Agent Request Submitted
   │
   ▼
AI Solutions Team Receives Request
   │
   ▼
Development & Prompt Engineering
   │
   ▼
Testing & QA
   │
   ▼
Deployment
   │
   ▼
Production (Live Calls & Analytics)`}
        </pre>
      </div>
    </article>
  );
}
