// =============================================================================
// KantaSwara — Auth Email Handlers
// =============================================================================

import { emailService } from '../../EmailService';
import type { EmailEventBus } from '../EventBus';
import type {
  UserRegisteredEvent,
  PasswordResetRequestedEvent,
  EmailVerificationRequestedEvent,
  PasswordChangedEvent,
  LoginAlertEvent,
  AccountLockedEvent,
  EmployeeInvitedEvent,
} from '../../types';

export function registerAuthHandlers(bus: EmailEventBus): void {
  bus.on('UserRegistered', async (payload: UserRegisteredEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.email, name: payload.name },
      subject: `Welcome to KantaSwara, ${payload.name}!`,
      templateKey: 'auth-welcome',
      category: 'AUTH',
      priority: 'HIGH',
      bypassPreferences: true,
      triggeredByEvent: 'UserRegistered',
      variables: {
        userName: payload.name,
        userEmail: payload.email,
        verificationLink: payload.verificationLink,
      },
    });
  });

  bus.on('PasswordResetRequested', async (payload: PasswordResetRequestedEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.email, name: payload.name },
      subject: 'Reset your KantaSwara password',
      templateKey: 'auth-password-reset',
      category: 'AUTH',
      priority: 'CRITICAL',
      bypassPreferences: true,
      triggeredByEvent: 'PasswordResetRequested',
      variables: {
        userName: payload.name,
        resetLink: payload.resetLink,
        expiresIn: payload.expiresIn ?? '1 hour',
      },
    });
  });

  bus.on('EmailVerificationRequested', async (payload: EmailVerificationRequestedEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.email, name: payload.name },
      subject: 'Verify your KantaSwara email address',
      templateKey: 'auth-verify-email',
      category: 'AUTH',
      priority: 'HIGH',
      bypassPreferences: true,
      triggeredByEvent: 'EmailVerificationRequested',
      variables: {
        userName: payload.name,
        verificationLink: payload.verificationLink,
      },
    });
  });

  bus.on('PasswordChanged', async (payload: PasswordChangedEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.email, name: payload.name },
      subject: 'Your KantaSwara password was changed',
      templateKey: 'auth-password-changed',
      category: 'AUTH',
      priority: 'HIGH',
      bypassPreferences: true,
      triggeredByEvent: 'PasswordChanged',
      variables: {
        userName: payload.name,
        ipAddress: payload.ipAddress ?? 'Unknown',
        userAgent: payload.userAgent ?? 'Unknown',
        timestamp: new Date().toLocaleString(),
      },
    });
  });

  bus.on('LoginAlert', async (payload: LoginAlertEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.email, name: payload.name },
      subject: 'New sign-in to your KantaSwara account',
      templateKey: 'auth-login-alert',
      category: 'AUTH',
      priority: 'HIGH',
      bypassPreferences: true,
      triggeredByEvent: 'LoginAlert',
      variables: {
        userName: payload.name,
        ipAddress: payload.ipAddress,
        userAgent: payload.userAgent,
        location: payload.location ?? 'Unknown',
        timestamp: payload.timestamp,
      },
    });
  });

  bus.on('AccountLocked', async (payload: AccountLockedEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.email, name: payload.name },
      subject: 'Your KantaSwara account has been locked',
      templateKey: 'auth-account-locked',
      category: 'AUTH',
      priority: 'CRITICAL',
      bypassPreferences: true,
      triggeredByEvent: 'AccountLocked',
      variables: {
        userName: payload.name,
        reason: payload.reason,
        supportEmail: payload.supportEmail,
      },
    });
  });

  bus.on('EmployeeInvited', async (payload: EmployeeInvitedEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.email, name: payload.name },
      subject: "You're invited to join the KantaSwara team",
      templateKey: 'employee-invitation',
      category: 'EMPLOYEE',
      priority: 'HIGH',
      bypassPreferences: true,
      triggeredByEvent: 'EmployeeInvited',
      variables: {
        userName: payload.name,
        role: payload.role,
        department: payload.department,
        invitationLink: payload.invitationLink,
        invitedByName: payload.invitedByName,
        expiresAt: payload.expiresAt,
      },
    });
  });
}
