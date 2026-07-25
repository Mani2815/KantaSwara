import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@server/lib/prisma';
import { createClient } from '@/lib/supabase/client';

// PATCH /api/v1/admin/subscriptions/[id]/suspend
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
    const { reason } = await req.json();

    const subscription = await prisma.organizationSubscription.findUnique({ where: { id } });
    if (!subscription) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

    const updated = await prisma.organizationSubscription.update({
      where: { id },
      data: { status: 'suspended', suspendedAt: new Date(), suspensionReason: reason },
    });

    await prisma.billingNotification.create({
      data: {
        organizationId: subscription.organizationId,
        type: 'SUBSCRIPTION_SUSPENDED',
        title: 'Subscription Suspended',
        body: `Your subscription has been suspended. Reason: ${reason || 'Non-payment'}. Please settle your outstanding balance to resume service.`,
        metadata: { subscriptionId: id, reason },
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('[PATCH /admin/subscriptions/[id]/suspend]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
