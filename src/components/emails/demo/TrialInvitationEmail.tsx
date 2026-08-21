import { Text } from '@react-email/components';
import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { EmailButton } from '../components/EmailButton';

interface TrialInvitationEmailProps {
  userName: string;
  trialLink: string;
  days: number;
  appName?: string;
  appUrl?: string;
  supportEmail?: string;
  currentYear?: number;
}

export default function TrialInvitationEmail({
  userName = 'Guest',
  trialLink = 'https://kantaswara.com/signup/trial',
  days = 14,
  appName = 'KantaSwara',
  appUrl = 'https://kantaswara.com',
  supportEmail = 'support@kantaswara.com',
  currentYear = new Date().getFullYear(),
}: TrialInvitationEmailProps) {
  return (
    <BaseEmailLayout
      previewText={`You're invited to a ${days}-day free trial of ${appName}.`}
      appName={appName}
      appUrl={appUrl}
      supportEmail={supportEmail}
      currentYear={currentYear}
    >
      <Text style={heading}>Exclusive Trial Invitation 🎁</Text>
      
      <Text style={paragraph}>
        Hi {userName},
      </Text>
      
      <Text style={paragraph}>
        Since you recently explored our demo, we would like to invite you to a <strong>{days}-day free trial</strong> of the {appName} platform.
      </Text>
      
      <Text style={paragraph}>
        During the trial, you will have full access to our AI Builder, Workflow Designer, and up to 100 minutes of live voice agent interactions.
      </Text>

      <div style={buttonContainer}>
        <EmailButton href={trialLink}>Start Your Free Trial</EmailButton>
      </div>

      <Text style={paragraph}>
        No credit card is required to start your trial. If you need a custom solution or a guided onboarding, our sales team is here to help.
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
