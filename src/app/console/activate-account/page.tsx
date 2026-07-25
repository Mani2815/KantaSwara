export default function ConsoleActivateAccount() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="bg-neutral-800 p-8 rounded-xl max-w-md w-full border border-neutral-700">
        <h2 className="text-2xl font-bold text-white mb-2">Activate Account</h2>
        <p className="text-neutral-400 mb-6 text-sm">Welcome to the KantaSwara internal team! Please set your password to activate your account.</p>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Company Email</label>
            <input type="email" disabled className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-neutral-500 cursor-not-allowed" value="employee@kantaswara.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Set Password</label>
            <input type="password" className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Confirm Password</label>
            <input type="password" className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white" />
          </div>
          <button type="submit" className="w-full bg-[#ff6600] hover:bg-[#ff8533] text-white font-bold py-2 px-4 rounded-lg transition-colors">
            Activate Account
          </button>
        </form>
      </div>
    </div>
  );
}
