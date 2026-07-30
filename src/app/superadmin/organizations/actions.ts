'use server';

import { supabaseAdmin } from '@server/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { emailEventBus } from '@/lib/email';

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
    const { data: orgData, error } = await supabaseAdmin
      .from('organizations')
      .update({
        status: 'approved',
        approval_status: 'approved',
        is_active: true,
        approved_at: new Date().toISOString(),
        activation_date: new Date().toISOString(),
      })
      .eq('id', organizationId)
      .select('name')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Fetch org admin to send email
    const { data: adminProfiles } = await supabaseAdmin
      .from('profiles')
      .select('full_name, email')
      .eq('organization_id', organizationId)
      .eq('role', 'org_admin')
      .limit(1);

    const admin = adminProfiles?.[0];
    if (orgData && admin && admin.email) {
      try {
        await emailEventBus.emit('OrganizationApproved', {
          organizationId,
          organizationName: orgData.name,
          adminEmail: admin.email,
          adminName: admin.full_name || 'Organization Admin',
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
        });
      } catch (e) {
        console.error('Failed to emit OrganizationApproved event:', e);
      }
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
    const { data: orgData, error } = await supabaseAdmin
      .from('organizations')
      .update({
        status: 'rejected',
        approval_status: 'rejected',
        is_active: false,
        rejected_at: new Date().toISOString(),
        rejection_reason: reason,
      })
      .eq('id', organizationId)
      .select('name')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Fetch org admin to send email
    const { data: adminProfiles } = await supabaseAdmin
      .from('profiles')
      .select('full_name, email')
      .eq('organization_id', organizationId)
      .eq('role', 'org_admin')
      .limit(1);

    const admin = adminProfiles?.[0];
    if (orgData && admin && admin.email) {
      try {
        await emailEventBus.emit('OrganizationRejected', {
          organizationId,
          organizationName: orgData.name,
          adminEmail: admin.email,
          adminName: admin.full_name || 'Organization Admin',
          reason: reason || 'Your application did not meet our current requirements.',
        });
      } catch (e) {
        console.error('Failed to emit OrganizationRejected event:', e);
      }
    }

    revalidatePath('/superadmin/organizations');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to reject organization' };
  }
}
