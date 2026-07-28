export default function RegisterOrganizationPage() {
  return (
    <article className="max-w-none space-y-6 text-neutral-800 dark:text-neutral-200">
      <h1 className="text-4xl font-bold mb-4 mt-0 text-neutral-900 dark:text-white">Register Organization</h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-400">
        Follow these steps to register your organization and gain access to the KantaSwara platform.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">1. Create an Account</h2>
      <p className="leading-relaxed">
        Navigate to the registration page and fill out your account details. You must provide a valid corporate email address. Personal email addresses (like @gmail.com or @yahoo.com) may require additional verification or may be rejected.
      </p>
      
      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">2. Business Profile Details</h2>
      <p className="leading-relaxed">
        During registration, you will be asked to provide your organization's name, industry, and a brief description of your intended use case. This information helps the AI Solutions Team prepare for your onboarding call.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">3. Email Verification</h2>
      <p className="leading-relaxed">
        After submitting the form, you will receive an email containing a verification link. Click the link to verify your email address. If you used Google Authentication or GitHub to sign up, this step is automatically skipped.
      </p>
      
      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">4. Pending Approval Status</h2>
      <p className="leading-relaxed">
        Once your email is verified, your account enters the "Pending Approval" state. Because KantaSwara is a managed service, we manually review every new organization to ensure fit and capacity.
      </p>

      <div className="my-8 p-4 bg-orange-50 dark:bg-orange-500/10 border-l-4 border-orange-500 rounded-r-lg">
        <p className="m-0 text-orange-800 dark:text-orange-200">
          <strong>Note:</strong> While in the pending state, you cannot access the main dashboard. You will receive an email notification as soon as a KantaSwara Superadmin approves your organization.
        </p>
      </div>
      
      <h2 className="text-2xl font-semibold mt-10 mb-4 text-neutral-900 dark:text-white">5. First Login & Team Invitations</h2>
      <p className="leading-relaxed">
        Upon approval, log in to access the Organization Dashboard. As the creator, you are automatically assigned the 'Admin' role. You can immediately begin inviting other team members from the Settings tab.
      </p>
    </article>
  );
}
