export default function DocsIntroductionPage() {
  return (
    <article className="max-w-none space-y-6 text-neutral-800 dark:text-neutral-200">
      <h1 className="text-4xl font-bold mb-4 mt-0 text-neutral-900 dark:text-white">Introduction</h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-400">
        Welcome to the KantaSwara Documentation Portal. This guide will help you understand, integrate, and operate the KantaSwara platform.
      </p>
      
      <div className="my-8 p-4 bg-orange-50 dark:bg-orange-500/10 border-l-4 border-orange-500 rounded-r-lg">
        <p className="m-0 text-orange-800 dark:text-orange-200">
          <strong>Note:</strong> This documentation portal is currently under construction.
        </p>
      </div>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">What is KantaSwara?</h2>
      <p className="leading-relaxed">
        KantaSwara is an enterprise-grade AI Voice Agent platform designed for Real Estate, EdTech, and Automobile businesses. 
        It provides a managed service approach where our team builds, tests, and deploys custom AI agents tailored to your 
        specific business logic, knowledge base, and CRM requirements.
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
        <li><strong>Organization Admins:</strong> Step-by-step guides for onboarding and managing your account.</li>
        <li><strong>Developers:</strong> Comprehensive API references and webhook documentation.</li>
      </ul>
    </article>
  );
}
