import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { logEmployeeAction } from '@/lib/console/audit';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    const invitation = await prisma.employeeInvitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invalid invitation token' }, { status: 400 });
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invitation expired' }, { status: 400 });
    }

    // Create Supabase Auth user
    const supabase = await createClient();
    
    // We create the user using the admin API because the user isn't authenticated yet
    // Since this is client side SDK, we can use signUp and wait for confirmation, 
    // or if email confirm is off, it just creates the user.
    // For internal tools, usually we would want auto-confirm.
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: invitation.email,
      password: password,
      options: {
        data: {
          full_name: invitation.fullName,
        },
      }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // Create Employee record
    const employee = await prisma.employee.create({
      data: {
        fullName: invitation.fullName,
        email: invitation.email,
        role: invitation.role,
        department: invitation.department,
        status: 'ACTIVE',
        invitationStatus: 'ACCEPTED',
      }
    });

    // Log action
    await logEmployeeAction({
      employeeId: employee.id,
      action: 'ACCEPTED_INVITE',
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    // Delete invitation
    await prisma.employeeInvitation.delete({
      where: { id: invitation.id },
    });

    return NextResponse.json({ success: true, redirectUrl: '/console/login' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
