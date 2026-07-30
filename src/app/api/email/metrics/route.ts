import { NextResponse } from 'next/server';
import { prisma } from '@server/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalSent, totalFailed, totalBounced, currentQueue] = await Promise.all([
      prisma.emailLog.count({
        where: { status: 'SENT', createdAt: { gte: twentyFourHoursAgo } },
      }),
      prisma.emailLog.count({
        where: { status: 'FAILED', createdAt: { gte: twentyFourHoursAgo } },
      }),
      prisma.emailLog.count({
        where: { status: 'BOUNCED', createdAt: { gte: twentyFourHoursAgo } },
      }),
      prisma.emailQueue.count({
        where: { status: 'QUEUED' },
      }),
    ]);

    const deliveryRate = totalSent + totalFailed > 0
      ? ((totalSent / (totalSent + totalFailed)) * 100).toFixed(2)
      : '100.00';

    return NextResponse.json({
      success: true,
      data: {
        last24Hours: {
          sent: totalSent,
          failed: totalFailed,
          bounced: totalBounced,
          deliveryRate: `${deliveryRate}%`,
        },
        queue: {
          pending: currentQueue,
        }
      }
    });
  } catch (err) {
    console.error('[EmailMetrics API] Error fetching metrics:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
