import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@server/lib/supabase/admin';
import { createClient } from '@server/lib/supabase/server';
import { AuditLogger } from '@server/lib/audit/logger';
import { emailEventBus } from '@/lib/email';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    // Fetch org details for email
    const { data: orgData, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('name, contact_email, admins:user_organizations(user:profiles(id, first_name, last_name, email))')
      .eq('id', id)
      .single() as any;

    if (orgError || !orgData) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const { error } = await supabaseAdmin
      .from('organizations')
      .update({
        status: 'approved',
        approval_status: 'approved',
        is_active: true,
        approved_at: new Date().toISOString(),
        activation_date: new Date().toISOString(),
        approved_by: user.id
      })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Attempt Audit Log
    try {
      await AuditLogger.log({
        organizationId: id,
        userId: user.id,
        action: 'update' as any,
        resourceType: 'organization',
        resourceId: id,
        newValues: { status: 'approved' }
      });
    } catch (e) {
      console.error('Failed to write audit log', e);
    }

    // Trigger Email Event
    try {
      const adminProfiles = (orgData.admins as any[])
        ?.map((a: any) => a.user)
        .filter(Boolean) || [];
      
      const adminEmail = adminProfiles[0]?.email || orgData.contact_email;
      const adminName = adminProfiles[0] 
        ? `${adminProfiles[0].first_name || ''} ${adminProfiles[0].last_name || ''}`.trim() || 'Admin'
        : 'Organization Admin';

      if (adminEmail) {
        await emailEventBus.emit('OrganizationApproved', {
          organizationId: id,
          organizationName: orgData.name,
          adminEmail,
          adminName,
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        });
      }
    } catch (e) {
      console.error('Failed to emit OrganizationApproved event', e);
    }

    return NextResponse.json({ message: 'Organization approved successfully' }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
