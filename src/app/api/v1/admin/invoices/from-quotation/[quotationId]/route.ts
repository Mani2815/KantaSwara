import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@server/lib/prisma';
import { createClient } from '@/lib/supabase/client';
import { generateInvoiceNumber, calculateInvoiceTotals } from '@/lib/billing/helpers';

// POST /api/v1/admin/invoices/from-quotation/[quotationId]
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ quotationId: string }> }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.app_metadata?.employee_role;
    if (!role || !['SUPER_ADMIN', 'FINANCE_ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { quotationId } = await params;
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: { items: true },
    });

    if (!quotation) return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    if (quotation.status !== 'approved') {
      return NextResponse.json({ error: 'Quotation must be approved before invoicing' }, { status: 400 });
    }
    if (quotation.invoiceId) {
      return NextResponse.json({ error: 'Invoice already exists for this quotation' }, { status: 409 });
    }

    const invoiceNumber = await generateInvoiceNumber();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    const totals = await calculateInvoiceTotals(
      quotation.items.map((item) => ({
        amount: Number(item.amount),
        taxable: item.taxable,
      })),
      Number(quotation.discountAmount)
    );

    const [invoice] = await prisma.$transaction([
      prisma.invoice.create({
        data: {
          invoiceNumber,
          organizationId: quotation.organizationId,
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
          createdBy: user!.id,
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
      prisma.quotation.update({
        where: { id: quotationId },
        data: { status: 'invoiced' }, // We'll link invoiceId below
      }),
    ]);

    await prisma.quotation.update({
      where: { id: quotationId },
      data: { invoiceId: invoice.id },
    });

    return NextResponse.json({ data: invoice }, { status: 201 });
  } catch (error) {
    console.error('[POST /admin/invoices/from-quotation]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
