// =============================================================================
// GET /api/v1/health — System Health Check
// =============================================================================
// Basic health check: DB connectivity, Redis, provider availability.
// Used by load balancers, Kubernetes probes, and monitoring.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@server/lib/prisma';
import { isRedisHealthy } from '@server/lib/redis/redis';
import { getRegisteredProviders } from '@server/services/runtime/provider-registry.service';

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    database: { status: string; latencyMs: number };
    redis: { status: string };
    providers: { stt: string[]; llm: string[]; tts: string[] };
  };
  version: string;
}

const startTime = Date.now();

export async function GET(request: NextRequest) {
  const result: HealthCheckResult = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.round((Date.now() - startTime) / 1000),
    checks: {
      database: { status: 'unknown', latencyMs: 0 },
      redis: { status: 'unknown' },
      providers: { stt: [], llm: [], tts: [] },
    },
    version: process.env.npm_package_version || '2.0.0',
  };

  // ── Database Check ──────────────────────────────────────────────────────
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    result.checks.database = {
      status: 'connected',
      latencyMs: Date.now() - dbStart,
    };
  } catch {
    result.checks.database = { status: 'disconnected', latencyMs: 0 };
    result.status = 'unhealthy';
  }

  // ── Redis Check ─────────────────────────────────────────────────────────
  try {
    const redisOk = await isRedisHealthy();
    result.checks.redis = { status: redisOk ? 'connected' : 'disconnected' };
    if (!redisOk) result.status = 'degraded';
  } catch {
    result.checks.redis = { status: 'disconnected' };
    result.status = 'degraded'; // Redis down = degraded, not unhealthy
  }

  // ── Provider Check ──────────────────────────────────────────────────────
  try {
    result.checks.providers = getRegisteredProviders();
  } catch {
    result.checks.providers = { stt: [], llm: [], tts: [] };
  }

  const statusCode = result.status === 'unhealthy' ? 503 : 200;
  return NextResponse.json(result, { status: statusCode });
}
