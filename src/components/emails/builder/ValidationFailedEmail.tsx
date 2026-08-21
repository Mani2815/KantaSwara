import { Text } from '@react-email/components';
import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { EmailButton } from '../components/EmailButton';

interface ValidationFailedEmailProps {
  userName: string;
  agentName: string;
  projectName: string;
  errors: string[];
  builderUrl: string;
  appName?: string;
  appUrl?: string;
  supportEmail?: string;
  currentYear?: number;
}

export default function ValidationFailedEmail({
  userName = 'Builder',
  agentName = 'Untitled Agent',
  projectName = 'Default Project',
  errors = ['Invalid prompt configuration', 'Missing voice ID'],
  builderUrl = 'https://kantaswara.com/builder',
  appName = 'KantaSwara',
  appUrl = 'https://kantaswara.com',
  supportEmail = 'support@kantaswara.com',
  currentYear = new Date().getFullYear(),
}: ValidationFailedEmailProps) {
  return (
    <BaseEmailLayout
      previewText={`Validation failed for ${agentName}. Action required.`}
      appName={appName}
      appUrl={appUrl}
      supportEmail={supportEmail}
      currentYear={currentYear}
    >
      <Text style={heading}>Validation Failed ❌</Text>
      
      <Text style={paragraph}>
        Hi {userName},
      </Text>
      
      <Text style={paragraph}>
        Validation checks for your AI agent <strong>{agentName}</strong> (Project: {projectName}) have failed.
      </Text>
      
      <Text style={paragraph}>
        <strong>Errors detected:</strong>
      </Text>
      <ul>
        {errors.map((error, idx) => (
          <li key={idx} style={listItem}>{error}</li>
        ))}
      </ul>
      
      <Text style={paragraph}>
        Please review and fix these issues in the builder before attempting to publish again.
      </Text>

      <div style={buttonContainer}>
        <EmailButton href={builderUrl}>Return to Builder</EmailButton>
      </div>
    </BaseEmailLayout>
  );
}

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#DC2626', // red-600
  marginTop: '0',
  marginBottom: '24px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#374151',
  marginBottom: '16px',
};

const listItem = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#4B5563',
  marginBottom: '8px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  marginTop: '24px',
  marginBottom: '24px',
};
