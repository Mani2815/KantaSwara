import type { Metadata } from 'next';
import '@/styles/globals.css';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { SupabaseProvider } from '@/providers/SupabaseProvider';
import { AuthProvider } from '@/providers/AuthProvider';

export const metadata: Metadata = {
  title: 'KantaSwara — The Voice of Intelligent Business',
  description:
    'Deploy AI Voice Agents. Manage them like a team. KantaSwara is the enterprise platform for intelligent voice operations — workflow-controlled conversations, multi-tenant isolation, and real-time analytics.',
  keywords: [
    'AI Voice Agents',
    'Voice AI Platform',
    'Call Center AI',
    'Voice Automation',
    'Enterprise Voice Operations',
    'AI Customer Support',
    'Voice Workflow Builder',
  ],
  icons: {
    icon: '/images/kantaswara-favicon.svg',
  },
};

import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              const theme = localStorage.getItem('ks-theme') || 'light';
              document.documentElement.setAttribute('data-theme', theme);
              if (theme === 'dark') {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (_) {}
          `
        }} />

        <link
          rel="preload"
          href="/fonts/Inter-Variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <ThemeProvider>
          <SupabaseProvider>
            <AuthProvider>
              {children}
              <Toaster position="top-center" />
            </AuthProvider>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
