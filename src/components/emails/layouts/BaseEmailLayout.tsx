import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface BaseEmailLayoutProps {
  previewText: string;
  appName: string;
  appUrl: string;
  supportEmail: string;
  currentYear: number | string;
  children: React.ReactNode;
}

export default function BaseEmailLayout({
  previewText,
  appName = 'KantaSwara',
  appUrl = 'https://kantaswara.com',
  supportEmail = 'support@kantaswara.com',
  currentYear = new Date().getFullYear(),
  children,
}: BaseEmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            {/* Replace with actual logo URL once available */}
            <Text style={logoText}>{appName}</Text>
          </Section>

          {/* Hero Band / Top Border */}
          <div style={heroBand} />

          {/* Main Content Area */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Section style={footer}>
            <Hr style={divider} />
            <Text style={footerText}>
              Need help? Contact our support team at{' '}
              <Link href={`mailto:${supportEmail}`} style={link}>
                {supportEmail}
              </Link>
            </Text>
            <Text style={footerText}>
              © {currentYear} {appName}. All rights reserved.
              <br />
              <Link href={`${appUrl}/privacy`} style={link}>
                Privacy Policy
              </Link>{' '}
              •{' '}
              <Link href={`${appUrl}/terms`} style={link}>
                Terms of Service
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f9fafb',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  padding: '0',
  borderRadius: '8px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  maxWidth: '600px',
  overflow: 'hidden',
};

const header = {
  padding: '32px 40px 24px',
  textAlign: 'center' as const,
};

const logoText = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0',
  letterSpacing: '-0.5px',
};

const heroBand = {
  height: '4px',
  width: '100%',
  backgroundColor: '#4F46E5', // KantaSwara brand primary (Indigo 600)
  background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)',
};

const content = {
  padding: '40px',
};

const footer = {
  padding: '0 40px 40px',
  textAlign: 'center' as const,
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '0 0 24px 0',
};

const footerText = {
  fontSize: '12px',
  lineHeight: '20px',
  color: '#6b7280',
  margin: '0 0 12px 0',
};

const link = {
  color: '#4F46E5',
  textDecoration: 'none',
};
