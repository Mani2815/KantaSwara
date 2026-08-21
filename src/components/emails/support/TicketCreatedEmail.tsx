import { Text } from '@react-email/components';
import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { EmailButton } from '../components/EmailButton';

interface TicketCreatedEmailProps {
  userName: string;
  ticketId: string;
  subject: string;
  ticketUrl: string;
  appName?: string;
  appUrl?: string;
  supportEmail?: string;
  currentYear?: number;
}

export default function TicketCreatedEmail({
  userName = 'Customer',
  ticketId = 'TKT-1001',
  subject = 'Issue with billing',
  ticketUrl = 'https://kantaswara.com/support/TKT-1001',
  appName = 'KantaSwara',
  appUrl = 'https://kantaswara.com',
  supportEmail = 'support@kantaswara.com',
  currentYear = new Date().getFullYear(),
}: TicketCreatedEmailProps) {
  return (
    <BaseEmailLayout
      previewText={`Your support ticket ${ticketId} has been created.`}
      appName={appName}
      appUrl={appUrl}
      supportEmail={supportEmail}
      currentYear={currentYear}
    >
      <Text style={heading}>Support Ticket Created</Text>
      
      <Text style={paragraph}>
        Hi {userName},
      </Text>
      
      <Text style={paragraph}>
        We have received your request and created support ticket <strong>#{ticketId}</strong> for your issue: "{subject}".
      </Text>
      
      <Text style={paragraph}>
        Our support team will review it and get back to you shortly. You can track the status of your ticket and provide additional details here:
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
