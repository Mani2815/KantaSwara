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
  let dbStatus = 'healthy';
  let redisStatus = 'healthy';
  let providersStatus = 'healthy';
  let overallStatus = 'healthy';

  // ── Database Check ──────────────────────────────────────────────────────
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = 'unavailable';
    overallStatus = 'unhealthy';
  }

  // ── Redis Check (Optional) ─────────────────────────────────────────────────────────
  try {
    const redisOk = await isRedisHealthy();
    if (!redisOk) {
      redisStatus = 'unavailable';
      if (overallStatus !== 'unhealthy') overallStatus = 'degraded';
    }
  } catch {
    redisStatus = 'unavailable';
    if (overallStatus !== 'unhealthy') overallStatus = 'degraded';
  }

  // ── Provider Check ──────────────────────────────────────────────────────
  let providers = { stt: [], llm: [], tts: [] };
  try {
    providers = getRegisteredProviders() as any;
  } catch {
    providersStatus = 'unavailable';
  }

  const result = {
    status: overallStatus,
    database: dbStatus,
    redis: redisStatus,
    aiProviders: providersStatus,
    providersList: providers,
    timestamp: new Date().toISOString(),
    uptime: Math.round((Date.now() - startTime) / 1000),
    version: process.env.npm_package_version || '2.0.0',
  };

  const statusCode = overallStatus === 'unhealthy' ? 503 : 200;
  return NextResponse.json(result, { status: statusCode });
}
