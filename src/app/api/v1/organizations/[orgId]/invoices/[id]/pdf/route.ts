import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@server/lib/prisma';
import { createClient } from '@/lib/supabase/client';

// GET /api/v1/org/[orgId]/invoices/[id]/pdf
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; id: string }> }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { orgId, id } = await params;
    const isEmployee = user.app_metadata?.is_employee === 'true';
    const userOrgId = user.app_metadata?.organization_id;

    if (!isEmployee && userOrgId !== orgId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
        organization: true,
        payments: true,
      },
    });

    if (!invoice) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    if (invoice.organizationId !== orgId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Note: In a production environment, this would integrate with Puppeteer, 
    // PDFKit, or an external service (like DocSpring/CraftMyPDF) to stream a binary PDF buffer.
    // For now, we return the structured invoice data optimized for a client-side PDF renderer.
    return NextResponse.json({
      data: {
        ...invoice,
        _pdfConfig: {
          template: 'standard_b2b',
          downloadFilename: `${invoice.invoiceNumber}.pdf`,
        },
      },
    });
  } catch (error) {
    console.error('[GET /org/[orgId]/invoices/[id]/pdf]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
