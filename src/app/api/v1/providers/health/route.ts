// =============================================================================
// GET /api/v1/providers/health — Provider Health Status
// POST /api/v1/providers/health/reset — Reset Provider Health
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  getAllHealthSnapshots,
  getHealthSnapshot,
} from '@server/services/providers/health/provider-health.service';
import {
  getCircuitState,
  resetCircuitBreaker,
} from '@server/services/providers/failover/failover-manager.service';
import { getRegisteredProviders } from '@server/services/runtime/provider-registry.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');

    if (providerId) {
      const snapshot = getHealthSnapshot(providerId);
      const circuit = getCircuitState(providerId);
      return NextResponse.json({ provider: { ...snapshot, circuit }});
    }

    const snapshots = getAllHealthSnapshots();
    const registered = getRegisteredProviders();

    return NextResponse.json({
      providers: snapshots,
      registered,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[API] GET /providers/health error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { providerId, action } = body;

    if (!providerId) {
      return NextResponse.json({ error: 'providerId is required' }, { status: 400 });
    }

    if (action === 'reset') {
      resetCircuitBreaker(providerId);
      return NextResponse.json({
        message: `Circuit breaker and health reset for "${providerId}"`,
        provider: getHealthSnapshot(providerId),
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('[API] POST /providers/health error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
