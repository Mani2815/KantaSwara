export default function DocsIntroductionPage() {
  return (
    <article className="max-w-none space-y-6 text-neutral-800 dark:text-neutral-200">
      <h1 className="text-4xl font-bold mb-4 mt-0 text-neutral-900 dark:text-white">Introduction</h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-400">
        Welcome to the KantaSwara Documentation Portal. This guide will help you understand, integrate, and operate the KantaSwara platform.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">What is KantaSwara?</h2>
      <p className="leading-relaxed">
        KantaSwara is a managed B2B AI Voice Agent platform that enables organizations to automate customer conversations using enterprise-grade AI Voice Employees. Unlike self-service chatbot builders, KantaSwara provides end-to-end implementation, deployment, and maintenance by the KantaSwara AI Solutions Team.
      </p>

      <h3 className="text-xl font-semibold mt-8 mb-4 text-neutral-900 dark:text-white">Key Capabilities</h3>
      <ul className="list-disc pl-6 space-y-2 m-0 text-neutral-700 dark:text-neutral-300">
        <li><strong>Conversational AI:</strong> Natural, human-like voice interactions with sub-second latency.</li>
        <li><strong>Knowledge Ingestion:</strong> Agents are trained on your company's documents, FAQs, and website data.</li>
        <li><strong>Workflow Automation:</strong> Direct integrations with CRMs to qualify leads and book appointments.</li>
        <li><strong>Analytics:</strong> Real-time call tracking, transcripts, and disposition tagging.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Who is this documentation for?</h2>
      <p className="leading-relaxed">
        This portal serves as the central knowledge hub for:
      </p>
      <ul className="list-disc pl-6 space-y-2 m-0 text-neutral-700 dark:text-neutral-300">
        <li><strong>Prospective Customers:</strong> Learn how KantaSwara can automate your voice workflows.</li>
        <li><strong>Organization Admins & Managers:</strong> Step-by-step guides for onboarding, managing agents, and viewing analytics.</li>
        <li><strong>Developers & Platform Administrators:</strong> Comprehensive API references, webhook documentation, and security configurations.</li>
        <li><strong>Operators & AI Solutions Team:</strong> Internal workflows and lifecycle management of AI agents.</li>
      </ul>
      
      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Next Steps</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <a href="/docs/getting-started/platform-overview" className="block p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:border-orange-500 transition-colors">
          <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">Platform Overview</h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Understand the core architecture and capabilities.</p>
        </a>
        <a href="/docs/getting-started/how-it-works" className="block p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:border-orange-500 transition-colors">
          <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">How It Works</h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Learn the step-by-step process of going live with KantaSwara.</p>
        </a>
      </div>
    </article>
  );
}
