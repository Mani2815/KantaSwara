import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@server/lib/supabase/server';
import { Sidebar } from '@/features/delivery-console/components/Sidebar';
import { Header } from '@/features/delivery-console/components/Header';
import styles from '@/components/layout/AppShell/AppShell.module.css';

export default async function DeliveryConsoleLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Hard enforce RBAC
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'solutions_admin') {
    // If not a solutions admin, kick them out
    if (profile?.role === 'super_admin') redirect('/superadmin/dashboard');
    redirect('/dashboard');
  }

  return (
    <div className={styles['app-shell']}>
      {/* Platform Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className={styles['content-area']}>
        {/* Global Header */}
        <Header user={profile} />

        {/* Page Content Workspace */}
        <main className={styles.main}>
          <div className={styles.main__inner}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
