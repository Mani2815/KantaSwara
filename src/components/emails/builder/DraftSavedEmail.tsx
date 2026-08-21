import { Text } from '@react-email/components';
import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { EmailButton } from '../components/EmailButton';

interface DraftSavedEmailProps {
  userName: string;
  agentName: string;
  projectName: string;
  builderUrl: string;
  appName?: string;
  appUrl?: string;
  supportEmail?: string;
  currentYear?: number;
}

export default function DraftSavedEmail({
  userName = 'Builder',
  agentName = 'Untitled Agent',
  projectName = 'Default Project',
  builderUrl = 'https://kantaswara.com/builder',
  appName = 'KantaSwara',
  appUrl = 'https://kantaswara.com',
  supportEmail = 'support@kantaswara.com',
  currentYear = new Date().getFullYear(),
}: DraftSavedEmailProps) {
  return (
    <BaseEmailLayout
      previewText={`Your draft for ${agentName} has been saved.`}
      appName={appName}
      appUrl={appUrl}
      supportEmail={supportEmail}
      currentYear={currentYear}
    >
      <Text style={heading}>Draft Saved: {agentName}</Text>
      
      <Text style={paragraph}>
        Hi {userName},
      </Text>
      
      <Text style={paragraph}>
        Your latest changes to the AI agent <strong>{agentName}</strong> (Project: {projectName}) have been successfully saved as a draft.
      </Text>
      
      <Text style={paragraph}>
        You can resume building your agent at any time by clicking the button below:
      </Text>

      <div style={buttonContainer}>
        <EmailButton href={builderUrl}>Resume Building</EmailButton>
      </div>

      <Text style={paragraph}>
        Remember to validate and publish your agent when you're ready to deploy it.
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

const buttonContainer = {
  textAlign: 'center' as const,
  marginTop: '24px',
  marginBottom: '24px',
};
