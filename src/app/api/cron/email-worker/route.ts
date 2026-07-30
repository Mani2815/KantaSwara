import { NextResponse } from 'next/server';
import { RetryManager } from '@server/lib/email/retry';
import { emailService } from '@server/lib/email/EmailService';

// Set maximum execution time (Next.js App Router specific, for Vercel/similar)
export const maxDuration = 300; 
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // Validate authorization (cron secret)
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const pending = await RetryManager.getPendingRetries();
    
    if (pending.length === 0) {
      return NextResponse.json({ success: true, processed: 0, message: 'Queue is empty' });
    }

    let processedCount = 0;
    for (const entry of pending) {
      try {
        const result = await emailService.retryFailed(entry.emailLogId);
        if (!result.success) {
          // If retryFailed returned success: false, we need to handle the failure backoff
          await RetryManager.handleFailure(entry.emailLogId, result.error ?? 'Unknown error');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        await RetryManager.handleFailure(entry.emailLogId, msg);
      }
      processedCount++;
    }

    return NextResponse.json({ success: true, processed: processedCount });
  } catch (error) {
    console.error('[EmailWorker] Execution Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
