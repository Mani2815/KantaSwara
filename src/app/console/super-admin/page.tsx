export default function SuperAdminConsole() {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">Super Admin Dashboard</h2>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
          <h3 className="text-xl font-semibold mb-2">Employees</h3>
          <p className="text-neutral-400 text-sm">Manage internal team members.</p>
        </div>
      </div>
    </div>
  );
}
