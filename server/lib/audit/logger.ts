import { supabaseAdmin } from '@server/lib/supabase/admin';

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'password_reset'
  | 'role_change'
  | 'settings_change'
  | 'deploy'
  | 'api_key_create'
  | 'api_key_revoke'
  | 'secret_update'
  | 'tool_execute'
  | 'provider_failover'
  | 'knowledge_index'
  | 'workflow_execute';

export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditLogData {
  organizationId: string;
  userId: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  oldValues?: unknown;
  newValues?: unknown;
  severity?: AuditSeverity;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditLogger {
  static async log(data: AuditLogData) {
    try {
      const { error } = await supabaseAdmin
        .from('audit_logs')
        .insert({
          organization_id: data.organizationId,
          user_id: data.userId,
          action: data.action,
          resource_type: data.resourceType,
          resource_id: data.resourceId,
          old_values: (data.oldValues || {}) as Record<string, unknown>,
          new_values: {
            ...(typeof data.newValues === 'object' && data.newValues !== null ? data.newValues : {}),
            _severity: data.severity || 'info',
            _metadata: data.metadata || {},
          } as Record<string, unknown>,
          ip_address: data.ipAddress,
          user_agent: data.userAgent,
        });

      if (error) {
        console.error('AuditLogger error inserting log:', error);
      }
    } catch (e) {
      console.error('AuditLogger exception:', e);
    }
  }

  /**
   * Log a critical security event with extra context.
   */
  static async logCritical(
    data: Omit<AuditLogData, 'severity'>
  ) {
    await AuditLogger.log({ ...data, severity: 'critical' });
  }

  /**
   * Log a provider failover event.
   */
  static async logFailover(
    organizationId: string,
    fromProvider: string,
    toProvider: string,
    providerType: string,
    reason: string
  ) {
    await AuditLogger.log({
      organizationId,
      userId: 'system',
      action: 'provider_failover',
      resourceType: 'provider',
      resourceId: fromProvider,
      severity: 'warning',
      metadata: {
        fromProvider,
        toProvider,
        providerType,
        reason,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Log a tool execution event.
   */
  static async logToolExecution(
    organizationId: string,
    toolId: string,
    sessionId: string,
    success: boolean,
    durationMs: number
  ) {
    await AuditLogger.log({
      organizationId,
      userId: 'system',
      action: 'tool_execute',
      resourceType: 'tool',
      resourceId: toolId,
      severity: success ? 'info' : 'warning',
      metadata: {
        sessionId,
        success,
        durationMs,
      },
    });
  }
}
