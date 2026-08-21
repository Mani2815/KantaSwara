// =============================================================================
// Analytics Worker
// =============================================================================
// Processes analytics aggregation jobs from the analytics queue.
// Generates periodic summaries and cost alerts.
// =============================================================================

import { createWorker, QUEUE_NAMES } from '../queue';

/**
 * Start the analytics worker.
 */
export function startAnalyticsWorker() {
  const worker = createWorker(
    QUEUE_NAMES.ANALYTICS,
    async (job) => {
      const { type, organizationId, payload } = job.data as {
        type: string;
        organizationId: string;
        payload: Record<string, unknown>;
      };

      console.log(
        `[AnalyticsWorker] Processing "${type}" for org ${organizationId}`
      );

      switch (type) {
        case 'daily-summary': {
          const { getOrganizationDashboard } = await import(
            '@server/services/analytics/analytics-query.service'
          );
          const dashboard = await getOrganizationDashboard(organizationId, {
            range: '24h',
          });
          console.log(
            `[AnalyticsWorker] Daily summary: ${dashboard.totalSessions} sessions, $${dashboard.totalCost} cost`
          );
          return { type, summary: dashboard };
        }

        case 'weekly-report': {
          const { getOrganizationDashboard } = await import(
            '@server/services/analytics/analytics-query.service'
          );
          const dashboard = await getOrganizationDashboard(organizationId, {
            range: '7d',
          });
          console.log(
            `[AnalyticsWorker] Weekly report: ${dashboard.totalSessions} sessions, $${dashboard.totalCost} cost`
          );
          return { type, summary: dashboard };
        }

        case 'cost-alert': {
          const threshold = (payload.threshold as number) || 100;
          const { getOrganizationDashboard } = await import(
            '@server/services/analytics/analytics-query.service'
          );
          const dashboard = await getOrganizationDashboard(organizationId, {
            range: '30d',
          });

          if (dashboard.totalCost > threshold) {
            console.warn(
              `[AnalyticsWorker] COST ALERT: Org ${organizationId} has spent $${dashboard.totalCost} (threshold: $${threshold})`
            );
            // Future: trigger notification
          }
          return { type, cost: dashboard.totalCost, threshold, alerted: dashboard.totalCost > threshold };
        }

        default:
          console.warn(`[AnalyticsWorker] Unknown job type: ${type}`);
          return { type, status: 'unknown' };
      }
    },
    { concurrency: 1 }
  );

  console.log('[AnalyticsWorker] Started');
  return worker;
}
