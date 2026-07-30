import { Text } from '@react-email/components';
import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';

interface DemoCompletedSummaryEmailProps {
  userName: string;
  summary: string;
  appName?: string;
  appUrl?: string;
  supportEmail?: string;
  currentYear?: number;
}

export default function DemoCompletedSummaryEmail({
  userName = 'Guest',
  summary = 'Thank you for trying out our demo! You explored voice agents and workflow integrations.',
  appName = 'KantaSwara',
  appUrl = 'https://kantaswara.com',
  supportEmail = 'support@kantaswara.com',
  currentYear = new Date().getFullYear(),
}: DemoCompletedSummaryEmailProps) {
  return (
    <BaseEmailLayout
      previewText={`Your KantaSwara demo summary.`}
      appName={appName}
      appUrl={appUrl}
      supportEmail={supportEmail}
      currentYear={currentYear}
    >
      <Text style={heading}>Demo Completed! 🎉</Text>
      
      <Text style={paragraph}>
        Hi {userName},
      </Text>
      
      <Text style={paragraph}>
        Thank you for trying out the {appName} platform. We hope you enjoyed the experience and saw how powerful enterprise AI voice agents can be.
      </Text>
      
      <Text style={paragraph}>
        <strong>Here is a quick summary of your demo session:</strong>
      </Text>
      
      <div style={summaryBlock}>
        <Text style={summaryText}>{summary}</Text>
      </div>
      
      <Text style={paragraph}>
        If you have any questions or would like to learn more about our enterprise solutions, please feel free to reply to this email!
      </Text>
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

const summaryBlock = {
  backgroundColor: '#F3F4F6',
  padding: '16px',
  borderRadius: '8px',
  marginTop: '16px',
  marginBottom: '24px',
};

const summaryText = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#4B5563',
  whiteSpace: 'pre-wrap' as const,
};
