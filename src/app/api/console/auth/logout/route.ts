import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { logEmployeeAction } from '@/lib/console/audit';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const employee = await prisma.employee.findUnique({
        where: { email: user.email },
      });

      if (employee) {
        await logEmployeeAction({
          employeeId: employee.id,
          action: 'LOGOUT',
          ipAddress: request.headers.get('x-forwarded-for') || undefined,
          userAgent: request.headers.get('user-agent') || undefined,
        });
      }
    }

    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
