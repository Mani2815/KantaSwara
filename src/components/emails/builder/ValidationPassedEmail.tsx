import { Text } from '@react-email/components';
import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { EmailButton } from '../components/EmailButton';

interface ValidationPassedEmailProps {
  userName: string;
  agentName: string;
  projectName: string;
  dashboardUrl: string;
  appName?: string;
  appUrl?: string;
  supportEmail?: string;
  currentYear?: number;
}

export default function ValidationPassedEmail({
  userName = 'Builder',
  agentName = 'Untitled Agent',
  projectName = 'Default Project',
  dashboardUrl = 'https://kantaswara.com/builder',
  appName = 'KantaSwara',
  appUrl = 'https://kantaswara.com',
  supportEmail = 'support@kantaswara.com',
  currentYear = new Date().getFullYear(),
}: ValidationPassedEmailProps) {
  return (
    <BaseEmailLayout
      previewText={`Validation passed for ${agentName}.`}
      appName={appName}
      appUrl={appUrl}
      supportEmail={supportEmail}
      currentYear={currentYear}
    >
      <Text style={heading}>Validation Passed ✅</Text>
      
      <Text style={paragraph}>
        Hi {userName},
      </Text>
      
      <Text style={paragraph}>
        Your AI agent <strong>{agentName}</strong> (Project: {projectName}) has successfully passed all automated validation checks.
      </Text>
      
      <Text style={paragraph}>
        It is now ready to be published and deployed. Click below to continue:
      </Text>

      <div style={buttonContainer}>
        <EmailButton href={dashboardUrl}>View Agent</EmailButton>
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
