import { supabaseAdmin } from '@server/lib/supabase/admin';

export interface AuditLogData {
  organizationId: string;
  userId: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'password_reset' | 'role_change' | 'settings_change';
  resourceType: string;
  resourceId?: string;
  oldValues?: any;
  newValues?: any;
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
          old_values: data.oldValues || {},
          new_values: data.newValues || {},
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
}
