import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@server/lib/prisma';
import { createClient } from '@/lib/supabase/client';
import { generateInvoiceNumber, calculateInvoiceTotals } from '@/lib/billing/helpers';

// GET /api/v1/admin/invoices — List all invoices (admin)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || undefined;
  const type = searchParams.get('type') || undefined;
  const orgId = searchParams.get('orgId') || undefined;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const invoices = await prisma.invoice.findMany({
    where: {
      ...(status && { paymentStatus: status as any }),
      ...(type && { type }),
      ...(orgId && { organizationId: orgId }),
    },
    include: {
      organization: { select: { name: true, slug: true } },
      items: true,
      payments: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  });

  const total = await prisma.invoice.count({
    where: {
      ...(status && { paymentStatus: status as any }),
      ...(type && { type }),
      ...(orgId && { organizationId: orgId }),
    },
  });

  return NextResponse.json({ data: invoices, meta: { total, page, limit } });
}

// POST /api/v1/admin/invoices — Create invoice manually
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.app_metadata?.employee_role;
    if (!role || !['SUPER_ADMIN', 'FINANCE_ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const {
      organizationId,
      type,
      items,
      discountAmount = 0,
      billingPeriodStart,
      billingPeriodEnd,
      dueDate,
      notes,
      internalNotes,
    } = body;

    if (!organizationId || !type || !items?.length || !dueDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const processedItems = items.map((item: any) => ({
      ...item,
      amount: Number(item.quantity) * Number(item.unitPrice),
      taxable: item.taxable ?? true,
    }));

    const totals = await calculateInvoiceTotals(
      processedItems.map((i: any) => ({ amount: i.amount, taxable: i.taxable })),
      discountAmount
    );

    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        organizationId,
        type,
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        taxAmount: totals.taxAmount,
        totalAmount: totals.totalAmount,
        paidAmount: 0,
        balanceDue: totals.totalAmount,
        status: 'open',
        paymentStatus: 'pending',
        dueDate: new Date(dueDate),
        billingPeriodStart: billingPeriodStart ? new Date(billingPeriodStart) : undefined,
        billingPeriodEnd: billingPeriodEnd ? new Date(billingPeriodEnd) : undefined,
        notes,
        internalNotes,
        createdBy: user!.id,
        items: {
          create: processedItems.map((item: any) => ({
            description: item.description,
            type: item.type,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
            taxable: item.taxable,
          })),
        },
      },
      include: { items: true, organization: true },
    });

    await prisma.billingNotification.create({
      data: {
        organizationId,
        type: 'INVOICE_GENERATED',
        title: `Invoice ${invoiceNumber} Generated`,
        body: `Invoice for ₹${totals.totalAmount.toLocaleString()} is due by ${new Date(dueDate).toLocaleDateString()}.`,
        metadata: { invoiceId: invoice.id },
      },
    });

    return NextResponse.json({ data: invoice }, { status: 201 });
  } catch (error) {
    console.error('[POST /admin/invoices]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
