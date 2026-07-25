import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@server/lib/prisma';
import { createClient } from '@/lib/supabase/client';
import { recalculateInvoicePaymentStatus } from '@/lib/billing/helpers';

// POST /api/v1/admin/payments — Record a manual payment
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.app_metadata?.employee_role;
    if (!role || !['SUPER_ADMIN', 'FINANCE_ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { invoiceId, amount, paymentDate, paymentMethod, referenceNumber, transactionId, notes } = body;

    if (!invoiceId || !amount || !paymentDate || !paymentMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount,
        paymentDate: new Date(paymentDate),
        paymentMethod,
        referenceNumber,
        transactionId,
        notes,
        status: 'pending', // pending verification
        createdBy: user!.id,
      },
    });

    // Update invoice paid amount
    const newPaidAmount = Number(invoice.paidAmount) + Number(amount);
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { paidAmount: newPaidAmount },
    });

    // Recalculate payment status
    await recalculateInvoicePaymentStatus(invoiceId);

    // Notification
    await prisma.billingNotification.create({
      data: {
        organizationId: invoice.organizationId,
        type: 'PAYMENT_RECEIVED',
        title: `Payment of ₹${Number(amount).toLocaleString()} Received`,
        body: `A payment of ₹${Number(amount).toLocaleString()} has been recorded for invoice ${invoice.invoiceNumber}.`,
        metadata: { invoiceId, paymentId: payment.id },
      },
    });

    return NextResponse.json({ data: payment }, { status: 201 });
  } catch (error) {
    console.error('[POST /admin/payments]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
