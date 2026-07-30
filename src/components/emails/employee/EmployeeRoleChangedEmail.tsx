import { Text } from '@react-email/components';
import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { EmailButton } from '../components/EmailButton';

interface EmployeeRoleChangedEmailProps {
  userName: string;
  newRole: string;
  dashboardUrl: string;
  appName?: string;
  appUrl?: string;
  supportEmail?: string;
  currentYear?: number;
}

export default function EmployeeRoleChangedEmail({
  userName = 'Colleague',
  newRole = 'Solutions Admin',
  dashboardUrl = 'https://kantaswara.com/internal',
  appName = 'KantaSwara',
  appUrl = 'https://kantaswara.com',
  supportEmail = 'support@kantaswara.com',
  currentYear = new Date().getFullYear(),
}: EmployeeRoleChangedEmailProps) {
  return (
    <BaseEmailLayout
      previewText={`Your employee role has been updated to ${newRole}.`}
      appName={appName}
      appUrl={appUrl}
      supportEmail={supportEmail}
      currentYear={currentYear}
    >
      <Text style={heading}>Role Updated</Text>
      
      <Text style={paragraph}>
        Hi {userName},
      </Text>
      
      <Text style={paragraph}>
        Your access privileges on the {appName} platform have been updated. Your new role is <strong>{newRole}</strong>.
      </Text>
      
      <Text style={paragraph}>
        This change may grant you access to new internal tools or restrict access to certain modules.
      </Text>

      <div style={buttonContainer}>
        <EmailButton href={dashboardUrl}>Log In</EmailButton>
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
