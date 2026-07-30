import { Text } from '@react-email/components';
import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { EmailButton } from '../components/EmailButton';

interface WelcomeEmailProps {
  userName: string;
  verificationLink?: string;
  appName?: string;
  appUrl?: string;
  supportEmail?: string;
  currentYear?: number;
}

export default function WelcomeEmail({
  userName = 'User',
  verificationLink = 'https://kantaswara.com/verify?token=123',
  appName = 'KantaSwara',
  appUrl = 'https://kantaswara.com',
  supportEmail = 'support@kantaswara.com',
  currentYear = new Date().getFullYear(),
}: WelcomeEmailProps) {
  return (
    <BaseEmailLayout
      previewText={`Welcome to ${appName}! Please verify your email.`}
      appName={appName}
      appUrl={appUrl}
      supportEmail={supportEmail}
      currentYear={currentYear}
    >
      <Text style={heading}>Welcome to {appName}, {userName}! 👋</Text>
      
      <Text style={paragraph}>
        We are thrilled to have you on board. {appName} is designed to help you build and manage
        enterprise AI voice agents with ease.
      </Text>

      {verificationLink && (
        <>
          <Text style={paragraph}>
            Before you get started, please verify your email address to secure your account:
          </Text>
          
          <div style={buttonContainer}>
            <EmailButton href={verificationLink}>Verify Email Address</EmailButton>
          </div>
          
          <Text style={subtext}>
            Or copy and paste this link into your browser:{' '}
            <a href={verificationLink} style={link}>{verificationLink}</a>
          </Text>
        </>
      )}

      <Text style={paragraph}>
        If you have any questions, feel free to reply to this email or reach out to our support team.
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
  marginTop: '8px',
  marginBottom: '8px',
};

const subtext = {
  fontSize: '12px',
  color: '#6b7280',
  lineHeight: '1.5',
  marginTop: '16px',
  marginBottom: '24px',
  wordBreak: 'break-all' as const,
};

const link = {
  color: '#4F46E5',
  textDecoration: 'underline',
};
