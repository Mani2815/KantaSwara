import { NextResponse } from 'next/server';
import { createClient } from '@server/lib/supabase/server';
import { AgentBuilderService } from '@server/services/agent-builder.service';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const service = new AgentBuilderService(supabase);
  try {
    const aggregate = await service.getAgentAggregate((await params).id);
    return NextResponse.json({ data: aggregate });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const payload = await request.json();
  const { tab, data } = payload;

  if (!tab || !data) {
    return NextResponse.json({ error: 'Missing tab or data' }, { status: 400 });
  }

  const service = new AgentBuilderService(supabase);

  try {
    await service.updateAgentDraft((await params).id, tab, data);

    // Log the change
    await supabase.from('builder_change_logs').insert({
      agent_id: (await params).id,
      user_id: user.id,
      action: 'UPDATE_CONFIG',
      entity: tab,
      new_value: data
    });

    return NextResponse.json({ message: 'Configuration saved successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
