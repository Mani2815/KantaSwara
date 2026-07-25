import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@server/lib/prisma';
import { createClient } from '@/lib/supabase/client';

// GET /api/v1/org/[orgId]/billing/summary
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { orgId } = await params;
    const isEmployee = user.app_metadata?.is_employee === 'true';
    const userOrgId = user.app_metadata?.organization_id;
    if (!isEmployee && userOrgId !== orgId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [subscription, openInvoices, currentUsage] = await Promise.all([
      prisma.organizationSubscription.findUnique({
        where: { organizationId: orgId },
        include: { plan: true, addOns: { include: { addOn: true } } },
      }),
      prisma.invoice.findMany({
        where: { organizationId: orgId, status: { in: ['open', 'overdue'] } },
        orderBy: { dueDate: 'asc' },
      }),
      prisma.usageReport.findFirst({
        where: { organizationId: orgId, status: 'aggregating' },
        orderBy: { billingMonth: 'desc' },
      }),
    ]);

    const outstandingAmount = openInvoices.reduce((sum, inv) => sum + Number(inv.balanceDue), 0);

    return NextResponse.json({
      data: {
        subscription,
        outstandingAmount,
        openInvoices,
        currentUsage,
      },
    });
  } catch (error) {
    console.error('[GET /org/[orgId]/billing/summary]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
