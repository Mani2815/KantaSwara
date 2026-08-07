import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { Text, Heading } from '@react-email/components';

interface OrgRegistrationSubmittedEmailProps {
  userName?: string;
  organizationName?: string;
}

export default function OrgRegistrationSubmittedEmail({
  userName = 'Admin',
  organizationName = 'your organization',
}: OrgRegistrationSubmittedEmailProps) {
  return (
    <BaseEmailLayout previewText={`Registration submitted for ${organizationName}`}>
      <Heading style={heading}>Hello {userName},</Heading>
      
      <Text style={paragraph}>
        Thank you for registering <strong>{organizationName}</strong> with KantaSwara! 
      </Text>
      
      <Text style={paragraph}>
        We have successfully received your application. Our team is currently reviewing your business profile and requirements to ensure we can provide the best possible AI Voice experience for your use case.
      </Text>
      
      <Text style={paragraph}>
        This review process typically takes 1-2 business days. We will send you another email as soon as your organization is approved and your account is activated.
      </Text>
      
      <Text style={signature}>
        Best regards,<br />
        The KantaSwara Team
      </Text>
    </BaseEmailLayout>
  );
}

const heading = {
  fontSize: '24px',
  letterSpacing: '-0.5px',
  lineHeight: '1.3',
  fontWeight: '600',
  color: '#f4f4f5', // zinc-100
  padding: '0',
  margin: '0 0 24px 0',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#d4d4d8', // zinc-300
  margin: '0 0 20px 0',
};

const signature = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#a1a1aa', // zinc-400
  margin: '32px 0 0 0',
};
