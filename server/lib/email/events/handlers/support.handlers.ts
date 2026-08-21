import { emailService } from '../../EmailService';
import type { EmailEventBus } from '../EventBus';
import type {
  TicketCreatedEvent,
  TicketAssignedEvent,
  TicketUpdatedEvent,
  TicketClosedEvent,
  CustomerReplyEvent,
  InternalReplyEvent,
} from '../../types';

export function registerSupportHandlers(bus: EmailEventBus): void {
  bus.on('TicketCreated', async (payload: TicketCreatedEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.email, name: payload.name },
      subject: `Support Ticket Created: #${payload.ticketId}`,
      templateKey: 'support-ticket-created',
      category: 'SUPPORT',
      triggeredByEvent: 'TicketCreated',
      variables: {
        userName: payload.name,
        ticketId: payload.ticketId,
        subject: payload.subject,
        ticketUrl: payload.ticketUrl,
      },
    });
  });

  bus.on('TicketAssigned', async (payload: TicketAssignedEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.email, name: payload.assigneeName },
      subject: `Ticket Assigned: #${payload.ticketId}`,
      templateKey: 'support-ticket-assigned',
      category: 'SUPPORT',
      triggeredByEvent: 'TicketAssigned',
      variables: {
        assigneeName: payload.assigneeName,
        ticketId: payload.ticketId,
        subject: payload.subject,
        priority: payload.priority,
        ticketUrl: payload.ticketUrl,
      },
    });
  });

  bus.on('TicketUpdated', async (payload: TicketUpdatedEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.email, name: payload.name },
      subject: `Ticket Update: #${payload.ticketId}`,
      templateKey: 'support-ticket-updated',
      category: 'SUPPORT',
      triggeredByEvent: 'TicketUpdated',
      variables: {
        userName: payload.name,
        ticketId: payload.ticketId,
        subject: payload.subject,
        status: payload.status,
        ticketUrl: payload.ticketUrl,
      },
    });
  });

  bus.on('TicketClosed', async (payload: TicketClosedEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.email, name: payload.name },
      subject: `Ticket Closed: #${payload.ticketId}`,
      templateKey: 'support-ticket-closed',
      category: 'SUPPORT',
      triggeredByEvent: 'TicketClosed',
      variables: {
        userName: payload.name,
        ticketId: payload.ticketId,
        subject: payload.subject,
        ticketUrl: payload.ticketUrl,
      },
    });
  });

  bus.on('CustomerReply', async (payload: CustomerReplyEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.email, name: payload.assigneeName },
      subject: `New Reply: #${payload.ticketId}`,
      templateKey: 'support-customer-reply',
      category: 'SUPPORT',
      triggeredByEvent: 'CustomerReply',
      variables: {
        assigneeName: payload.assigneeName,
        ticketId: payload.ticketId,
        subject: payload.subject,
        replySnippet: payload.replySnippet,
        ticketUrl: payload.ticketUrl,
      },
    });
  });

  bus.on('InternalReply', async (payload: InternalReplyEvent) => {
    await emailService.sendTemplate({
      to: { email: payload.email, name: payload.name },
      subject: `Support Reply: #${payload.ticketId}`,
      templateKey: 'support-internal-reply',
      category: 'SUPPORT',
      triggeredByEvent: 'InternalReply',
      variables: {
        userName: payload.name,
        ticketId: payload.ticketId,
        subject: payload.subject,
        replySnippet: payload.replySnippet,
        ticketUrl: payload.ticketUrl,
      },
    });
  });
}
