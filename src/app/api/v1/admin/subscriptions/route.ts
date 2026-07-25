import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@server/lib/prisma';
import { createClient } from '@/lib/supabase/client';

// POST /api/v1/admin/subscriptions — Create a subscription (after implementation invoice paid)
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.app_metadata?.employee_role;
    if (!role || !['SUPER_ADMIN', 'FINANCE_ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { organizationId, planId, startDate, discountId, notes, customMonthlyPrice, customMinutes } = body;

    if (!organizationId || !planId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if subscription already exists
    const existing = await prisma.organizationSubscription.findUnique({
      where: { organizationId },
    });
    if (existing && existing.status === 'active') {
      return NextResponse.json({ error: 'Organization already has an active subscription' }, { status: 409 });
    }

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1); // 1-month billing cycle

    const subscription = await prisma.organizationSubscription.upsert({
      where: { organizationId },
      create: {
        organizationId,
        planId,
        status: 'active',
        currentPeriodStart: start,
        currentPeriodEnd: end,
        renewalDate: end,
        discountId,
        notes,
        customMonthlyPrice,
        customMinutes,
        createdBy: user!.id,
      },
      update: {
        planId,
        status: 'active',
        currentPeriodStart: start,
        currentPeriodEnd: end,
        renewalDate: end,
        discountId,
        notes,
        customMonthlyPrice,
        customMinutes,
        canceledAt: null,
        suspendedAt: null,
        suspensionReason: null,
      },
      include: { plan: true, organization: true },
    });

    return NextResponse.json({ data: subscription }, { status: 201 });
  } catch (error) {
    console.error('[POST /admin/subscriptions]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
