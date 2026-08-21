import { Text } from '@react-email/components';
import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { EmailButton } from '../components/EmailButton';

interface TicketAssignedEmailProps {
  assigneeName: string;
  ticketId: string;
  subject: string;
  priority: string;
  ticketUrl: string;
  appName?: string;
  appUrl?: string;
  supportEmail?: string;
  currentYear?: number;
}

export default function TicketAssignedEmail({
  assigneeName = 'Agent',
  ticketId = 'TKT-1001',
  subject = 'Issue with billing',
  priority = 'High',
  ticketUrl = 'https://kantaswara.com/internal/support/TKT-1001',
  appName = 'KantaSwara',
  appUrl = 'https://kantaswara.com',
  supportEmail = 'support@kantaswara.com',
  currentYear = new Date().getFullYear(),
}: TicketAssignedEmailProps) {
  return (
    <BaseEmailLayout
      previewText={`Ticket ${ticketId} has been assigned to you.`}
      appName={appName}
      appUrl={appUrl}
      supportEmail={supportEmail}
      currentYear={currentYear}
    >
      <Text style={heading}>Ticket Assigned: #{ticketId}</Text>
      
      <Text style={paragraph}>
        Hi {assigneeName},
      </Text>
      
      <Text style={paragraph}>
        Support ticket <strong>#{ticketId}</strong> ("{subject}") has been assigned to you.
      </Text>
      
      <Text style={paragraph}>
        <strong>Priority:</strong> {priority}
      </Text>
      
      <Text style={paragraph}>
        Please review the ticket details and respond to the customer as soon as possible.
      </Text>

      <div style={buttonContainer}>
        <EmailButton href={ticketUrl}>View Ticket</EmailButton>
      </div>
    </BaseEmailLayout>
  );
}

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#111827',
  marginTop: '0',
  marginBottom: '24px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#374151',
  marginBottom: '16px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  marginTop: '24px',
  marginBottom: '24px',
};
