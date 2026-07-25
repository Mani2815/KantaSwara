'use server';

import { supabaseAdmin } from '@server/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function deleteOrganization(organizationId: string) {
  if (!organizationId) {
    return { success: false, error: 'Organization ID is required' };
  }

  try {
    // PREVENT deleting KantaSwara HQ
    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('slug')
      .eq('id', organizationId)
      .single();

    if (org?.slug === 'kantaswara-hq') {
      return { success: false, error: 'Cannot delete the headquarters organization' };
    }

    // Delete the organization
    // Note: Depends on ON DELETE CASCADE for foreign keys like profiles, agents, etc.
    // If cascade is not set, this might fail unless child records are deleted first.
    const { error } = await supabaseAdmin
      .from('organizations')
      .delete()
      .eq('id', organizationId);

    if (error) {
      console.error('Error deleting organization:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/superadmin/organizations');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete organization' };
  }
}

export async function approveOrganization(organizationId: string) {
  if (!organizationId) {
    return { success: false, error: 'Organization ID is required' };
  }

  try {
    const { error } = await supabaseAdmin
      .from('organizations')
      .update({
        status: 'approved',
        approval_status: 'approved',
        is_active: true,
        approved_at: new Date().toISOString(),
        activation_date: new Date().toISOString(),
      })
      .eq('id', organizationId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/superadmin/organizations');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to approve organization' };
  }
}

export async function rejectOrganization(organizationId: string, reason: string) {
  if (!organizationId) {
    return { success: false, error: 'Organization ID is required' };
  }

  try {
    const { error } = await supabaseAdmin
      .from('organizations')
      .update({
        status: 'rejected',
        approval_status: 'rejected',
        is_active: false,
        rejected_at: new Date().toISOString(),
        rejection_reason: reason,
      })
      .eq('id', organizationId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/superadmin/organizations');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to reject organization' };
  }
}
