import { Text } from '@react-email/components';
import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { EmailButton } from '../components/EmailButton';

interface EmployeeInvitationEmailProps {
  userName: string;
  role: string;
  department: string;
  invitationLink: string;
  invitedByName: string;
  expiresAt: string;
  appName?: string;
  appUrl?: string;
  supportEmail?: string;
  currentYear?: number;
}

export default function EmployeeInvitationEmail({
  userName,
  role,
  department,
  invitationLink,
  invitedByName,
  expiresAt,
  appName = "KantaSwara",
  appUrl = "https://kantaswara.com",
  supportEmail = "support@kantaswara.com",
  currentYear = new Date().getFullYear()
}: EmployeeInvitationEmailProps) {
  return (
    <BaseEmailLayout
      previewText="Employee Invitation"
      appName={appName}
      appUrl={appUrl}
      supportEmail={supportEmail}
      currentYear={currentYear}
    >
      <Text style={heading}>Employee Invitation</Text>
      
      <Text style={paragraph}>
        This is an automated message from {appName}.
      </Text>

      {/* Add specific content here based on props */}
      
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
