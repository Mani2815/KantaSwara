import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { logEmployeeAction } from '@/lib/console/audit';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const inviter = await prisma.employee.findUnique({
      where: { email: user.email },
    });

    if (!inviter || inviter.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { email, fullName, department, role, notes } = await request.json();

    // Check if employee already exists
    const existingEmployee = await prisma.employee.findUnique({ where: { email } });
    if (existingEmployee) {
      return NextResponse.json({ error: 'Employee already exists' }, { status: 400 });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48); // 48 hour expiry

    const invitation = await prisma.employeeInvitation.create({
      data: {
        email,
        fullName,
        department,
        role,
        notes,
        token,
        expiresAt,
        invitedBy: inviter.id,
      },
    });

    await logEmployeeAction({
      employeeId: inviter.id,
      action: 'INVITED',
      targetId: invitation.id,
      newValue: { email, role, department },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    // For now, return token in response for development
    return NextResponse.json({
      success: true,
      invitationUrl: `/console/activate-account?token=${token}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
