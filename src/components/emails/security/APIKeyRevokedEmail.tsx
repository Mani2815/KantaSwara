import { Text } from '@react-email/components';
import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { EmailButton } from '../components/EmailButton';

interface APIKeyRevokedEmailProps {
  userName: string;
  keyName: string;
  revokedAt: string;
  settingsUrl: string;
  appName?: string;
  appUrl?: string;
  supportEmail?: string;
  currentYear?: number;
}

export default function APIKeyRevokedEmail({
  userName = 'User',
  keyName = 'Production API Key',
  revokedAt = new Date().toLocaleString(),
  settingsUrl = 'https://kantaswara.com/settings/api-keys',
  appName = 'KantaSwara',
  appUrl = 'https://kantaswara.com',
  supportEmail = 'support@kantaswara.com',
  currentYear = new Date().getFullYear(),
}: APIKeyRevokedEmailProps) {
  return (
    <BaseEmailLayout
      previewText={`API Key "${keyName}" was revoked.`}
      appName={appName}
      appUrl={appUrl}
      supportEmail={supportEmail}
      currentYear={currentYear}
    >
      <Text style={heading}>API Key Revoked</Text>
      
      <Text style={paragraph}>
        Hi {userName},
      </Text>
      
      <Text style={paragraph}>
        The API Key named <strong>"{keyName}"</strong> was successfully revoked on {revokedAt}.
      </Text>
      
      <Text style={paragraph}>
        Any applications or services using this key will no longer be able to authenticate.
      </Text>

      <div style={buttonContainer}>
        <EmailButton href={settingsUrl}>Manage API Keys</EmailButton>
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
