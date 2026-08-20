// =============================================================================
// GET /api/v1/analytics/sessions — Session Analytics
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getSessionAnalytics } from '@server/services/analytics/analytics-query.service';
import type { MetricTimeRange } from '@server/services/analytics/analytics.types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const organizationId = searchParams.get('organizationId');
    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    const range = (searchParams.get('range') || '30d') as MetricTimeRange;
    const agentId = searchParams.get('agentId') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await getSessionAnalytics({
      organizationId,
      timeRange: { range },
      agentId,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('[API] GET /analytics/sessions error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
