import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@server/lib/prisma';
import { createClient } from '@/lib/supabase/client';

// GET /api/v1/admin/billing/revenue
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.app_metadata?.employee_role;
    if (!role || !['SUPER_ADMIN', 'FINANCE_ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [activeSubscriptions, outstandingInvoices, allPaidInvoices] = await Promise.all([
      prisma.organizationSubscription.findMany({
        where: { status: 'active' },
        include: { plan: true },
      }),
      prisma.invoice.findMany({
        where: { paymentStatus: { in: ['pending', 'partially_paid', 'overdue'] } },
      }),
      prisma.invoice.aggregate({
        where: { paymentStatus: 'paid' },
        _sum: { totalAmount: true },
      }),
    ]);

    let mrr = 0;
    const revenueByPlan: Record<string, number> = {};

    activeSubscriptions.forEach((sub) => {
      const price = sub.customMonthlyPrice ? Number(sub.customMonthlyPrice) : Number(sub.plan.priceMonthly);
      mrr += price;
      
      const planName = sub.plan.name;
      revenueByPlan[planName] = (revenueByPlan[planName] || 0) + price;
    });

    const arr = mrr * 12;
    const activeCount = activeSubscriptions.length;
    const arpu = activeCount > 0 ? mrr / activeCount : 0;
    const outstandingPayments = outstandingInvoices.reduce((sum, inv) => sum + Number(inv.balanceDue), 0);
    const totalRevenue = Number(allPaidInvoices._sum.totalAmount || 0);

    return NextResponse.json({
      data: {
        mrr,
        arr,
        totalRevenue,
        activeSubscriptions: activeCount,
        revenueByPlan,
        outstandingPayments,
        arpu,
      },
    });
  } catch (error) {
    console.error('[GET /admin/billing/revenue]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
