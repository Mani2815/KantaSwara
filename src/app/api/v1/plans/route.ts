import { NextResponse } from 'next/server';
import { prisma } from '@server/lib/prisma';

export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        priceMonthly: 'asc',
      },
    });

    return NextResponse.json({ data: plans });
  } catch (error) {
    console.error('Failed to fetch subscription plans:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate body...
    const { name, displayName, priceMonthly, implementationFee, maxAgents, includedMinutes, maxTeamMembers, storageLimitGB, apiRateLimit, supportLevel, overageRatePerMin } = body;

    const newPlan = await prisma.subscriptionPlan.create({
      data: {
        name,
        displayName: displayName || name,
        priceMonthly,
        implementationFee: implementationFee || 0,
        maxAgents,
        includedMinutes,
        maxTeamMembers,
        storageLimitGB,
        apiRateLimit,
        supportLevel,
        overageRatePerMin,
        isActive: true,
      },
    });

    return NextResponse.json({ data: newPlan }, { status: 201 });
  } catch (error) {
    console.error('Failed to create subscription plan:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
