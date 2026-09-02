import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@server/lib/prisma';
import {
  generateQuotationNumber,
  calculateInvoiceTotals,
  applyDiscount,
} from '@/lib/billing/helpers';
import { createClient } from '@/lib/supabase/client';

async function getEmployeeFromRequest(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const role = user.app_metadata?.employee_role;
  if (!role) return null;
  return { id: user.id, email: user.email!, role };
}

// GET /api/v1/admin/quotations — List all quotations
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const orgId = searchParams.get('orgId') || undefined;

    const quotations = await prisma.quotation.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(orgId && { organizationId: orgId }),
      },
      include: {
        organization: { select: { name: true, slug: true } },
        plan: { select: { displayName: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: quotations });
  } catch (error) {
    console.error('[GET /admin/quotations]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/v1/admin/quotations — Create a new quotation
export async function POST(req: NextRequest) {
  try {
    const employee = await getEmployeeFromRequest(req);
    if (!employee || !['SUPER_ADMIN', 'AI_SOLUTIONS_ADMIN', 'FINANCE_ADMIN'].includes(employee.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const {
      organizationId,
      agentRequestId,
      planId,
      title,
      description,
      type,
      items, // Array of { description, type, quantity, unitPrice, taxable, addOnId? }
      discountId,
      validUntil,
      notes,
      internalNotes,
    } = body;

    if (!organizationId || !title || !type || !items?.length || !validUntil) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Calculate line item amounts
    const processedItems = items.map((item: any) => ({
      ...item,
      amount: Number(item.quantity) * Number(item.unitPrice),
    }));

    // Get discount if provided
    let discountAmount = 0;
    let discount = null;
    if (discountId) {
      discount = await prisma.discount.findUnique({ where: { id: discountId } });
      if (discount && discount.isActive) {
        const subtotal = processedItems.reduce((s: number, i: any) => s + i.amount, 0);
        discountAmount = applyDiscount(subtotal, discount);
      }
    }

    const totals = await calculateInvoiceTotals(
      processedItems.map((i: any) => ({ amount: i.amount, taxable: i.taxable ?? true })),
      discountAmount
    );

    const quotationNumber = await generateQuotationNumber();

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        organizationId,
        agentRequestId,
        planId,
        title,
        description,
        type,
        subtotal: totals.subtotal,
        discountId,
        discountAmount: totals.discountAmount,
        taxAmount: totals.taxAmount,
        totalAmount: totals.totalAmount,
        validUntil: new Date(validUntil),
        notes,
        internalNotes,
        createdBy: employee.id,
        items: {
          create: processedItems.map((item: any) => ({
            description: item.description,
            type: item.type,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
            taxable: item.taxable ?? true,
            addOnId: item.addOnId,
          })),
        },
      },
      include: { items: true, organization: true },
    });

    // Create billing notification
    await prisma.billingNotification.create({
      data: {
        organizationId,
        type: 'QUOTATION_CREATED',
        title: `New Quotation Created: ${quotationNumber}`,
        body: `A new quotation "${title}" for ₹${totals.totalAmount.toLocaleString()} has been created.`,
        metadata: { quotationId: quotation.id, quotationNumber },
      },
    });

    return NextResponse.json({ data: quotation }, { status: 201 });
  } catch (error) {
    console.error('[POST /admin/quotations]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
