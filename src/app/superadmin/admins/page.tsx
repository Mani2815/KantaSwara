import React from 'react';
import { supabaseAdmin } from '@server/lib/supabase/admin';
import { ShieldCheck, Rocket, MoreVertical } from 'lucide-react';
import { CreateAdminForm } from './CreateAdminForm';
import { AdminRowActions } from './AdminRowActions';

export const metadata = {
  title: 'Internal Admins — KantaSwara Super Admin',
};

async function getInternalAdmins() {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select(`
      id,
      full_name,
      email,
      role,
      created_at
    `)
    .in('role', ['super_admin', 'solutions_admin'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching admins:', error);
    return [];
  }
  return data;
}

export default async function AdminsPage() {
  const admins = await getInternalAdmins();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Internal Admins</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Configure credentials and access levels for internal staff.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Admin List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Active Accounts</h2>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-5 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">User</th>
                  <th className="px-5 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Role</th>
                  <th className="px-5 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Created</th>
                  <th className="px-5 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-400">
                          {admin.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-zinc-900 dark:text-white">{admin.full_name}</div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">{admin.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {admin.role === 'super_admin' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20">
                          <ShieldCheck size={14} />
                          Super Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20">
                          <Rocket size={14} />
                          Solutions Admin
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                      {new Date(admin.created_at).toISOString().split('T')[0]}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <AdminRowActions adminId={admin.id} currentRole={admin.role} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Create Form */}
        <div>
          <CreateAdminForm />
        </div>

      </div>
    </div>
  );
}
