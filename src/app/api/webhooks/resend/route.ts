import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { prisma } from '@server/lib/prisma';
import { EmailLogger } from '@server/lib/email/logger';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  
  if (!secret) {
    console.warn('[ResendWebhook] Webhook secret not configured. Rejecting request.');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // Get Svix headers for verification
  const svix_id = req.headers.get('svix-id');
  const svix_timestamp = req.headers.get('svix-timestamp');
  const svix_signature = req.headers.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing Svix headers' }, { status: 400 });
  }

  const payload = await req.text();
  const wh = new Webhook(secret);
  let event: any;

  try {
    event = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('[ResendWebhook] Verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Process the verified event
  const { type, data } = event;
  const providerId = data?.email_id;

  if (!providerId) {
    return NextResponse.json({ error: 'Missing email_id in payload' }, { status: 400 });
  }

  try {
    const log = await prisma.emailLog.findFirst({
      where: { providerId },
    });

    if (!log) {
      console.warn(`[ResendWebhook] EmailLog not found for providerId: ${providerId}`);
      return NextResponse.json({ success: true, message: 'Log not found, skipping' });
    }

    switch (type) {
      case 'email.delivered':
        await prisma.emailLog.update({
          where: { id: log.id },
          data: { status: 'SENT', errorMessage: null },
        });
        break;
      case 'email.bounced':
        await prisma.emailLog.update({
          where: { id: log.id },
          data: { status: 'BOUNCED', errorMessage: 'Hard bounce reported by provider' },
        });
        break;
      case 'email.complained':
        await prisma.emailLog.update({
          where: { id: log.id },
          data: { status: 'COMPLAINED', errorMessage: 'Recipient marked as spam' },
        });
        break;
      case 'email.opened':
      case 'email.clicked':
        // Optional: Update provider_response or a new analytics table
        break;
      default:
        console.log(`[ResendWebhook] Unhandled event type: ${type}`);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[ResendWebhook] Processing error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
