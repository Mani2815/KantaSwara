import { redirect } from 'next/navigation';
import { createClient } from '@server/lib/supabase/server';
import { supabaseAdmin } from '@server/lib/supabase/admin';
import { Sidebar } from '@/features/superadmin/components/Sidebar';
import { Header } from '@/features/superadmin/components/Header';
import styles from '@/components/layout/AppShell/AppShell.module.css';

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Check authenticated session
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/superadmin/dashboard');
  }

  // 2. Check super_admin role (bypass RLS with admin client)
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role, full_name, email, avatar_url')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'super_admin') {
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
