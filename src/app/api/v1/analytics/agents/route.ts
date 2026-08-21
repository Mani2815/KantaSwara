// =============================================================================
// GET /api/v1/analytics/agents — Agent Performance Analytics
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getAgentAnalytics } from '@server/services/analytics/analytics-query.service';
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

    const result = await getAgentAnalytics(organizationId, { range });

    return NextResponse.json({ agents: result });
  } catch (err) {
    console.error('[API] GET /analytics/agents error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
