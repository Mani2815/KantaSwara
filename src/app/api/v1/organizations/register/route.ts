import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@server/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, full_name, organization_name } = body;

    if (!email || !password || !organization_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          organization_name,
        },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Return success without sensitive info
    return NextResponse.json({
      message: 'Registration successful. Verification email sent.',
      user_id: data.user?.id,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
