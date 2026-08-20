// =============================================================================
// Analytics Query Service
// =============================================================================
// Provides read APIs for session, agent, provider, and organization analytics.
// All queries are scoped to organizationId for tenant isolation.
// =============================================================================

import { prisma } from '@server/lib/prisma';
import { Prisma } from '@prisma/client';
import type {
  AnalyticsQuery,
  AgentAnalytics,
  ProviderAnalytics,
  OrganizationDashboard,
  TimeRangeFilter,
} from './analytics.types';

// =============================================================================
// SESSION ANALYTICS
// =============================================================================

/**
 * Query session analytics with filters and pagination.
 */
export async function getSessionAnalytics(
  query: AnalyticsQuery
): Promise<{
  sessions: Array<Record<string, unknown>>;
  total: number;
  page: number;
  limit: number;
}> {
  const { organizationId, timeRange, agentId, page = 1, limit = 20 } = query;
  const { start, end } = resolveTimeRange(timeRange);

  const where: Prisma.VoiceSessionWhereInput = {
    organizationId,
    startedAt: { gte: start, lte: end },
  };

  if (agentId) where.agentId = agentId;

  const [sessions, total] = await Promise.all([
    prisma.voiceSession.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { startedAt: 'desc' },
    }),
    prisma.voiceSession.count({ where }),
  ]);

  return {
    sessions: sessions.map((s) => ({
      id: s.id,
      agentId: s.agentId,
      state: s.state,
      startedAt: s.startedAt,
      endedAt: s.endedAt,
      durationSeconds: s.durationSeconds,
      turnCount: s.turnCount,
      totalTokens: s.totalTokens,
      estimatedCost: s.estimatedCost,
      avgLatencyMs: s.avgLatencyMs,
      metadata: s.metadata,
    })),
    total,
    page,
    limit,
  };
}

// =============================================================================
// AGENT ANALYTICS
// =============================================================================

/**
 * Get aggregated analytics per agent for an organization.
 */
export async function getAgentAnalytics(
  organizationId: string,
  timeRange: TimeRangeFilter
): Promise<AgentAnalytics[]> {
  const { start, end } = resolveTimeRange(timeRange);

  const agents = await prisma.agent.findMany({
    where: { organizationId, deletedAt: null },
    select: { id: true, name: true },
  });

  const results: AgentAnalytics[] = [];

  for (const agent of agents) {
    const sessions = await prisma.voiceSession.findMany({
      where: {
        organizationId,
        agentId: agent.id,
        startedAt: { gte: start, lte: end },
      },
      select: {
        durationSeconds: true,
        turnCount: true,
        totalTokens: true,
        estimatedCost: true,
        avgLatencyMs: true,
        state: true,
        metadata: true,
      },
    });

    const total = sessions.length;
    if (total === 0) {
      results.push({
        agentId: agent.id,
        agentName: agent.name,
        totalSessions: 0,
        activeSessions: 0,
        avgSessionDuration: 0,
        avgTurnsPerSession: 0,
        avgLatencyMs: 0,
        totalTokens: 0,
        totalCost: 0,
        successRate: 0,
        errorRate: 0,
        topEndReasons: [],
      });
      continue;
    }

    const active = sessions.filter((s) => !['completed', 'failed', 'expired'].includes(s.state)).length;
    const completed = sessions.filter((s) => s.state === 'completed').length;
    const failed = sessions.filter((s) => s.state === 'failed').length;

    // Count end reasons
    const reasonCounts = new Map<string, number>();
    for (const s of sessions) {
      const meta = s.metadata as Record<string, unknown> | null;
      const reason = (meta?.endReason as string) || s.state;
      reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1);
    }

    results.push({
      agentId: agent.id,
      agentName: agent.name,
      totalSessions: total,
      activeSessions: active,
      avgSessionDuration: Math.round(
        sessions.reduce((sum, s) => sum + s.durationSeconds, 0) / total
      ),
      avgTurnsPerSession: Math.round(
        sessions.reduce((sum, s) => sum + s.turnCount, 0) / total
      ),
      avgLatencyMs: Math.round(
        sessions.reduce((sum, s) => sum + s.avgLatencyMs, 0) / total
      ),
      totalTokens: sessions.reduce((sum, s) => sum + s.totalTokens, 0),
      totalCost: Math.round(
        sessions.reduce((sum, s) => sum + Number(s.estimatedCost), 0) * 10000
      ) / 10000,
      successRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      errorRate: total > 0 ? Math.round((failed / total) * 100) : 0,
      topEndReasons: Array.from(reasonCounts.entries())
        .map(([reason, count]) => ({ reason, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    });
  }

  return results;
}

// =============================================================================
// ORGANIZATION DASHBOARD
// =============================================================================

/**
 * Get top-level organization dashboard metrics.
 */
export async function getOrganizationDashboard(
  organizationId: string,
  timeRange: TimeRangeFilter
): Promise<OrganizationDashboard> {
  const { start, end } = resolveTimeRange(timeRange);

  const sessions = await prisma.voiceSession.findMany({
    where: {
      organizationId,
      startedAt: { gte: start, lte: end },
    },
    select: {
      durationSeconds: true,
      turnCount: true,
      totalTokens: true,
      estimatedCost: true,
      avgLatencyMs: true,
      state: true,
      startedAt: true,
    },
  });

  const total = sessions.length;
  const failed = sessions.filter((s) => s.state === 'failed').length;

  // Active agents count
  const activeAgentCount = await prisma.agent.count({
    where: { organizationId, status: 'active', deletedAt: null },
  });

  // Daily trend
  const dailyMap = new Map<string, { sessions: number; tokens: number; cost: number }>();
  for (const s of sessions) {
    const dateKey = s.startedAt.toISOString().slice(0, 10);
    const entry = dailyMap.get(dateKey) || { sessions: 0, tokens: 0, cost: 0 };
    entry.sessions++;
    entry.tokens += s.totalTokens;
    entry.cost += Number(s.estimatedCost);
    dailyMap.set(dateKey, entry);
  }

  const agentBreakdown = await getAgentAnalytics(organizationId, timeRange);

  return {
    organizationId,
    timeRange,
    totalSessions: total,
    totalTokens: sessions.reduce((sum, s) => sum + s.totalTokens, 0),
    totalCost: Math.round(
      sessions.reduce((sum, s) => sum + Number(s.estimatedCost), 0) * 10000
    ) / 10000,
    avgSessionDuration: total > 0
      ? Math.round(sessions.reduce((sum, s) => sum + s.durationSeconds, 0) / total)
      : 0,
    avgLatencyMs: total > 0
      ? Math.round(sessions.reduce((sum, s) => sum + s.avgLatencyMs, 0) / total)
      : 0,
    activeAgents: activeAgentCount,
    errorRate: total > 0 ? Math.round((failed / total) * 100) : 0,
    agentBreakdown,
    providerBreakdown: [], // Populated from health monitor snapshots
    dailyTrend: Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        sessions: data.sessions,
        tokens: data.tokens,
        cost: Math.round(data.cost * 10000) / 10000,
      }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
}

// =============================================================================
// HELPERS
// =============================================================================

function resolveTimeRange(filter: TimeRangeFilter): { start: Date; end: Date } {
  const end = filter.endDate || new Date();
  let start: Date;

  switch (filter.range) {
    case '1h':
      start = new Date(end.getTime() - 60 * 60 * 1000);
      break;
    case '24h':
      start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case 'custom':
      start = filter.startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return { start, end };
}
