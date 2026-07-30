import { Text } from '@react-email/components';
import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';

interface DemoMeetingConfirmationEmailProps {
  userName: string;
  meetingTime: string;
  meetingLink: string;
  hostName: string;
  appName?: string;
  appUrl?: string;
  supportEmail?: string;
  currentYear?: number;
}

export default function DemoMeetingConfirmationEmail({
  userName = 'Guest',
  meetingTime = 'Tomorrow at 10:00 AM (PST)',
  meetingLink = 'https://meet.google.com/xyz',
  hostName = 'Jane Doe',
  appName = 'KantaSwara',
  appUrl = 'https://kantaswara.com',
  supportEmail = 'support@kantaswara.com',
  currentYear = new Date().getFullYear(),
}: DemoMeetingConfirmationEmailProps) {
  return (
    <BaseEmailLayout
      previewText={`Your demo meeting is confirmed for ${meetingTime}.`}
      appName={appName}
      appUrl={appUrl}
      supportEmail={supportEmail}
      currentYear={currentYear}
    >
      <Text style={heading}>Demo Meeting Confirmed 📅</Text>
      
      <Text style={paragraph}>
        Hi {userName},
      </Text>
      
      <Text style={paragraph}>
        Your live demo meeting with {hostName} from the {appName} team is confirmed.
      </Text>
      
      <div style={detailsBlock}>
        <Text style={detailsText}><strong>Time:</strong> {meetingTime}</Text>
        <Text style={detailsText}><strong>Link:</strong> <a href={meetingLink} style={link}>{meetingLink}</a></Text>
        <Text style={detailsText}><strong>Host:</strong> {hostName}</Text>
      </div>
      
      <Text style={paragraph}>
        We look forward to showing you how {appName} can transform your customer interactions. If you need to reschedule, please let us know as soon as possible.
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

const detailsBlock = {
  backgroundColor: '#F3F4F6',
  padding: '16px',
  borderRadius: '8px',
  marginTop: '16px',
  marginBottom: '24px',
};

const detailsText = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#4B5563',
};

const link = {
  color: '#4F46E5',
  textDecoration: 'none',
};
