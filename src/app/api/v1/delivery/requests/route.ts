import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@server/lib/supabase/server';
import { supabaseAdmin } from '@server/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify RBAC
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'solutions_admin') {
      return NextResponse.json({ error: 'Forbidden. Requires solutions_admin role.' }, { status: 403 });
    }

    // Fetch requests
    const { data: requests, error } = await supabaseAdmin
      .from('agent_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ requests });

  } catch (error: any) {
    console.error('Error in /api/v1/delivery/requests:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // This endpoint would be called by the Customer Portal / Org Admin
  // to submit a new requirement for an Agent.
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the user is an org_admin or has permissions to request an agent
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, organization_id')
      .eq('id', user.id)
      .single();

    if (!profile || !['org_admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { domain, priority, requirements } = body;

    const { data: newRequest, error } = await supabaseAdmin
      .from('agent_requests')
      .insert({
        organization_id: profile.organization_id,
        domain: domain || 'General',
        priority: priority || 'medium',
        requirements: requirements || {},
        status: 'pending_review'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ request: newRequest }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating agent request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
