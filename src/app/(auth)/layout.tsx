import type { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KantaSwara — Authentication',
  description: 'Sign in to KantaSwara — The Voice of Intelligent Business',
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="dark min-h-screen w-full bg-black text-white selection:bg-orange-500/30">
      {children}
    </main>
  );
}
