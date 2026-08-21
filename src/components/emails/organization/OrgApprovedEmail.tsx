import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { Text, Button, Section, Heading, Container } from '@react-email/components';

interface OrgApprovedEmailProps {
  userName?: string;
  organizationName?: string;
  dashboardUrl?: string;
}

export default function OrgApprovedEmail({
  userName = 'Admin',
  organizationName = 'your organization',
  dashboardUrl = 'https://kantaswara.com/dashboard',
}: OrgApprovedEmailProps) {
  return (
    <BaseEmailLayout previewText={`Your organization ${organizationName} is approved!`}>
      <Heading style={heading}>Welcome to KantaSwara, {userName}!</Heading>
      
      <Text style={paragraph}>
        Great news! The registration for <strong>{organizationName}</strong> has been successfully reviewed and approved by our team.
      </Text>
      
      <Text style={paragraph}>
        Your account is now fully active. You can log in to your dashboard to start configuring your AI Voice agents, inviting team members, and exploring all the features available to your organization.
      </Text>
      
      <Section style={buttonContainer}>
        <Button style={button} href={dashboardUrl}>
          Go to Dashboard
        </Button>
      </Section>
      
      <Text style={paragraph}>
        If you have any questions or need help getting started, our support team is always here for you.
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

const buttonContainer = {
  padding: '12px 0 32px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#ff6600',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
};

const signature = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#a1a1aa', // zinc-400
  margin: '32px 0 0 0',
};
