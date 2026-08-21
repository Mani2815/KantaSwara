import Link from 'next/link';

export default function SuperAdminConsole() {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">Super Admin Dashboard</h2>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
          <h3 className="text-xl font-semibold mb-2">Employees</h3>
          <p className="text-neutral-400 text-sm">Manage internal team members.</p>
        </div>
        
        <Link href="/console/super-admin/email-logs">
          <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 hover:bg-neutral-700 transition-colors cursor-pointer h-full">
            <h3 className="text-xl font-semibold mb-2 text-white">Email System</h3>
            <p className="text-neutral-400 text-sm">View email delivery logs, queues, and operational metrics.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
