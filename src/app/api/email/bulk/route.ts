import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email';
import { createClient } from '@server/lib/supabase/server';
import { z } from 'zod';

const bulkEmailSchema = z.object({
  emails: z.array(
    z.object({
      to: z.string().email(),
      toName: z.string().optional(),
      subject: z.string(),
      templateKey: z.string(),
      variables: z.record(z.unknown()).optional(),
      organizationId: z.string().uuid().optional(),
    })
  ).min(1).max(100), // Max 100 per request
  delayMs: z.number().min(0).max(1000).optional(),
});

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
      return NextResponse.json({ error: 'Forbidden. Super admin only.' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = bulkEmailSchema.parse(body);

    const emailOptions = validatedData.emails.map(email => ({
      to: { email: email.to, name: email.toName },
      subject: email.subject,
      templateKey: email.templateKey,
      variables: email.variables,
      organizationId: email.organizationId,
      triggeredBy: user.id,
    }));

    const results = await emailService.sendBulk({
      emails: emailOptions,
      delayMs: validatedData.delayMs,
    });

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    return NextResponse.json({ 
      success: true, 
      total: results.length,
      successCount,
      failureCount,
      results 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
