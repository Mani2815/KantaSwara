import { NextResponse } from 'next/server';
import { createClient } from '@server/lib/supabase/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  
  // 1. Authorize: Ensure user is solutions_admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || (user.user_metadata as any).role !== 'solutions_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // 2. Fetch Agent Core Entity
  const { data: agent, error: agentError } = await supabase
    .from('builder_agents')
    .select(`
      *,
      current_version:builder_agent_versions(
        *,
        agent_configurations(*),
        prompt_configurations(*),
        workflow_configurations(*),
        voice_configurations(*),
        integration_configurations(*),
        knowledge_configurations(*),
        business_variables(*)
      )
    `)
    .eq('id', (await params).id)
    .single();

  if (agentError || !agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  return NextResponse.json({ data: agent });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  
  // 1. Authorize
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || (user.user_metadata as any).role !== 'solutions_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const payload = await request.json();
  const { tab, data } = payload;

  if (!tab || !data) {
    return NextResponse.json({ error: 'Missing tab or data' }, { status: 400 });
  }


  try {
    // 2. Fetch current version ID
    const { data: agent } = await supabase
      .from('builder_agents')
      .select('current_version_id')
      .eq('id', (await params).id)
      .single();

    if (!agent || !agent.current_version_id) {
      return NextResponse.json({ error: 'No active version found' }, { status: 404 });
    }

    // 3. Update the specific configuration table based on the tab
    type ConfigTable = 'builder_agent_configurations' | 'builder_prompt_configurations' | 'builder_workflow_configurations' | 'builder_voice_configurations' | 'builder_integration_configurations' | 'builder_knowledge_configurations';
    let tableName: ConfigTable;
    switch (tab) {
      case 'agent': tableName = 'builder_agent_configurations'; break;
      case 'prompts': tableName = 'builder_prompt_configurations'; break;
      case 'workflow': tableName = 'builder_workflow_configurations'; break;
      case 'voice': tableName = 'builder_voice_configurations'; break;
      case 'integrations': tableName = 'builder_integration_configurations'; break;
      case 'knowledge': tableName = 'builder_knowledge_configurations'; break;
      default: return NextResponse.json({ error: 'Invalid configuration tab' }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from(tableName)
      .update(data)
      .eq('agent_version_id', agent.current_version_id);

    if (updateError) throw updateError;

    // 4. Log the change
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
