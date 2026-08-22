import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email';
import { createClient } from '@server/lib/supabase/server';
import { z } from 'zod';

const sendEmailSchema = z.object({
  to: z.string().email(),
  toName: z.string().optional(),
  subject: z.string(),
  templateKey: z.string(),
  variables: z.record(z.string(), z.unknown()).optional(),
  category: z.enum([
    'AUTH',
    'ORGANIZATION',
    'EMPLOYEE',
    'DELIVERY',
    'AI_BUILDER',
    'BILLING',
    'SUPPORT',
    'DEMO',
    'SECURITY',
    'NOTIFICATION',
  ]).optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'NORMAL', 'LOW']).optional(),
  organizationId: z.string().uuid().optional(),
  bypassPreferences: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role check - only admins can use the direct send API
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'super_admin' && profile?.role !== ('solutions_admin' as any) && profile?.role !== ('support_admin' as any)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = sendEmailSchema.parse(body);

    const result = await emailService.sendTemplate({
      to: { email: validatedData.to, name: validatedData.toName },
      subject: validatedData.subject,
      templateKey: validatedData.templateKey,
      variables: validatedData.variables,
      category: validatedData.category,
      priority: validatedData.priority,
      organizationId: validatedData.organizationId,
      triggeredBy: user.id,
      bypassPreferences: validatedData.bypassPreferences,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error, emailLogId: result.emailLogId }, { status: 400 });
    }

    return NextResponse.json({ success: true, emailLogId: result.emailLogId, providerId: result.providerId });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
