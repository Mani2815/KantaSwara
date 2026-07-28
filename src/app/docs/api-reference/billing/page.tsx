export default function BillingApiPage() {
  return (
    <article className="max-w-none space-y-6 text-neutral-800 dark:text-neutral-200">
      <h1 className="text-4xl font-bold mb-4 mt-0 text-neutral-900 dark:text-white">Billing API</h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-400">
        Access current usage and invoice data for your organization.
      </p>

      <div className="mt-10 border-t border-neutral-200 dark:border-neutral-800 pt-8">
        <h2 className="text-2xl font-semibold mb-2 text-neutral-900 dark:text-white">Get Current Usage</h2>
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded">GET</span>
          <code className="text-sm text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded">/billing/usage</code>
        </div>
        
        <h3 className="font-semibold mt-6 mb-2">Description</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">Returns the total number of voice minutes consumed in the current billing cycle.</p>
        
        <h3 className="font-semibold mt-6 mb-2">Permissions</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">Requires <code>Admin</code> role. Managers and Viewers will receive a 403 Forbidden error.</p>

        <h3 className="font-semibold mt-6 mb-2">Response</h3>
        <div className="p-4 bg-neutral-900 rounded-lg overflow-x-auto text-sm text-neutral-200 font-mono mb-4">
          {`{
  "billing_period": {
    "start": "2026-07-01T00:00:00Z",
    "end": "2026-07-31T23:59:59Z"
  },
  "minutes_used": 1452,
  "minutes_included": 5000,
  "overage_minutes": 0,
  "estimated_cost_usd": 150.00
}`}
        </div>
      </div>

      <div className="mt-10 border-t border-neutral-200 dark:border-neutral-800 pt-8">
        <h2 className="text-2xl font-semibold mb-2 text-neutral-900 dark:text-white">List Invoices</h2>
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded">GET</span>
          <code className="text-sm text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded">/billing/invoices</code>
        </div>
        
        <h3 className="font-semibold mt-6 mb-2">Description</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">Returns a list of all historical invoices for the organization.</p>
        
        <h3 className="font-semibold mt-6 mb-2">Permissions</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">Requires <code>Admin</code> role.</p>

        <h3 className="font-semibold mt-6 mb-2">Response</h3>
        <div className="p-4 bg-neutral-900 rounded-lg overflow-x-auto text-sm text-neutral-200 font-mono mb-4">
          {`{
  "data": [
    {
      "invoice_id": "inv_8877",
      "amount_due_usd": 150.00,
      "status": "paid",
      "issue_date": "2026-06-01T00:00:00Z",
      "pdf_url": "https://billing.kantaswara.com/invoices/inv_8877.pdf"
    },
    {
      "invoice_id": "inv_8876",
      "amount_due_usd": 150.00,
      "status": "paid",
      "issue_date": "2026-05-01T00:00:00Z",
      "pdf_url": "https://billing.kantaswara.com/invoices/inv_8876.pdf"
    }
  ]
}`}
        </div>
      </div>
    </article>
  );
}
