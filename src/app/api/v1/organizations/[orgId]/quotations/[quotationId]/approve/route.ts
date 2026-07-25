import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@server/lib/prisma';
import { createClient } from '@/lib/supabase/client';
import { generateInvoiceNumber, calculateInvoiceTotals } from '@/lib/billing/helpers';

// POST /api/v1/org/[orgId]/quotations/[quotationId]/approve
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; quotationId: string }> }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { orgId, quotationId } = await params;

    // Only org_admin of this org (or Super Admin) can approve
    const isEmployee = user.app_metadata?.is_employee === 'true';
    const userOrgId = user.app_metadata?.organization_id;
    const userRole = user.app_metadata?.organization_role;
    if (!isEmployee && (userOrgId !== orgId || userRole !== 'org_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: { items: true },
    });

    if (!quotation) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    if (quotation.organizationId !== orgId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (quotation.status !== 'sent') {
      return NextResponse.json({ error: 'Only sent quotations can be approved' }, { status: 400 });
    }
    if (quotation.validUntil < new Date()) {
      return NextResponse.json({ error: 'This quotation has expired' }, { status: 400 });
    }

    // Auto-generate invoice from approved quotation
    const invoiceNumber = await generateInvoiceNumber();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // 7-day payment terms

    const totals = await calculateInvoiceTotals(
      quotation.items.map((item) => ({
        amount: Number(item.amount),
        taxable: item.taxable,
      })),
      Number(quotation.discountAmount)
    );

    const [updatedQuotation, invoice] = await prisma.$transaction([
      prisma.quotation.update({
        where: { id: quotationId },
        data: {
          status: 'approved',
          approvedAt: new Date(),
          approvedBy: user.id,
        },
      }),
      prisma.invoice.create({
        data: {
          invoiceNumber,
          organizationId: orgId,
          quotationId,
          type: quotation.type,
          subtotal: totals.subtotal,
          discountAmount: totals.discountAmount,
          taxAmount: totals.taxAmount,
          totalAmount: totals.totalAmount,
          paidAmount: 0,
          balanceDue: totals.totalAmount,
          status: 'open',
          paymentStatus: 'pending',
          dueDate,
          items: {
            create: quotation.items.map((item) => ({
              description: item.description,
              type: item.type,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              amount: item.amount,
              taxable: item.taxable,
            })),
          },
        },
      }),
    ]);

    // Link invoice to quotation
    await prisma.quotation.update({
      where: { id: quotationId },
      data: { status: 'invoiced', invoiceId: invoice.id },
    });

    // Notification
    await prisma.billingNotification.create({
      data: {
        organizationId: orgId,
        type: 'QUOTATION_APPROVED',
        title: `Quotation ${quotation.quotationNumber} Approved`,
        body: `Invoice ${invoiceNumber} has been generated. Payment due by ${dueDate.toLocaleDateString()}.`,
        metadata: { quotationId, invoiceId: invoice.id },
      },
    });

    return NextResponse.json({ data: { quotation: updatedQuotation, invoice } });
  } catch (error) {
    console.error('[POST /org/[orgId]/quotations/[quotationId]/approve]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
