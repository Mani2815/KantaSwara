import { redirect } from 'next/navigation';
import { createClient } from '@server/lib/supabase/server';
import { AppShell } from '@/components/layout/AppShell';

/**
 * Platform layout — server-side auth guard.
 * If the user has no valid session, they are redirected to /login.
 * This is the second layer of protection (middleware is the first).
 */
export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch the user's profile and organization status
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, organization_id, organizations!inner(is_active, status, settings)')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/login');
  }

  if (profile?.role === 'super_admin') {
    redirect('/superadmin/dashboard');
  }

  if (profile?.role === 'solutions_admin') {
    redirect('/delivery-console');
  }

  // Typecasting since PostgREST join returns it as an array or object
  const org = profile.organizations as any;
  
  if (org.status === 'pending_approval') {
    redirect('/pending-approval');
  }
  
  if (org.status === 'rejected') {
    // Ideally we would redirect to a rejected page, but pending-approval can handle it or a generic one.
    redirect('/pending-approval?rejected=true');
  }


  return <AppShell>{children}</AppShell>;
}

