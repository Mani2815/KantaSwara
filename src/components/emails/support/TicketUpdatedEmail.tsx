import { Text } from '@react-email/components';
import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { EmailButton } from '../components/EmailButton';

interface TicketUpdatedEmailProps {
  userName: string;
  ticketId: string;
  subject: string;
  status: string;
  ticketUrl: string;
  appName?: string;
  appUrl?: string;
  supportEmail?: string;
  currentYear?: number;
}

export default function TicketUpdatedEmail({
  userName = 'Customer',
  ticketId = 'TKT-1001',
  subject = 'Issue with billing',
  status = 'In Progress',
  ticketUrl = 'https://kantaswara.com/support/TKT-1001',
  appName = 'KantaSwara',
  appUrl = 'https://kantaswara.com',
  supportEmail = 'support@kantaswara.com',
  currentYear = new Date().getFullYear(),
}: TicketUpdatedEmailProps) {
  return (
    <BaseEmailLayout
      previewText={`Status update for your ticket ${ticketId}.`}
      appName={appName}
      appUrl={appUrl}
      supportEmail={supportEmail}
      currentYear={currentYear}
    >
      <Text style={heading}>Ticket Status Updated: #{ticketId}</Text>
      
      <Text style={paragraph}>
        Hi {userName},
      </Text>
      
      <Text style={paragraph}>
        The status of your support ticket <strong>#{ticketId}</strong> ("{subject}") has been updated to <strong>{status}</strong>.
      </Text>
      
      <Text style={paragraph}>
        You can view the latest updates and respond to our team here:
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
