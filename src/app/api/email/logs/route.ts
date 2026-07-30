import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@server/lib/supabase/server';
import { EmailLogger } from '@server/lib/email/logger';

export async function GET(req: NextRequest) {
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

    if (profile?.role !== 'super_admin' && profile?.role !== 'support_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const organizationId = searchParams.get('organizationId') || undefined;
    const status = searchParams.get('status') as any || undefined;
    const templateKey = searchParams.get('templateKey') || undefined;
    const recipient = searchParams.get('recipient') || undefined;

    const result = await EmailLogger.getLogs({
      page,
      pageSize,
      organizationId,
      status,
      templateKey,
      recipient,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
