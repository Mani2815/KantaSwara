// =============================================================================
// Analytics Engine — Barrel Exports
// =============================================================================

// ── Types ───────────────────────────────────────────────────────────────────
export type {
  MetricTimeRange,
  AggregationType,
  TimeRangeFilter,
  SessionAnalyticsRecord,
  AgentAnalytics,
  ProviderAnalytics,
  OrganizationDashboard,
  AnalyticsQuery,
  ProviderCostModel,
} from './analytics.types';
export { PROVIDER_COST_MODELS } from './analytics.types';

// ── Collector ───────────────────────────────────────────────────────────────
export {
  initSessionTracking,
  recordTurnMetrics,
  recordFailover,
  recordToolUsage,
  recordError,
  flushSessionAnalytics,
  calculateCost,
} from './analytics-collector.service';

// ── Query ───────────────────────────────────────────────────────────────────
export {
  getSessionAnalytics,
  getAgentAnalytics,
  getOrganizationDashboard,
} from './analytics-query.service';
