import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@server/lib/prisma';
import { createClient } from '@/lib/supabase/client';

// POST /api/v1/admin/payments/[id]/verify — Verify a recorded payment
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.app_metadata?.employee_role;
    if (role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden — Only Super Admin can verify payments' }, { status: 403 });
    }

    const { id } = await params;
    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    if (payment.status === 'paid') {
      return NextResponse.json({ error: 'Payment already verified' }, { status: 400 });
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: { status: 'paid', verifiedBy: user!.id, verifiedAt: new Date() },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('[POST /admin/payments/[id]/verify]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
