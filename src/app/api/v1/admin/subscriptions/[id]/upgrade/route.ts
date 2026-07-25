import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@server/lib/prisma';
import { createClient } from '@/lib/supabase/client';
import { calculateProRata } from '@/lib/billing/helpers';

// PATCH /api/v1/admin/subscriptions/[id]/upgrade
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.app_metadata?.employee_role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const { newPlanId, customMonthlyPrice } = await req.json();
    if (!newPlanId) return NextResponse.json({ error: 'newPlanId is required' }, { status: 400 });

    const subscription = await prisma.organizationSubscription.findUnique({
      where: { id },
      include: { plan: true },
    });
    if (!subscription) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

    const newPlan = await prisma.subscriptionPlan.findUnique({ where: { id: newPlanId } });
    if (!newPlan) return NextResponse.json({ error: 'New plan not found' }, { status: 404 });

    const oldPrice = Number(subscription.customMonthlyPrice || subscription.plan.priceMonthly);
    const newPrice = Number(customMonthlyPrice || newPlan.priceMonthly);

    const proRatedCharge = calculateProRata(
      oldPrice,
      newPrice,
      subscription.currentPeriodStart,
      subscription.currentPeriodEnd
    );

    // Apply upgrade
    const updated = await prisma.organizationSubscription.update({
      where: { id },
      data: {
        planId: newPlanId,
        customMonthlyPrice: customMonthlyPrice || null,
      },
      include: { plan: true },
    });

    // Record history
    await prisma.renewalHistory.create({
      data: {
        subscriptionId: id,
        planId: newPlanId,
        periodStart: subscription.currentPeriodStart,
        periodEnd: subscription.currentPeriodEnd,
        amount: proRatedCharge,
        status: 'UPGRADED',
      },
    });

    // Notify customer
    await prisma.billingNotification.create({
      data: {
        organizationId: subscription.organizationId,
        type: 'PLAN_UPGRADED',
        title: 'Subscription Upgraded',
        body: `Your subscription has been upgraded to the ${newPlan.displayName} plan.`,
        metadata: { subscriptionId: id, oldPlan: subscription.plan.name, newPlan: newPlan.name },
      },
    });

    return NextResponse.json({ data: updated, meta: { proRatedCharge } });
  } catch (error) {
    console.error('[PATCH /admin/subscriptions/[id]/upgrade]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
