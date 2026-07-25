import React from 'react';
import { Navbar } from '@/features/landing/components/Navbar';
import { Footer } from '@/features/landing/components/Footer';

export const metadata = {
  title: 'Terms of Service | KantaSwara',
  description: 'Terms of Service for KantaSwara Voice AI Platform',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#060810] text-white flex flex-col">
      <Navbar />
      
      <div className="flex-1 max-w-4xl mx-auto px-6 py-16 mt-20 w-full">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
          Terms of Service
        </h1>
        <p className="text-sm text-slate-400 mb-8">Last updated: July 2026</p>
        
        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section className="bg-[#0B0E18] border border-[#1E2738] rounded-2xl p-6 md:p-8 space-y-4">
            <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
            <p className="text-slate-300">
              By accessing or using the KantaSwara AI platform, services, and applications, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="bg-[#0B0E18] border border-[#1E2738] rounded-2xl p-6 md:p-8 space-y-4">
            <h2 className="text-xl font-semibold text-white">2. Description of Service</h2>
            <p className="text-slate-300">
              KantaSwara provides an enterprise voice AI platform enabling businesses to automate customer interactions, lead qualification, and appointment scheduling via voice agents.
            </p>
          </section>

          <section className="bg-[#0B0E18] border border-[#1E2738] rounded-2xl p-6 md:p-8 space-y-4">
            <h2 className="text-xl font-semibold text-white">3. User Responsibilities & Data Security</h2>
            <p className="text-slate-300">
              Users must maintain the confidentiality of their credentials and ensure compliance with applicable call-recording, privacy, and telecommunication laws when deploying voice agents.
            </p>
          </section>

          <section className="bg-[#0B0E18] border border-[#1E2738] rounded-2xl p-6 md:p-8 space-y-4">
            <h2 className="text-xl font-semibold text-white">4. Contact Information</h2>
            <p className="text-slate-300">
              If you have any questions regarding these Terms, please contact us at{' '}
              <a href="mailto:legal@kantaswara.com" className="text-orange-400 underline hover:text-orange-300">
                legal@kantaswara.com
              </a>.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
