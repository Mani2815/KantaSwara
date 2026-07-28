export default function KnowledgeBasePage() {
  return (
    <article className="max-w-none space-y-6 text-neutral-800 dark:text-neutral-200">
      <h1 className="text-4xl font-bold mb-4 mt-0 text-neutral-900 dark:text-white">Knowledge Base</h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-400">
        Ground your AI agents on your proprietary business documents to ensure accurate, hallucination-free answers.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Overview</h2>
      <p className="leading-relaxed">
        The Knowledge Base is the central repository of information your AI agents use to answer customer questions. Rather than relying on public internet data (which can be inaccurate or irrelevant), KantaSwara uses a technique called Retrieval-Augmented Generation (RAG). When a user asks a question, the agent searches your uploaded documents for the answer and synthesizes a response.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Supported Formats</h2>
      <ul className="list-disc pl-6 space-y-2 m-0 text-neutral-700 dark:text-neutral-300">
        <li><strong>Documents:</strong> PDF, DOCX, TXT. Ensure text is selectable (not just scanned images).</li>
        <li><strong>Websites:</strong> Provide a URL, and KantaSwara will crawl the text content of that specific page.</li>
        <li><strong>Raw Text:</strong> Copy and paste FAQs or snippets directly into the dashboard.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Uploading Documents</h2>
      <ol className="list-decimal pl-6 space-y-2 m-0 text-neutral-700 dark:text-neutral-300">
        <li>Go to the <strong>Knowledge Base</strong> tab in your Organization Dashboard.</li>
        <li>Click <strong>Add Document</strong>.</li>
        <li>Select your file or input your URL.</li>
        <li>Assign a descriptive title and tags (optional).</li>
        <li>Click <strong>Upload</strong>.</li>
      </ol>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Knowledge Processing (Embeddings)</h2>
      <p className="leading-relaxed">
        Once uploaded, your document enters the <em>Processing</em> state. KantaSwara breaks the text down into small "chunks" and converts them into mathematical vectors (embeddings). This allows the AI to perform semantic searches at lightning speed during live phone calls. Processing typically takes less than 60 seconds. Once the status changes to <em>Active</em>, the knowledge is immediately available to your live agents.
      </p>

      <div className="my-8 p-4 bg-orange-50 dark:bg-orange-500/10 border-l-4 border-orange-500 rounded-r-lg">
        <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Best Practices</h4>
        <ul className="list-disc pl-4 space-y-1 text-sm text-orange-800 dark:text-orange-200">
          <li><strong>Use Q&A format:</strong> Explicit FAQs (Question: X, Answer: Y) are easier for the AI to retrieve perfectly.</li>
          <li><strong>Remove boilerplate:</strong> Strip out lengthy legal disclaimers or repetitive headers from your PDFs to improve search relevance.</li>
          <li><strong>Keep it updated:</strong> If pricing changes, delete the old document and upload a new one immediately. Agents will instantly use the new data.</li>
        </ul>
      </div>
    </article>
  );
}
