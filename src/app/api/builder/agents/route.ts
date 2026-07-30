import { NextResponse } from 'next/server';
import { createClient } from '@server/lib/supabase/server';
import { AgentBuilderService } from '@server/services/agent-builder.service';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Example list endpoint (basic implementation)
  const { data, error } = await supabase
    .from('builder_agents')
    .select('id, name, stage, status, created_at, updated_at');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const payload = await request.json();
  const service = new AgentBuilderService(supabase);

  try {
    let finalOrgId = payload.org_id;
    if (!finalOrgId || finalOrgId === '00000000-0000-0000-0000-000000000000') {
      const { data: orgs } = await supabase.from('organizations').select('id').limit(1);
      finalOrgId = orgs?.[0]?.id;
    }

    const result = await service.createAgent({
      name: payload.name || 'Untitled Agent',
      org_id: finalOrgId,
      project_id: payload.project_id
    });
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
