import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@server/lib/prisma';

// POST /api/v1/usage/record
// Internal system API - NOT meant for public consumption. Should be protected by an internal secret.
export async function POST(req: NextRequest) {
  try {
    // In production, verify internal secret token:
    // const authHeader = req.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.INTERNAL_USAGE_API_KEY}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { organizationId, agentId, callId, type, durationSeconds, quantity, unit } = body;

    if (!organizationId || !type || !unit) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const now = new Date();
    // Normalize billingMonth to the 1st of the current month (e.g. 2024-03-01T00:00:00.000Z)
    const billingMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    // 1. Create UsageRecord
    const record = await prisma.usageRecord.create({
      data: {
        organizationId,
        agentId,
        callId,
        type,
        durationSeconds,
        quantity,
        unit,
        billingMonth,
      },
    });

    // 2. Increment ongoing UsageReport (aggregating)
    // First, find or create the current aggregating report
    const report = await prisma.usageReport.upsert({
      where: {
        organizationId_billingMonth: {
          organizationId,
          billingMonth,
        },
      },
      create: {
        organizationId,
        billingMonth,
        billingPeriodStart: billingMonth,
        billingPeriodEnd: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999)),
        includedMinutes: 0, // This should actually be fetched from the subscription
        overageRatePerMin: 0, // This should actually be fetched from the subscription
        status: 'aggregating',
      },
      update: {},
    });

    // Update the aggregations based on the new record
    if (type === 'INBOUND_CALL' || type === 'OUTBOUND_CALL') {
      const minutes = Math.ceil((durationSeconds || 0) / 60);
      await prisma.usageReport.update({
        where: { id: report.id },
        data: {
          inboundCalls: type === 'INBOUND_CALL' ? { increment: 1 } : undefined,
          outboundCalls: type === 'OUTBOUND_CALL' ? { increment: 1 } : undefined,
          totalCalls: { increment: 1 },
          totalMinutes: { increment: minutes },
        },
      });
    }

    return NextResponse.json({ data: record }, { status: 201 });
  } catch (error) {
    console.error('[POST /usage/record]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
