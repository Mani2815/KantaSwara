import { Text } from '@react-email/components';
import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { EmailButton } from '../components/EmailButton';

interface RollbackCompletedEmailProps {
  userName: string;
  agentName: string;
  environment: string;
  version: string;
  dashboardUrl: string;
  appName?: string;
  appUrl?: string;
  supportEmail?: string;
  currentYear?: number;
}

export default function RollbackCompletedEmail({
  userName = 'Builder',
  agentName = 'Untitled Agent',
  environment = 'Production',
  version = 'v1.0.2',
  dashboardUrl = 'https://kantaswara.com/dashboard/deployments',
  appName = 'KantaSwara',
  appUrl = 'https://kantaswara.com',
  supportEmail = 'support@kantaswara.com',
  currentYear = new Date().getFullYear(),
}: RollbackCompletedEmailProps) {
  return (
    <BaseEmailLayout
      previewText={`Rollback completed for ${agentName} on ${environment}.`}
      appName={appName}
      appUrl={appUrl}
      supportEmail={supportEmail}
      currentYear={currentYear}
    >
      <Text style={heading}>Rollback Completed ↩️</Text>
      
      <Text style={paragraph}>
        Hi {userName},
      </Text>
      
      <Text style={paragraph}>
        The rollback of your AI agent <strong>{agentName}</strong> on the <strong>{environment}</strong> environment has completed successfully.
      </Text>
      
      <Text style={paragraph}>
        The active version is now <strong>{version}</strong>.
      </Text>

      <div style={buttonContainer}>
        <EmailButton href={dashboardUrl}>View Deployments</EmailButton>
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
