import { Text } from '@react-email/components';
import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { EmailButton } from '../components/EmailButton';

interface EmployeeActivatedEmailProps {
  userName: string;
  role: string;
  dashboardUrl: string;
  appName?: string;
  appUrl?: string;
  supportEmail?: string;
  currentYear?: number;
}

export default function EmployeeActivatedEmail({
  userName = 'Colleague',
  role = 'Support Agent',
  dashboardUrl = 'https://kantaswara.com/internal',
  appName = 'KantaSwara',
  appUrl = 'https://kantaswara.com',
  supportEmail = 'support@kantaswara.com',
  currentYear = new Date().getFullYear(),
}: EmployeeActivatedEmailProps) {
  return (
    <BaseEmailLayout
      previewText={`Your employee account has been activated.`}
      appName={appName}
      appUrl={appUrl}
      supportEmail={supportEmail}
      currentYear={currentYear}
    >
      <Text style={heading}>Account Activated 🚀</Text>
      
      <Text style={paragraph}>
        Hi {userName},
      </Text>
      
      <Text style={paragraph}>
        Welcome to the team! Your employee account on the {appName} platform has been fully activated.
      </Text>
      
      <Text style={paragraph}>
        You have been assigned the role of <strong>{role}</strong>. You can now access the internal tools and dashboards.
      </Text>

      <div style={buttonContainer}>
        <EmailButton href={dashboardUrl}>Go to Internal Dashboard</EmailButton>
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
