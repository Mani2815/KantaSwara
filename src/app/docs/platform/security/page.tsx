export default function SecurityPage() {
  return (
    <article className="max-w-none space-y-6 text-neutral-800 dark:text-neutral-200">
      <h1 className="text-4xl font-bold mb-4 mt-0 text-neutral-900 dark:text-white">Security & Compliance</h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-400">
        How KantaSwara protects your data and ensures platform reliability.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Data Privacy & Isolation</h2>
      <p className="leading-relaxed">
        KantaSwara employs a strict multi-tenant architecture. Your organization's data, including Knowledge Base documents, call transcripts, and vector embeddings, are logically isolated from all other customers. 
      </p>
      <ul className="list-disc pl-6 space-y-2 m-0 text-neutral-700 dark:text-neutral-300">
        <li><strong>Data in Transit:</strong> All communications between your dashboard, our APIs, and the telephony networks are encrypted using TLS 1.2 or higher.</li>
        <li><strong>Data at Rest:</strong> All databases, document storage (S3 buckets), and vector databases are encrypted at rest using AES-256.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Large Language Model (LLM) Privacy</h2>
      <p className="leading-relaxed">
        A common concern with AI is whether your data is used to train public models. <strong>KantaSwara has zero-data-retention agreements with all LLM providers (including OpenAI, Anthropic, and Google).</strong> Your transcripts and knowledge documents are never used to train foundational models.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Compliance Certifications</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        <div className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">SOC 2 Type II</h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Our infrastructure and internal processes are regularly audited by independent third parties to ensure we maintain strict security controls.</p>
        </div>
        <div className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">GDPR & CCPA</h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">We provide tools for full data deletion upon request, honoring the Right to be Forgotten for your end customers.</p>
        </div>
      </div>

      <div className="my-8 p-4 bg-orange-50 dark:bg-orange-500/10 border-l-4 border-orange-500 rounded-r-lg">
        <p className="m-0 text-orange-800 dark:text-orange-200">
          <strong>HIPAA Compliance:</strong> If you intend to use KantaSwara in a healthcare setting to process Protected Health Information (PHI), please contact sales to sign a Business Associate Agreement (BAA) and enable HIPAA mode.
        </p>
      </div>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Redaction & PII Handling</h2>
      <p className="leading-relaxed">
        By default, the system can be configured to automatically redact sensitive Personally Identifiable Information (PII) like Social Security Numbers and Credit Card numbers from transcripts and audio recordings before they are saved to your dashboard.
      </p>
    </article>
  );
}
