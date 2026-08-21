import { Text } from '@react-email/components';
import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { EmailButton } from '../components/EmailButton';

interface CustomerReplyEmailProps {
  assigneeName: string;
  ticketId: string;
  subject: string;
  replySnippet: string;
  ticketUrl: string;
  appName?: string;
  appUrl?: string;
  supportEmail?: string;
  currentYear?: number;
}

export default function CustomerReplyEmail({
  assigneeName = 'Agent',
  ticketId = 'TKT-1001',
  subject = 'Issue with billing',
  replySnippet = 'Thank you for the update. The issue is...',
  ticketUrl = 'https://kantaswara.com/internal/support/TKT-1001',
  appName = 'KantaSwara',
  appUrl = 'https://kantaswara.com',
  supportEmail = 'support@kantaswara.com',
  currentYear = new Date().getFullYear(),
}: CustomerReplyEmailProps) {
  return (
    <BaseEmailLayout
      previewText={`New reply from customer on ticket ${ticketId}.`}
      appName={appName}
      appUrl={appUrl}
      supportEmail={supportEmail}
      currentYear={currentYear}
    >
      <Text style={heading}>New Customer Reply: #{ticketId}</Text>
      
      <Text style={paragraph}>
        Hi {assigneeName},
      </Text>
      
      <Text style={paragraph}>
        The customer has replied to support ticket <strong>#{ticketId}</strong> ("{subject}").
      </Text>
      
      <div style={quoteBlock}>
        <Text style={quoteText}>"{replySnippet}"</Text>
      </div>
      
      <Text style={paragraph}>
        Please review the full message and respond as necessary.
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

const quoteBlock = {
  borderLeft: '4px solid #E5E7EB',
  paddingLeft: '16px',
  marginTop: '16px',
  marginBottom: '24px',
};

const quoteText = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#6B7280',
  fontStyle: 'italic',
};

const buttonContainer = {
  textAlign: 'center' as const,
  marginTop: '24px',
  marginBottom: '24px',
};
