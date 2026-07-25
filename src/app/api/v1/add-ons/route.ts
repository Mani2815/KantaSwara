import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@server/lib/prisma';
import { createClient } from '@/lib/supabase/client';

// GET /api/v1/add-ons
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const addOns = await prisma.addOn.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ data: addOns });
  } catch (error) {
    console.error('[GET /add-ons]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
