import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@server/lib/prisma';
import { createClient } from '@/lib/supabase/client';

// PATCH /api/v1/admin/subscriptions/[id]/cancel
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
    const { cancelAtPeriodEnd } = await req.json();

    const subscription = await prisma.organizationSubscription.findUnique({ where: { id } });
    if (!subscription) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

    const updated = await prisma.organizationSubscription.update({
      where: { id },
      data: cancelAtPeriodEnd
        ? { cancelAtPeriodEnd: true }
        : { status: 'canceled', canceledAt: new Date(), cancelAtPeriodEnd: false },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('[PATCH /admin/subscriptions/[id]/cancel]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
