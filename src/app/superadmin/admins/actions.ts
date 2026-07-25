'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@server/lib/supabase/admin';
import { createClient } from '@server/lib/supabase/server';

export async function createInternalAdmin(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // Get current super admin's profile to inherit organization_id
    const { data: currentProfile } = await supabaseAdmin
      .from('profiles')
      .select('role, organization_id')
      .eq('id', user.id)
      .single();

    if (!currentProfile || currentProfile.role !== 'super_admin') {
      throw new Error('Forbidden. Only Super Admins can create internal accounts.');
    }

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const role = formData.get('role') as string; // 'super_admin' or 'solutions_admin'

    if (!email || !password || !fullName || !role) {
      throw new Error('All fields are required.');
    }

    if (!['super_admin', 'solutions_admin'].includes(role)) {
      throw new Error('Invalid role selected.');
    }

    // 1. Create user in Supabase Auth using Admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-verify email for internal admins
      user_metadata: {
        full_name: fullName,
      }
    });

    if (authError) throw authError;

    // 2. The database trigger `handle_new_user` might auto-create a profile with `org_admin`. 
    // We need to wait for it or upsert it with the correct role.
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        organization_id: currentProfile.organization_id,
        full_name: fullName,
        email: email,
        role: role as any,
        is_active: true,
      });

    if (profileError) throw profileError;

    revalidatePath('/superadmin/admins');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating internal admin:', error);
    return { error: error.message || 'Failed to create internal admin.' };
  }
}
