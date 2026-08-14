import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live AI Voice Demo — KantaSwara',
  description:
    'Experience AI voice agents in action. Choose Healthcare, Education, or Banking and talk to a real AI assistant. No login required — just pick a domain and start.',
  keywords: [
    'AI voice demo',
    'voice agent demo',
    'healthcare AI',
    'education AI assistant',
    'banking AI support',
    'KantaSwara demo',
    'conversational AI',
  ],
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
