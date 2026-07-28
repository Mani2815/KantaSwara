export default function ApprovalProcessPage() {
  return (
    <article className="max-w-none space-y-6 text-neutral-800 dark:text-neutral-200">
      <h1 className="text-4xl font-bold mb-4 mt-0 text-neutral-900 dark:text-white">Approval Process</h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-400">
        Learn how KantaSwara manages new organization approvals to maintain high service quality.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Why is there an approval process?</h2>
      <p className="leading-relaxed">
        KantaSwara is not a self-serve platform where users are left to figure out complex voice AI configurations on their own. We offer a <strong>managed service</strong>. Every organization is paired with dedicated AI engineers who build, test, and maintain their voice agents. The approval process ensures we have the bandwidth and resources to deliver a premium, successful implementation for every new customer.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">The Review Steps</h2>
      <div className="space-y-4 my-6">
        <div className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-white mb-2">1. Identity Verification</h3>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">Our compliance team verifies your corporate domain and business registration to prevent fraud and maintain multi-tenant security.</p>
        </div>
        <div className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-white mb-2">2. Use Case Evaluation</h3>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">We review your intended use case (e.g., inbound support, outbound lead qualification) to ensure it aligns with KantaSwara's current capabilities.</p>
        </div>
        <div className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-white mb-2">3. Resource Allocation</h3>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">We assign a dedicated account manager and technical lead to your organization before activating your account.</p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Timeline</h2>
      <p className="leading-relaxed">
        The typical approval time is <strong>1 to 2 business days</strong>. You will receive an email from <code>support@kantaswara.com</code> as soon as your account is activated. If we need more information about your business before approving, our team will reach out directly.
      </p>

      <div className="my-8 p-4 bg-orange-50 dark:bg-orange-500/10 border-l-4 border-orange-500 rounded-r-lg">
        <p className="m-0 text-orange-800 dark:text-orange-200">
          <strong>Need expedited approval?</strong> If you have an urgent deployment requirement, please contact our enterprise sales team directly.
        </p>
      </div>
    </article>
  );
}
