import { Text } from '@react-email/components';
import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { EmailButton } from '../components/EmailButton';

interface EmployeePasswordResetEmailProps {
  userName: string;
  resetLink: string;
  expiresIn: string;
  appName?: string;
  appUrl?: string;
  supportEmail?: string;
  currentYear?: number;
}

export default function EmployeePasswordResetEmail({
  userName = 'Colleague',
  resetLink = 'https://kantaswara.com/internal/reset',
  expiresIn = '1 hour',
  appName = 'KantaSwara',
  appUrl = 'https://kantaswara.com',
  supportEmail = 'support@kantaswara.com',
  currentYear = new Date().getFullYear(),
}: EmployeePasswordResetEmailProps) {
  return (
    <BaseEmailLayout
      previewText={`Reset your internal employee password.`}
      appName={appName}
      appUrl={appUrl}
      supportEmail={supportEmail}
      currentYear={currentYear}
    >
      <Text style={heading}>Reset Your Employee Password</Text>
      
      <Text style={paragraph}>
        Hi {userName},
      </Text>
      
      <Text style={paragraph}>
        We received a request to reset the password for your internal employee account. Click the button below to choose a new password.
      </Text>

      <div style={buttonContainer}>
        <EmailButton href={resetLink}>Reset Password</EmailButton>
      </div>

      <Text style={paragraph}>
        This link will expire in {expiresIn}. If you did not request this password reset, please notify the IT security team immediately.
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
