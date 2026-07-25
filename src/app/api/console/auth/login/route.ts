import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { logEmployeeAction } from '@/lib/console/audit';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Check if employee exists and is active
    const employee = await prisma.employee.findUnique({
      where: { email },
    });

    if (!employee || employee.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Invalid credentials or account disabled' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Attempt login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      await logEmployeeAction({
        employeeId: employee.id,
        action: 'LOGIN_FAILED',
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      });
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Update last login
    await prisma.employee.update({
      where: { id: employee.id },
      data: { lastLoginAt: new Date() },
    });

    await logEmployeeAction({
      employeeId: employee.id,
      action: 'LOGIN_SUCCESS',
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      user: data.user,
      role: employee.role,
      redirectUrl: getRedirectUrlForRole(employee.role),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function getRedirectUrlForRole(role: string) {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/superadmin/dashboard';
    case 'AI_SOLUTIONS_ADMIN':
      return '/delivery-console';
    case 'SUPPORT_ADMIN':
      return '/support-console';
    default:
      return '/console';
  }
}
