import { Text } from '@react-email/components';
import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { EmailButton } from '../components/EmailButton';

interface TicketClosedEmailProps {
  userName: string;
  ticketId: string;
  subject: string;
  ticketUrl: string;
  appName?: string;
  appUrl?: string;
  supportEmail?: string;
  currentYear?: number;
}

export default function TicketClosedEmail({
  userName = 'Customer',
  ticketId = 'TKT-1001',
  subject = 'Issue with billing',
  ticketUrl = 'https://kantaswara.com/support/TKT-1001',
  appName = 'KantaSwara',
  appUrl = 'https://kantaswara.com',
  supportEmail = 'support@kantaswara.com',
  currentYear = new Date().getFullYear(),
}: TicketClosedEmailProps) {
  return (
    <BaseEmailLayout
      previewText={`Your support ticket ${ticketId} has been closed.`}
      appName={appName}
      appUrl={appUrl}
      supportEmail={supportEmail}
      currentYear={currentYear}
    >
      <Text style={heading}>Ticket Closed: #{ticketId}</Text>
      
      <Text style={paragraph}>
        Hi {userName},
      </Text>
      
      <Text style={paragraph}>
        Your support ticket <strong>#{ticketId}</strong> ("{subject}") has been marked as closed. We hope your issue was resolved satisfactorily.
      </Text>
      
      <Text style={paragraph}>
        If you need further assistance, you can reply to this email or reopen the ticket through your dashboard:
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
