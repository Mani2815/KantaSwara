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
  appName?: string;
  appUrl?: string;
  supportEmail?: string;
  currentYear?: number | string;
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
  // Use localhost in dev, or actual URL in prod for image assets
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const logoUrl = `${baseUrl}/images/kantaswara-logo.png`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src={logoUrl}
              alt={appName}
              width="210"
              height="55"
              style={logoImage}
            />
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
  backgroundColor: '#09090b', // zinc-950
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  padding: '40px 0',
};

const container = {
  backgroundColor: '#18181b', // zinc-900
  margin: '0 auto',
  padding: '0',
  borderRadius: '12px',
  border: '1px solid #27272a', // zinc-800
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
  maxWidth: '600px',
  overflow: 'hidden',
};

const header = {
  padding: '32px 40px 24px',
  textAlign: 'center' as const,
};

const logoImage = {
  margin: '0 auto',
  display: 'block',
};

const heroBand = {
  height: '2px',
  width: '100%',
  backgroundColor: '#ff6600', // KantaSwara brand orange
  background: 'linear-gradient(90deg, #ff6600 0%, #ff8533 100%)',
};

const content = {
  padding: '40px',
  color: '#e4e4e7', // zinc-200
};

const footer = {
  padding: '0 40px 40px',
  textAlign: 'center' as const,
};

const divider = {
  borderColor: '#27272a', // zinc-800
  margin: '0 0 24px 0',
};

const footerText = {
  fontSize: '12px',
  lineHeight: '20px',
  color: '#a1a1aa', // zinc-400
  margin: '0 0 12px 0',
};

const link = {
  color: '#ff6600',
  textDecoration: 'none',
};
