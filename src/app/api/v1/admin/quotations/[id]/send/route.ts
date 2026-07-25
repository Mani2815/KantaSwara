import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@server/lib/prisma';
import { createClient } from '@/lib/supabase/client';

async function getEmployeeRole(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.app_metadata?.employee_role || null;
}

// POST /api/v1/admin/quotations/[id]/send
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const role = await getEmployeeRole(req);
    if (!role || !['SUPER_ADMIN', 'FINANCE_ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const quotation = await prisma.quotation.findUnique({ where: { id } });

    if (!quotation) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    if (quotation.status !== 'draft') {
      return NextResponse.json({ error: 'Only draft quotations can be sent' }, { status: 400 });
    }

    const updated = await prisma.quotation.update({
      where: { id },
      data: { status: 'sent', sentAt: new Date() },
    });

    // Notify organization
    await prisma.billingNotification.create({
      data: {
        organizationId: quotation.organizationId,
        type: 'QUOTATION_SENT',
        title: `Quotation ${quotation.quotationNumber} Sent`,
        body: `Please review and approve your quotation "${quotation.title}" worth ₹${Number(quotation.totalAmount).toLocaleString()}.`,
        metadata: { quotationId: id },
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('[POST /admin/quotations/[id]/send]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
