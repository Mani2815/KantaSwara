import { Text } from '@react-email/components';
import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { EmailButton } from '../components/EmailButton';

interface DeploymentFailedEmailProps {
  userName: string;
  organizationName: string;
  agentName: string;
  deploymentEnv: string;
  errorMessage: string;
  appName?: string;
  appUrl?: string;
  supportEmail?: string;
  currentYear?: number;
}

export default function DeploymentFailedEmail({
  userName,
  organizationName,
  agentName,
  deploymentEnv,
  errorMessage,
  appName = "KantaSwara",
  appUrl = "https://kantaswara.com",
  supportEmail = "support@kantaswara.com",
  currentYear = new Date().getFullYear()
}: DeploymentFailedEmailProps) {
  return (
    <BaseEmailLayout
      previewText="Deployment Failed"
      appName={appName}
      appUrl={appUrl}
      supportEmail={supportEmail}
      currentYear={currentYear}
    >
      <Text style={heading}>Deployment Failed</Text>
      
      <Text style={paragraph}>
        This is an automated message from {appName}.
      </Text>

      {/* Add specific content here based on props */}
      
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
