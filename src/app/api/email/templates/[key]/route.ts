import { NextRequest, NextResponse } from 'next/server';
import { TEMPLATE_REGISTRY } from '@/lib/email';
import { createClient } from '@server/lib/supabase/server';
import { prisma } from '@server/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role check - only admins can read templates
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'super_admin' && profile?.role !== 'solutions_admin' && profile?.role !== 'support_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { key } = await params;

    const registryEntry = TEMPLATE_REGISTRY[key];
    if (!registryEntry) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const dbEntry = await prisma.emailTemplate.findUnique({ where: { key } });

    return NextResponse.json({
      key: registryEntry.key,
      name: registryEntry.name,
      description: registryEntry.description,
      category: registryEntry.category,
      subject: registryEntry.subject,
      isMandatory: registryEntry.isMandatory,
      status: dbEntry?.status || 'ACTIVE',
      variables: dbEntry?.variables || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden. Super admin only.' }, { status: 403 });
    }

    const { key } = await params;
    const registryEntry = TEMPLATE_REGISTRY[key];
    
    if (!registryEntry) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    if (registryEntry.isMandatory) {
      return NextResponse.json({ error: 'Cannot disable mandatory system template' }, { status: 400 });
    }

    const body = await req.json();
    const status = body.status; // ACTIVE, INACTIVE

    if (status !== 'ACTIVE' && status !== 'INACTIVE') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updated = await prisma.emailTemplate.upsert({
      where: { key },
      update: { status },
      create: {
        key: registryEntry.key,
        name: registryEntry.name,
        description: registryEntry.description,
        category: registryEntry.category,
        subject: registryEntry.subject,
        isMandatory: registryEntry.isMandatory,
        status,
      }
    });

    return NextResponse.json({ success: true, status: updated.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
