// =============================================================================
// KantaSwara — Security Email Handlers
// =============================================================================

import { emailService } from '../../EmailService';
import type { EmailEventBus } from '../EventBus';
import type {
  SuspiciousLoginEvent,
  APIKeyCreatedEvent,
  APIKeyRevokedEvent,
  MFAEnabledEvent,
  MFADisabledEvent,
} from '../../types';

export function registerSecurityHandlers(bus: EmailEventBus): void {
  bus.on('SuspiciousLogin', async (payload: SuspiciousLoginEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.email, name: payload.name },
      subject: '⚠️ Suspicious sign-in detected on your account',
      templateKey: 'security-suspicious-login',
      category: 'SECURITY',
      priority: 'CRITICAL',
      bypassPreferences: true,
      triggeredByEvent: 'SuspiciousLogin',
      variables: {
        userName: payload.name,
        ipAddress: payload.ipAddress,
        location: payload.location ?? 'Unknown',
        userAgent: payload.userAgent,
        timestamp: payload.timestamp,
        securityUrl: payload.securityUrl,
        supportEmail: process.env.RESEND_REPLY_TO ?? 'support@kantaswara.com',
      },
    });
  });

  bus.on('APIKeyCreated', async (payload: APIKeyCreatedEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.email, name: payload.name },
      subject: `New API key created: ${payload.keyName}`,
      templateKey: 'security-api-key-created',
      category: 'SECURITY',
      priority: 'HIGH',
      bypassPreferences: true,
      triggeredByEvent: 'APIKeyCreated',
      variables: {
        userName: payload.name,
        keyName: payload.keyName,
        createdAt: payload.createdAt,
        ipAddress: payload.ipAddress ?? 'Unknown',
        supportEmail: process.env.RESEND_REPLY_TO ?? 'support@kantaswara.com',
      },
    });
  });

  bus.on('APIKeyRevoked', async (payload: APIKeyRevokedEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.email, name: payload.name },
      subject: `API key revoked: ${payload.keyName}`,
      templateKey: 'security-api-key-created', // Reuse or create dedicated template
      category: 'SECURITY',
      priority: 'HIGH',
      bypassPreferences: true,
      triggeredByEvent: 'APIKeyRevoked',
      variables: {
        userName: payload.name,
        keyName: payload.keyName,
        revokedAt: payload.revokedAt,
        supportEmail: process.env.RESEND_REPLY_TO ?? 'support@kantaswara.com',
      },
    });
  });

  bus.on('MFAEnabled', async (payload: MFAEnabledEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.email, name: payload.name },
      subject: '✅ Two-factor authentication enabled on your account',
      templateKey: 'auth-password-changed', // Reuse generic security confirmation
      category: 'SECURITY',
      priority: 'NORMAL',
      bypassPreferences: true,
      triggeredByEvent: 'MFAEnabled',
      variables: {
        userName: payload.name,
        action: 'Two-factor authentication was enabled',
        timestamp: new Date().toLocaleString(),
        supportEmail: process.env.RESEND_REPLY_TO ?? 'support@kantaswara.com',
      },
    });
  });

  bus.on('MFADisabled', async (payload: MFADisabledEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.email, name: payload.name },
      subject: '⚠️ Two-factor authentication disabled on your account',
      templateKey: 'auth-password-changed',
      category: 'SECURITY',
      priority: 'HIGH',
      bypassPreferences: true,
      triggeredByEvent: 'MFADisabled',
      variables: {
        userName: payload.name,
        action: 'Two-factor authentication was disabled',
        timestamp: new Date().toLocaleString(),
        supportEmail: process.env.RESEND_REPLY_TO ?? 'support@kantaswara.com',
      },
    });
  });
}
