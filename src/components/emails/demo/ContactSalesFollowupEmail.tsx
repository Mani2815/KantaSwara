import { Text } from '@react-email/components';
import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { EmailButton } from '../components/EmailButton';

interface ContactSalesFollowupEmailProps {
  userName: string;
  salesEmail: string;
  appName?: string;
  appUrl?: string;
  supportEmail?: string;
  currentYear?: number;
}

export default function ContactSalesFollowupEmail({
  userName = 'Guest',
  salesEmail = 'sales@kantaswara.com',
  appName = 'KantaSwara',
  appUrl = 'https://kantaswara.com',
  supportEmail = 'support@kantaswara.com',
  currentYear = new Date().getFullYear(),
}: ContactSalesFollowupEmailProps) {
  return (
    <BaseEmailLayout
      previewText={`Thank you for contacting ${appName} Sales.`}
      appName={appName}
      appUrl={appUrl}
      supportEmail={supportEmail}
      currentYear={currentYear}
    >
      <Text style={heading}>We've Received Your Request</Text>
      
      <Text style={paragraph}>
        Hi {userName},
      </Text>
      
      <Text style={paragraph}>
        Thank you for your interest in {appName}'s enterprise solutions! We have received your request to contact our sales team.
      </Text>
      
      <Text style={paragraph}>
        One of our enterprise specialists will review your details and reach out to you within the next 24 hours to discuss how we can help you build custom AI voice agents.
      </Text>

      <Text style={paragraph}>
        If you need immediate assistance or would like to provide more information, please feel free to reply directly to this email or contact <a href={`mailto:${salesEmail}`} style={link}>{salesEmail}</a>.
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

const link = {
  color: '#4F46E5',
  textDecoration: 'none',
};
