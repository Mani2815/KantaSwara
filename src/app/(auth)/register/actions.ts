'use server';

import { createClient } from '@server/lib/supabase/server';

export async function createOrgAndProfile(fullName: string, orgName: string, businessProfile: any = {}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  // We need to use the admin client to bypass RLS for creating the org and profile
  const { supabaseAdmin } = await import('@server/lib/supabase/admin');

  // Check if profile already exists
  const { data: existingProfile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (existingProfile) {
    return { success: true }; // Already created
  }

  const baseSlug = orgName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);

  let orgSlug = baseSlug;
  let slugCount = 1;

  while (true) {
    const { data: existingOrg } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .eq('slug', orgSlug)
      .single();
      
    if (!existingOrg) break;
    orgSlug = `${baseSlug}-${slugCount}`;
    slugCount++;
  }

  const { data: orgData, error: orgError } = await supabaseAdmin
    .from('organizations')
    .insert({
      name: orgName,
      slug: orgSlug,
      is_active: false,
      status: 'pending_approval',
      approval_status: 'pending',
      settings: { business_profile: businessProfile }
    })
    .select('id')
    .single();

  if (orgError || !orgData) {
    return { error: 'Failed to create organization' };
  }

  await supabaseAdmin
    .from('org_settings')
    .insert({ organization_id: orgData.id });

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: user.id,
      organization_id: orgData.id,
      full_name: fullName,
      email: user.email,
      role: 'org_admin',
    });

  if (profileError) {
    return { error: 'Failed to create profile' };
  }

  // Trigger registration pending email
  try {
    const { emailEventBus } = await import('@/lib/email');
    await emailEventBus.emit('OrganizationRegistered', {
      organizationId: orgData.id,
      organizationName: orgName,
      adminEmail: user.email!,
      adminName: fullName || 'Admin',
    });
  } catch (e) {
    console.error('Failed to emit OrganizationRegistered event:', e);
  }

  return { success: true };
}
