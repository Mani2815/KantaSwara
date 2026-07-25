import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@server/lib/supabase/admin';
import { createClient } from '@server/lib/supabase/server';
import { AuditLogger } from '@server/lib/audit/logger';

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

    return NextResponse.json({ message: 'Organization approved successfully' }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
