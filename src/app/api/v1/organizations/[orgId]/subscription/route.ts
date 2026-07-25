import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@server/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const orgId = (await params).orgId;

    const subscription = await prisma.organizationSubscription.findUnique({
      where: {
        organizationId: orgId,
      },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    return NextResponse.json({ data: subscription });
  } catch (error) {
    console.error('Failed to fetch subscription:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
