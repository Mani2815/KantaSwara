// =============================================================================
// KantaSwara — Billing Email Handlers
// =============================================================================

import { emailService } from '../../EmailService';
import type { EmailEventBus } from '../EventBus';
import type {
  SubscriptionCreatedEvent,
  InvoiceGeneratedEvent,
  PaymentFailedEvent,
  PaymentSuccessfulEvent,
  SubscriptionExpiringEvent,
  TrialEndingEvent,
} from '../../types';

export function registerBillingHandlers(bus: EmailEventBus): void {
  bus.on('SubscriptionCreated', async (payload: SubscriptionCreatedEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.adminEmail, name: payload.adminName },
      subject: `Your KantaSwara ${payload.planName} subscription is active`,
      templateKey: 'billing-subscription-created',
      category: 'BILLING',
      priority: 'HIGH',
      organizationId: payload.organizationId,
      triggeredByEvent: 'SubscriptionCreated',
      variables: {
        userName: payload.adminName,
        organizationName: payload.organizationName,
        planName: payload.planName,
        amount: payload.amount,
        billingCycle: payload.billingCycle,
        startDate: payload.startDate,
      },
    });
  });

  bus.on('InvoiceGenerated', async (payload: InvoiceGeneratedEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.adminEmail, name: payload.adminName },
      subject: `Invoice ${payload.invoiceNumber} from KantaSwara`,
      templateKey: 'billing-invoice-generated',
      category: 'BILLING',
      priority: 'NORMAL',
      organizationId: payload.organizationId,
      triggeredByEvent: 'InvoiceGenerated',
      variables: {
        userName: payload.adminName,
        organizationName: payload.organizationName,
        invoiceNumber: payload.invoiceNumber,
        amount: payload.amount,
        dueDate: payload.dueDate,
        invoiceUrl: payload.invoiceUrl,
      },
    });
  });

  bus.on('PaymentFailed', async (payload: PaymentFailedEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.adminEmail, name: payload.adminName },
      subject: `Action required: Payment failed for Invoice ${payload.invoiceNumber}`,
      templateKey: 'billing-payment-failed',
      category: 'BILLING',
      priority: 'CRITICAL',
      organizationId: payload.organizationId,
      bypassPreferences: true,
      triggeredByEvent: 'PaymentFailed',
      variables: {
        userName: payload.adminName,
        organizationName: payload.organizationName,
        invoiceNumber: payload.invoiceNumber,
        amount: payload.amount,
        dueDate: payload.dueDate,
        supportEmail: process.env.RESEND_REPLY_TO ?? 'support@kantaswara.com',
      },
    });
  });

  bus.on('PaymentSuccessful', async (payload: PaymentSuccessfulEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.adminEmail, name: payload.adminName },
      subject: `Payment confirmed for Invoice ${payload.invoiceNumber}`,
      templateKey: 'billing-payment-successful',
      category: 'BILLING',
      priority: 'NORMAL',
      organizationId: payload.organizationId,
      triggeredByEvent: 'PaymentSuccessful',
      variables: {
        userName: payload.adminName,
        organizationName: payload.organizationName,
        invoiceNumber: payload.invoiceNumber,
        amount: payload.amount,
        paidDate: payload.paidDate,
      },
    });
  });

  bus.on('SubscriptionExpiring', async (payload: SubscriptionExpiringEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.adminEmail, name: payload.adminName },
      subject: 'Your KantaSwara subscription expires soon',
      templateKey: 'billing-subscription-expiring',
      category: 'BILLING',
      priority: 'HIGH',
      organizationId: payload.organizationId,
      triggeredByEvent: 'SubscriptionExpiring',
      variables: {
        userName: payload.adminName,
        organizationName: payload.organizationName,
        planName: payload.planName,
        expiryDate: payload.expiryDate,
        renewalUrl: payload.renewalUrl,
      },
    });
  });

  bus.on('TrialEnding', async (payload: TrialEndingEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.adminEmail, name: payload.adminName },
      subject: `Your KantaSwara trial ends in ${payload.daysRemaining} days`,
      templateKey: 'billing-trial-ending',
      category: 'BILLING',
      priority: 'HIGH',
      organizationId: payload.organizationId,
      triggeredByEvent: 'TrialEnding',
      variables: {
        userName: payload.adminName,
        organizationName: payload.organizationName,
        daysRemaining: payload.daysRemaining,
        upgradeUrl: payload.upgradeUrl,
      },
    });
  });
}
