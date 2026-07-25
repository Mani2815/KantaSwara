'use server';

import { supabaseAdmin } from '@server/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function deleteUser(userId: string) {
  try {
    // We should first delete the profile manually if there's no cascade,
    // but the foreign key to organizations might be restrictive.
    // Actually, deleting from auth.admin is the best way.
    // The profile will be orphaned or deleted via cascade if set up, or we delete it manually.
    
    // 1. Delete the profile first to be safe
    await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    // 2. Delete the user from auth
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error('Error deleting user from auth:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/superadmin/users');
    return { success: true };
  } catch (error: any) {
    console.error('Exception deleting user:', error);
    return { success: false, error: error.message || 'Unknown error occurred' };
  }
}
