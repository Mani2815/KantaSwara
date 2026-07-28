export default function APIReferenceOverviewPage() {
  return (
    <article className="max-w-none space-y-6 text-neutral-800 dark:text-neutral-200">
      <h1 className="text-4xl font-bold mb-4 mt-0 text-neutral-900 dark:text-white">API Reference Overview</h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-400">
        Interact programmatically with the KantaSwara platform using our REST API.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Base URL</h2>
      <p className="leading-relaxed">
        All API requests should be made to the following base URL:
      </p>
      <div className="p-4 bg-neutral-900 rounded-lg overflow-x-auto text-sm text-neutral-200 font-mono">
        https://api.kantaswara.com/v1
      </div>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Authentication</h2>
      <p className="leading-relaxed">
        The KantaSwara API uses Bearer tokens for authentication. You must include your API key in the <code>Authorization</code> header of every request.
      </p>
      <div className="p-4 bg-neutral-900 rounded-lg overflow-x-auto text-sm text-neutral-200 font-mono mb-4">
        Authorization: Bearer YOUR_API_KEY
      </div>
      <p className="leading-relaxed text-sm text-neutral-600 dark:text-neutral-400">
        You can generate and revoke API keys from your Organization Dashboard under <strong>Settings &gt; API Keys</strong>. Keep your keys secure and never expose them in client-side code.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Rate Limits</h2>
      <p className="leading-relaxed">
        To ensure platform stability, the API is rate-limited. The default limit is <strong>100 requests per minute</strong> per organization. If you exceed this limit, the API will return a <code>429 Too Many Requests</code> status code.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Standard Error Responses</h2>
      <p className="leading-relaxed">
        The API uses standard HTTP status codes to indicate the success or failure of a request. Error responses include a JSON body with a specific error code and a human-readable message.
      </p>
      <div className="overflow-x-auto my-6">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white">
              <th className="py-3 px-4 font-semibold">Status Code</th>
              <th className="py-3 px-4 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
              <td className="py-4 px-4 font-medium text-neutral-900 dark:text-white">200 / 201</td>
              <td className="py-4 px-4 text-neutral-600 dark:text-neutral-400">Success</td>
            </tr>
            <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
              <td className="py-4 px-4 font-medium text-neutral-900 dark:text-white">400</td>
              <td className="py-4 px-4 text-neutral-600 dark:text-neutral-400">Bad Request - Invalid parameters or missing required fields.</td>
            </tr>
            <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
              <td className="py-4 px-4 font-medium text-neutral-900 dark:text-white">401</td>
              <td className="py-4 px-4 text-neutral-600 dark:text-neutral-400">Unauthorized - Invalid or missing API key.</td>
            </tr>
            <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
              <td className="py-4 px-4 font-medium text-neutral-900 dark:text-white">403</td>
              <td className="py-4 px-4 text-neutral-600 dark:text-neutral-400">Forbidden - You lack permission to access this resource.</td>
            </tr>
            <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
              <td className="py-4 px-4 font-medium text-neutral-900 dark:text-white">404</td>
              <td className="py-4 px-4 text-neutral-600 dark:text-neutral-400">Not Found - The requested resource does not exist.</td>
            </tr>
            <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
              <td className="py-4 px-4 font-medium text-neutral-900 dark:text-white">429</td>
              <td className="py-4 px-4 text-neutral-600 dark:text-neutral-400">Too Many Requests - Rate limit exceeded.</td>
            </tr>
            <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
              <td className="py-4 px-4 font-medium text-neutral-900 dark:text-white">500</td>
              <td className="py-4 px-4 text-neutral-600 dark:text-neutral-400">Internal Server Error - Something went wrong on our end.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  );
}
