export default function SupportPage() {
  return (
    <article className="max-w-none space-y-6 text-neutral-800 dark:text-neutral-200">
      <h1 className="text-4xl font-bold mb-4 mt-0 text-neutral-900 dark:text-white">Support & Help</h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-400">
        Get assistance with your agents, report issues, or request new features.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Contacting Support</h2>
      <p className="leading-relaxed">
        Our support team is available Monday through Friday, 9:00 AM to 6:00 PM EST.
      </p>

      <div className="space-y-4 my-6">
        <div className="flex items-start p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          <div className="flex-shrink-0 mt-1">
            <span className="flex items-center justify-center h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-600 dark:text-neutral-400"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </span>
          </div>
          <div className="ml-4">
            <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">Email Support</h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">For general inquiries, billing questions, or minor agent modifications, email <strong>support@kantaswara.com</strong>.</p>
          </div>
        </div>

        <div className="flex items-start p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          <div className="flex-shrink-0 mt-1">
            <span className="flex items-center justify-center h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-600 dark:text-neutral-400"><path d="M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0Z"/><path d="M12 8v4l3 3"/></svg>
            </span>
          </div>
          <div className="ml-4">
            <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">Emergency Engineering Hotline</h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">If your production agent goes offline or hallucinates severely, Enterprise tier customers have access to a 24/7 dedicated engineering hotline provided during onboarding.</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Reporting Issues</h2>
      <p className="leading-relaxed mb-4">
        When reporting a bug or an unexpected agent response, please provide the following information to help our AI Solutions Team diagnose the problem quickly:
      </p>
      <ul className="list-disc pl-6 space-y-2 m-0 text-neutral-700 dark:text-neutral-300">
        <li><strong>Call ID:</strong> Found in the Calls & Analytics section of your dashboard.</li>
        <li><strong>Timestamp:</strong> Approximate time during the call when the issue occurred.</li>
        <li><strong>Expected Behavior:</strong> What you expected the agent to say or do.</li>
        <li><strong>Actual Behavior:</strong> What the agent actually said or did.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">Service Level Agreements (SLA)</h2>
      <p className="leading-relaxed">
        We guarantee a 99.9% uptime for the core telephony and routing infrastructure. Due to the probabilistic nature of Large Language Models, we cannot guarantee zero hallucinations, but our prompt engineering teams guarantee a response time of less than 24 hours to address and patch any reported prompt-drift issues for Enterprise customers.
      </p>
    </article>
  );
}
