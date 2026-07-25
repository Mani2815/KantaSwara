import { NextResponse } from 'next/server';
import { createClient } from '@server/lib/supabase/server';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  
  // 1. Authorize
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || (user.user_metadata as any).role !== 'solutions_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const payload = await request.json();
  const { environment } = payload; // dev, staging, prod

  if (!environment) {
    return NextResponse.json({ error: 'Deployment environment is required' }, { status: 400 });
  }

  try {
    // 2. Fetch current agent and version
    const { data: agent } = await supabase
      .from('builder_agents')
      .select('id, current_version_id')
      .eq('id', (await params).id)
      .single();

    if (!agent || !agent.current_version_id) {
      return NextResponse.json({ error: 'No active version found' }, { status: 404 });
    }

    // 3. Pre-flight Validation check (Mocked logic)
    // Here we would run the equivalent of the /validate endpoint to ensure QA passed, etc.
    const { data: qaReview } = await supabase
      .from('builder_qa_reviews')
      .select('status')
      .eq('agent_version_id', agent.current_version_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (environment === 'production' && (!qaReview || qaReview.status !== 'approved')) {
       return NextResponse.json({ error: 'Production deployments require approved QA' }, { status: 422 });
    }

    // 4. Create deployment record
    const { error: deployError } = await supabase.from('builder_deployments').insert({
      agent_version_id: agent.current_version_id,
      environment,
      deployed_by: user.id,
      status: 'success', // In a real system, this would be 'in_progress' and updated via webhook
      logs: [{ message: 'Deployment triggered', timestamp: new Date().toISOString() }]
    });

    if (deployError) throw deployError;

    // 5. Update Version status
    await supabase.from('builder_agent_versions').update({
      deployment_env: environment,
      status: 'deployed'
    }).eq('id', agent.current_version_id);

    // 6. Update Agent status
    await supabase.from('builder_agents').update({
      status: 'deployed',
      stage: 'deployed'
    }).eq('id', (await params).id);

    // 7. Log change
    await supabase.from('builder_change_logs').insert({
      agent_id: (await params).id,
      user_id: user.id,
      action: 'DEPLOYMENT',
      entity: environment,
      new_value: { environment, status: 'success' }
    });

    return NextResponse.json({ message: 'Deployment initiated successfully' });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
