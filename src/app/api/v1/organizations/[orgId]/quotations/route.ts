import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@server/lib/prisma';
import { createClient } from '@/lib/supabase/client';

// GET /api/v1/org/[orgId]/quotations — List quotations for an organization
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { orgId } = await params;

    // Org users can only see their own org. Employees can see any.
    const isEmployee = user.app_metadata?.is_employee === 'true';
    const userOrgId = user.app_metadata?.organization_id;
    if (!isEmployee && userOrgId !== orgId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;

    const quotations = await prisma.quotation.findMany({
      where: {
        organizationId: orgId,
        ...(status && { status: status as any }),
      },
      include: { items: true, plan: { select: { displayName: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: quotations });
  } catch (error) {
    console.error('[GET /org/[orgId]/quotations]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
