import { Text } from '@react-email/components';
import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { EmailButton } from '../components/EmailButton';

interface MFAEnabledEmailProps {
  userName: string;
  settingsUrl: string;
  appName?: string;
  appUrl?: string;
  supportEmail?: string;
  currentYear?: number;
}

export default function MFAEnabledEmail({
  userName = 'User',
  settingsUrl = 'https://kantaswara.com/settings/security',
  appName = 'KantaSwara',
  appUrl = 'https://kantaswara.com',
  supportEmail = 'support@kantaswara.com',
  currentYear = new Date().getFullYear(),
}: MFAEnabledEmailProps) {
  return (
    <BaseEmailLayout
      previewText={`Multi-Factor Authentication enabled on your account.`}
      appName={appName}
      appUrl={appUrl}
      supportEmail={supportEmail}
      currentYear={currentYear}
    >
      <Text style={heading}>MFA Enabled 🔒</Text>
      
      <Text style={paragraph}>
        Hi {userName},
      </Text>
      
      <Text style={paragraph}>
        Multi-Factor Authentication (MFA) has been successfully enabled on your {appName} account. Your account is now more secure.
      </Text>
      
      <Text style={paragraph}>
        If you did not make this change, please secure your account immediately.
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
