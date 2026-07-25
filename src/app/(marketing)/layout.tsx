import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KantaSwara — Most Voice AI Answers the Call. Ours Closes It.',
  description:
    'KantaSwara is a workflow-driven Voice Agent platform built for Real Estate, EdTech, and Automobile businesses in India. Every inquiry is handled by an AI Voice Employee that qualifies the lead, retrieves your business knowledge, books the appointment, and updates your CRM.',
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-page="marketing"
      style={{ background: '#FFFFFF', minHeight: '100vh' }}
    >
      {children}
    </div>
  );
}
