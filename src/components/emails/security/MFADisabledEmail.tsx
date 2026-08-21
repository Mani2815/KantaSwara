import { Text } from '@react-email/components';
import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { EmailButton } from '../components/EmailButton';

interface MFADisabledEmailProps {
  userName: string;
  settingsUrl: string;
  appName?: string;
  appUrl?: string;
  supportEmail?: string;
  currentYear?: number;
}

export default function MFADisabledEmail({
  userName = 'User',
  settingsUrl = 'https://kantaswara.com/settings/security',
  appName = 'KantaSwara',
  appUrl = 'https://kantaswara.com',
  supportEmail = 'support@kantaswara.com',
  currentYear = new Date().getFullYear(),
}: MFADisabledEmailProps) {
  return (
    <BaseEmailLayout
      previewText={`Multi-Factor Authentication was disabled on your account.`}
      appName={appName}
      appUrl={appUrl}
      supportEmail={supportEmail}
      currentYear={currentYear}
    >
      <Text style={heading}>MFA Disabled ⚠️</Text>
      
      <Text style={paragraph}>
        Hi {userName},
      </Text>
      
      <Text style={paragraph}>
        Multi-Factor Authentication (MFA) has been disabled on your {appName} account. We strongly recommend keeping MFA enabled to protect your data.
      </Text>
      
      <Text style={paragraph}>
        If you did not make this change, your account may be compromised. Please reset your password and contact support immediately.
      </Text>

      <div style={buttonContainer}>
        <EmailButton href={settingsUrl}>Review Security Settings</EmailButton>
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

const buttonContainer = {
  textAlign: 'center' as const,
  marginTop: '24px',
  marginBottom: '24px',
};
