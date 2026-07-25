export default function OnboardingPage() {
  return (
    <article className="max-w-none space-y-6 text-neutral-800 dark:text-neutral-200">
      <h1 className="text-4xl font-bold mb-4 mt-0 text-neutral-900 dark:text-white">Organization Onboarding</h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-400">
        Follow these steps to register your organization and gain access to the KantaSwara platform.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">1. Register Organization</h2>
      <p className="leading-relaxed">
        Navigate to the registration page and fill out your account and business profile details. This information helps our team understand your use case before assigning resources.
      </p>
      
      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">2. Email Verification</h2>
      <p className="leading-relaxed">
        After registration, you will receive an email containing a verification link. Click the link to verify your email address. If you used Google Authentication, this step is skipped.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">3. Approval Process</h2>
      <p className="leading-relaxed">
        Because KantaSwara is a managed service, all new organization accounts undergo a manual review process. This typically takes 1-2 business days.
      </p>
      <div className="my-8 p-4 bg-orange-50 dark:bg-orange-500/10 border-l-4 border-orange-500 rounded-r-lg">
        <p className="m-0 text-orange-800 dark:text-orange-200">
          <strong>Important:</strong> You cannot access the main dashboard until a Superadmin has approved your registration. You will be notified via email once approved.
        </p>
      </div>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">4. Account Activation</h2>
      <p className="leading-relaxed">
        Once approved, your account is activated and you can log in to the dashboard to begin submitting AI Agent requirements.
      </p>
    </article>
  );
}
