import { NextRequest, NextResponse } from 'next/server';
import { EmailPreferenceManager } from '@/lib/email';
import { createClient } from '@server/lib/supabase/server';
import { z } from 'zod';

const preferencesSchema = z.object({
  marketing: z.boolean().optional(),
  systemNotifications: z.boolean().optional(),
  billingEmails: z.boolean().optional(),
  securityAlerts: z.boolean().optional(),
  projectNotifications: z.boolean().optional(),
  supportEmails: z.boolean().optional(),
  newsletter: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Attempt to get orgId from app_metadata (from JWT)
    const organizationId = user.app_metadata?.organization_id;

    const preferences = await EmailPreferenceManager.getOrCreate(user.id, organizationId);
    
    return NextResponse.json(preferences);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizationId = user.app_metadata?.organization_id;

    const body = await req.json();
    const validatedData = preferencesSchema.parse(body);

    const updated = await EmailPreferenceManager.update(user.id, validatedData, organizationId);

    return NextResponse.json({ success: true, preferences: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
