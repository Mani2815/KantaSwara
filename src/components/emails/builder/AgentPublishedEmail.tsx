import { Text } from '@react-email/components';
import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { EmailButton } from '../components/EmailButton';

interface AgentPublishedEmailProps {
  userName: string;
  agentName: string;
  projectName: string;
  dashboardUrl: string;
  appName?: string;
  appUrl?: string;
  supportEmail?: string;
  currentYear?: number;
}

export default function AgentPublishedEmail({
  userName = 'Builder',
  agentName = 'My Agent',
  projectName = 'Default Project',
  dashboardUrl = 'https://kantaswara.com/dashboard',
  appName = 'KantaSwara',
  appUrl = 'https://kantaswara.com',
  supportEmail = 'support@kantaswara.com',
  currentYear = new Date().getFullYear(),
}: AgentPublishedEmailProps) {
  return (
    <BaseEmailLayout
      previewText={`Your AI agent ${agentName} has been published successfully.`}
      appName={appName}
      appUrl={appUrl}
      supportEmail={supportEmail}
      currentYear={currentYear}
    >
      <Text style={heading}>Agent Published! 🎉</Text>
      
      <Text style={paragraph}>
        Hi {userName},
      </Text>
      
      <Text style={paragraph}>
        Great news! Your AI agent <strong>{agentName}</strong> (Project: {projectName}) has been successfully published. It is now ready for deployment.
      </Text>
      
      <Text style={paragraph}>
        You can view your published agent and manage deployments from your dashboard:
      </Text>

      <div style={buttonContainer}>
        <EmailButton href={dashboardUrl}>Go to Dashboard</EmailButton>
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
