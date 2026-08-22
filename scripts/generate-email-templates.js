const fs = require('fs');
const path = require('path');

const templates = [
  { path: 'auth/VerifyEmailEmail.tsx', name: 'VerifyEmailEmail', vars: 'userName: string, verificationLink: string', subject: 'Verify your email address' },
  { path: 'auth/PasswordResetEmail.tsx', name: 'PasswordResetEmail', vars: 'userName: string, resetLink: string, expiresIn: string', subject: 'Reset your KantaSwara password' },
  { path: 'auth/PasswordChangedEmail.tsx', name: 'PasswordChangedEmail', vars: 'userName: string, ipAddress: string, userAgent: string, timestamp: string', subject: 'Your password was changed' },
  { path: 'auth/LoginAlertEmail.tsx', name: 'LoginAlertEmail', vars: 'userName: string, ipAddress: string, userAgent: string, location: string, timestamp: string', subject: 'New sign-in to your account' },
  { path: 'auth/AccountLockedEmail.tsx', name: 'AccountLockedEmail', vars: 'userName: string, reason: string', subject: 'Account locked' },
  { path: 'organization/OrgRegistrationSubmittedEmail.tsx', name: 'OrgRegistrationSubmittedEmail', vars: 'userName: string, organizationName: string', subject: 'Registration under review' },
  { path: 'organization/OrgApprovedEmail.tsx', name: 'OrgApprovedEmail', vars: 'userName: string, organizationName: string, dashboardUrl: string', subject: 'Organization Approved' },
  { path: 'organization/OrgRejectedEmail.tsx', name: 'OrgRejectedEmail', vars: 'userName: string, organizationName: string, reason: string', subject: 'Organization Rejected' },
  { path: 'organization/OrgSuspendedEmail.tsx', name: 'OrgSuspendedEmail', vars: 'userName: string, organizationName: string, reason: string', subject: 'Organization Suspended' },
  { path: 'employee/EmployeeInvitationEmail.tsx', name: 'EmployeeInvitationEmail', vars: 'userName: string, role: string, department: string, invitationLink: string, invitedByName: string, expiresAt: string', subject: 'Employee Invitation' },
  { path: 'billing/SubscriptionCreatedEmail.tsx', name: 'SubscriptionCreatedEmail', vars: 'userName: string, organizationName: string, planName: string, amount: string, billingCycle: string, startDate: string', subject: 'Subscription Created' },
  { path: 'billing/InvoiceGeneratedEmail.tsx', name: 'InvoiceGeneratedEmail', vars: 'userName: string, organizationName: string, invoiceNumber: string, amount: string, dueDate: string, invoiceUrl: string', subject: 'Invoice Generated' },
  { path: 'billing/PaymentSuccessfulEmail.tsx', name: 'PaymentSuccessfulEmail', vars: 'userName: string, organizationName: string, invoiceNumber: string, amount: string, paidDate: string', subject: 'Payment Successful' },
  { path: 'billing/PaymentFailedEmail.tsx', name: 'PaymentFailedEmail', vars: 'userName: string, organizationName: string, invoiceNumber: string, amount: string, dueDate: string', subject: 'Payment Failed' },
  { path: 'billing/SubscriptionExpiringEmail.tsx', name: 'SubscriptionExpiringEmail', vars: 'userName: string, organizationName: string, planName: string, expiryDate: string, renewalUrl: string', subject: 'Subscription Expiring' },
  { path: 'billing/TrialEndingEmail.tsx', name: 'TrialEndingEmail', vars: 'userName: string, organizationName: string, daysRemaining: number, upgradeUrl: string', subject: 'Trial Ending' },
  { path: 'delivery/ProjectAssignedEmail.tsx', name: 'ProjectAssignedEmail', vars: 'userName: string, projectName: string, organizationName: string, priority: string, dashboardUrl: string', subject: 'Project Assigned' },
  { path: 'delivery/DeploymentSuccessfulEmail.tsx', name: 'DeploymentSuccessfulEmail', vars: 'userName: string, organizationName: string, agentName: string, deploymentEnv: string, version: string, dashboardUrl: string', subject: 'Deployment Successful' },
  { path: 'delivery/DeploymentFailedEmail.tsx', name: 'DeploymentFailedEmail', vars: 'userName: string, organizationName: string, agentName: string, deploymentEnv: string, errorMessage: string', subject: 'Deployment Failed' },
  { path: 'delivery/QAApprovedEmail.tsx', name: 'QAApprovedEmail', vars: 'userName: string, organizationName: string, agentName: string, reviewerName: string, dashboardUrl: string', subject: 'QA Approved' },
  { path: 'security/SuspiciousLoginEmail.tsx', name: 'SuspiciousLoginEmail', vars: 'userName: string, ipAddress: string, location: string, userAgent: string, timestamp: string, securityUrl: string', subject: 'Suspicious Login Detected' },
  { path: 'security/APIKeyCreatedEmail.tsx', name: 'APIKeyCreatedEmail', vars: 'userName: string, keyName: string, createdAt: string, ipAddress: string', subject: 'API Key Created' },
  { path: 'notifications/AnnouncementEmail.tsx', name: 'AnnouncementEmail', vars: 'title: string, body: string, ctaUrl?: string, ctaLabel?: string', subject: 'Announcement' },
  { path: 'notifications/MaintenanceNoticeEmail.tsx', name: 'MaintenanceNoticeEmail', vars: 'title: string, startTime: string, endTime: string, affectedServices: string', subject: 'Maintenance Notice' },
];

const basePath = path.join(__dirname, '../src/components/emails');

templates.forEach(t => {
  const fullPath = path.join(basePath, t.path);
  const dir = path.dirname(fullPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const propsInterface = t.vars ? `interface ${t.name}Props {\n  ${t.vars.split(', ').join(';\n  ')};\n  appName?: string;\n  appUrl?: string;\n  supportEmail?: string;\n  currentYear?: number;\n}` : `interface ${t.name}Props {\n  appName?: string;\n  appUrl?: string;\n  supportEmail?: string;\n  currentYear?: number;\n}`;
  
  // Extract just the prop names for destructuring, handling optional props
  const propNames = t.vars ? t.vars.split(', ').map(v => v.split(':')[0].replace('?', '')) : [];
  propNames.push('appName = "KantaSwara"');
  propNames.push('appUrl = "https://kantaswara.com"');
  propNames.push('supportEmail = "support@kantaswara.com"');
  propNames.push('currentYear = new Date().getFullYear()');

  const destructure = propNames.join(',\n  ');

  const content = `import { Text } from '@react-email/components';
import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { EmailButton } from '../components/EmailButton';

${propsInterface}

export default function ${t.name}({
  ${destructure}
}: ${t.name}Props) {
  return (
    <BaseEmailLayout
      previewText="${t.subject}"
      appName={appName}
      appUrl={appUrl}
      supportEmail={supportEmail}
      currentYear={currentYear}
    >
      <Text style={heading}>${t.subject}</Text>
      
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
`;

  fs.writeFileSync(fullPath, content);
  console.log(`Created ${t.path}`);
});
