import { NextResponse } from 'next/server';
import { createClient } from '@server/lib/supabase/server';
import { AgentBuilderService } from '@server/services/agent-builder.service';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const service = new AgentBuilderService(supabase);
  try {
    const result = await service.publishAgent((await params).id);
    return NextResponse.json({ data: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
