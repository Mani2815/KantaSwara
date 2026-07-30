import { Text } from '@react-email/components';
import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { EmailButton } from '../components/EmailButton';

interface InternalReplyEmailProps {
  userName: string;
  ticketId: string;
  subject: string;
  replySnippet: string;
  ticketUrl: string;
  appName?: string;
  appUrl?: string;
  supportEmail?: string;
  currentYear?: number;
}

export default function InternalReplyEmail({
  userName = 'Customer',
  ticketId = 'TKT-1001',
  subject = 'Issue with billing',
  replySnippet = 'We have investigated the issue and...',
  ticketUrl = 'https://kantaswara.com/support/TKT-1001',
  appName = 'KantaSwara',
  appUrl = 'https://kantaswara.com',
  supportEmail = 'support@kantaswara.com',
  currentYear = new Date().getFullYear(),
}: InternalReplyEmailProps) {
  return (
    <BaseEmailLayout
      previewText={`New reply on your support ticket ${ticketId}.`}
      appName={appName}
      appUrl={appUrl}
      supportEmail={supportEmail}
      currentYear={currentYear}
    >
      <Text style={heading}>New Reply on Ticket: #{ticketId}</Text>
      
      <Text style={paragraph}>
        Hi {userName},
      </Text>
      
      <Text style={paragraph}>
        Our support team has replied to your ticket <strong>#{ticketId}</strong> ("{subject}").
      </Text>
      
      <div style={quoteBlock}>
        <Text style={quoteText}>"{replySnippet}"</Text>
      </div>
      
      <Text style={paragraph}>
        You can view the full conversation and reply by clicking the button below, or simply by replying to this email.
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
  borderLeft: '4px solid #4F46E5', // indigo-600
  paddingLeft: '16px',
  marginTop: '16px',
  marginBottom: '24px',
};

const quoteText = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#374151',
};

const buttonContainer = {
  textAlign: 'center' as const,
  marginTop: '24px',
  marginBottom: '24px',
};
