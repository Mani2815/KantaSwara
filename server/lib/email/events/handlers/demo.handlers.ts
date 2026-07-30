import { emailService } from '../../EmailService';
import type { EmailEventBus } from '../EventBus';
import type {
  DemoCompletedEvent,
  ContactSalesEvent,
  DemoMeetingConfirmedEvent,
  TrialInvitationEvent,
} from '../../types';

export function registerDemoHandlers(bus: EmailEventBus): void {
  bus.on('DemoCompleted', async (payload: DemoCompletedEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.email, name: payload.name },
      subject: 'Your KantaSwara Demo Summary',
      templateKey: 'demo-summary',
      category: 'DEMO',
      triggeredByEvent: 'DemoCompleted',
      variables: {
        userName: payload.name,
        summary: payload.summary,
      },
    });
  });

  bus.on('ContactSales', async (payload: ContactSalesEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.email, name: payload.name },
      subject: "We've received your request",
      templateKey: 'demo-contact-sales',
      category: 'DEMO',
      triggeredByEvent: 'ContactSales',
      variables: {
        userName: payload.name,
        salesEmail: payload.salesEmail,
      },
    });
  });

  bus.on('DemoMeetingConfirmed', async (payload: DemoMeetingConfirmedEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.email, name: payload.name },
      subject: 'Demo Meeting Confirmed',
      templateKey: 'demo-meeting-confirmation',
      category: 'DEMO',
      triggeredByEvent: 'DemoMeetingConfirmed',
      variables: {
        userName: payload.name,
        meetingTime: payload.meetingTime,
        meetingLink: payload.meetingLink,
        hostName: payload.hostName,
      },
    });
  });

  bus.on('TrialInvitation', async (payload: TrialInvitationEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.email, name: payload.name },
      subject: 'Exclusive Trial Invitation 🎁',
      templateKey: 'demo-trial-invitation',
      category: 'DEMO',
      triggeredByEvent: 'TrialInvitation',
      variables: {
        userName: payload.name,
        trialLink: payload.trialLink,
        days: payload.days,
      },
    });
  });
}
