import { NextRequest, NextResponse } from 'next/server';
import { TEMPLATE_REGISTRY } from '@/lib/email';
import { createClient } from '@server/lib/supabase/server';
import { prisma } from '@server/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role check - only admins can list templates
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'super_admin' && profile?.role !== 'solutions_admin' && profile?.role !== 'support_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch DB overrides/status for templates
    const dbTemplates = await prisma.emailTemplate.findMany();
    const dbTemplateMap = new Map(dbTemplates.map(t => [t.key, t]));

    // Combine static registry with DB state
    const combinedTemplates = Object.entries(TEMPLATE_REGISTRY).map(([key, entry]) => {
      const dbEntry = dbTemplateMap.get(key);
      return {
        key: entry.key,
        name: entry.name,
        description: entry.description,
        category: entry.category,
        subject: entry.subject,
        isMandatory: entry.isMandatory,
        status: dbEntry?.status || 'ACTIVE',
      };
    });

    return NextResponse.json({ templates: combinedTemplates });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
