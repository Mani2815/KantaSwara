import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email';
import { createClient } from '@server/lib/supabase/server';

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { to } = body;

    if (!to) {
      return NextResponse.json({ error: 'Missing "to" email address' }, { status: 400 });
    }

    const result = await emailService.sendTemplate({
      to,
      subject: 'KantaSwara Email System Test',
      templateKey: 'auth-welcome',
      category: 'NOTIFICATION',
      priority: 'HIGH',
      bypassPreferences: true,
      triggeredBy: user.id,
      variables: {
        userName: 'Admin',
      },
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error, emailLogId: result.emailLogId }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Test email sent successfully', logId: result.emailLogId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
