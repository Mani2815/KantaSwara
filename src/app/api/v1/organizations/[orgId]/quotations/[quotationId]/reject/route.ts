import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@server/lib/prisma';
import { createClient } from '@/lib/supabase/client';

// POST /api/v1/org/[orgId]/quotations/[quotationId]/reject
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; quotationId: string }> }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { orgId, quotationId } = await params;

    const isEmployee = user.app_metadata?.is_employee === 'true';
    const userOrgId = user.app_metadata?.organization_id;
    const userRole = user.app_metadata?.organization_role;
    if (!isEmployee && (userOrgId !== orgId || userRole !== 'org_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { reason } = await req.json();
    if (!reason) return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });

    const quotation = await prisma.quotation.findUnique({ where: { id: quotationId } });
    if (!quotation) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    if (quotation.organizationId !== orgId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (quotation.status !== 'sent') {
      return NextResponse.json({ error: 'Only sent quotations can be rejected' }, { status: 400 });
    }

    const updated = await prisma.quotation.update({
      where: { id: quotationId },
      data: { status: 'rejected', rejectedAt: new Date(), rejectionReason: reason },
    });

    await prisma.billingNotification.create({
      data: {
        organizationId: orgId,
        type: 'QUOTATION_REJECTED',
        title: `Quotation ${quotation.quotationNumber} Rejected`,
        body: `The customer rejected the quotation. Reason: ${reason}`,
        metadata: { quotationId, reason },
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('[POST /org/[orgId]/quotations/[quotationId]/reject]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
