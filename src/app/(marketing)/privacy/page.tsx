import React from 'react';
import { Navbar } from '@/features/landing/components/Navbar';
import { Footer } from '@/features/landing/components/Footer';

export const metadata = {
  title: 'Privacy Policy | KantaSwara',
  description: 'Privacy Policy for KantaSwara Voice AI Platform',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#060810] text-white flex flex-col">
      <Navbar />
      
      <div className="flex-1 max-w-4xl mx-auto px-6 py-16 mt-20 w-full">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-400 mb-8">Last updated: July 2026</p>
        
        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section className="bg-[#0B0E18] border border-[#1E2738] rounded-2xl p-6 md:p-8 space-y-4">
            <h2 className="text-xl font-semibold text-white">1. Information We Collect</h2>
            <p className="text-slate-300">
              We collect information provided directly by you when creating an account, configuring AI voice agents, and integrating communication tools, including account credentials, transcript history, and call metrics.
            </p>
          </section>

          <section className="bg-[#0B0E18] border border-[#1E2738] rounded-2xl p-6 md:p-8 space-y-4">
            <h2 className="text-xl font-semibold text-white">2. How We Use Information</h2>
            <p className="text-slate-300">
              Your data is used solely to provide, operate, and enhance KantaSwara voice services, including speech processing, conversation synthesis, workflow analytics, and account management.
            </p>
          </section>

          <section className="bg-[#0B0E18] border border-[#1E2738] rounded-2xl p-6 md:p-8 space-y-4">
            <h2 className="text-xl font-semibold text-white">3. Data Retention & Privacy Rights</h2>
            <p className="text-slate-300">
              We enforce strict encryption standards and data access controls. Users retain full rights to inspect, update, or request deletion of their data at any time.
            </p>
          </section>

          <section className="bg-[#0B0E18] border border-[#1E2738] rounded-2xl p-6 md:p-8 space-y-4">
            <h2 className="text-xl font-semibold text-white">4. Contact Privacy Officer</h2>
            <p className="text-slate-300">
              For any privacy inquiries or request fulfillment, please reach out to{' '}
              <a href="mailto:privacy@kantaswara.com" className="text-orange-400 underline hover:text-orange-300">
                privacy@kantaswara.com
              </a>.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
