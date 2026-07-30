import { Text } from '@react-email/components';
import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { EmailButton } from '../components/EmailButton';

interface DeploymentStartedEmailProps {
  userName: string;
  agentName: string;
  environment: string;
  deploymentUrl: string;
  appName?: string;
  appUrl?: string;
  supportEmail?: string;
  currentYear?: number;
}

export default function DeploymentStartedEmail({
  userName = 'Builder',
  agentName = 'Untitled Agent',
  environment = 'Production',
  deploymentUrl = 'https://kantaswara.com/dashboard/deployments',
  appName = 'KantaSwara',
  appUrl = 'https://kantaswara.com',
  supportEmail = 'support@kantaswara.com',
  currentYear = new Date().getFullYear(),
}: DeploymentStartedEmailProps) {
  return (
    <BaseEmailLayout
      previewText={`Deployment started for ${agentName} to ${environment}.`}
      appName={appName}
      appUrl={appUrl}
      supportEmail={supportEmail}
      currentYear={currentYear}
    >
      <Text style={heading}>Deployment Started 🚀</Text>
      
      <Text style={paragraph}>
        Hi {userName},
      </Text>
      
      <Text style={paragraph}>
        The deployment of your AI agent <strong>{agentName}</strong> to the <strong>{environment}</strong> environment has started.
      </Text>
      
      <Text style={paragraph}>
        We will notify you once the deployment is completed or if any issues occur. You can track the progress live on your dashboard.
      </Text>

      <div style={buttonContainer}>
        <EmailButton href={deploymentUrl}>Track Deployment</EmailButton>
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
