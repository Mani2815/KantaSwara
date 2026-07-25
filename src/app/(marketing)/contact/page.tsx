'use client';

import { Navbar } from '@/features/landing/components/Navbar';
import { Footer } from '@/features/landing/components/Footer';

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-[80vh] flex items-center justify-center pt-32 pb-16 px-6">
        <div className="max-w-[600px] w-full text-center">
          <h1 className="text-[40px] leading-tight font-bold tracking-tight mb-4 text-black dark:text-white">Contact Sales</h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-12 max-w-md mx-auto">
            Interested in learning how KantaSwara can transform your business? Get in touch with our team today.
          </p>
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-8 sm:p-10 shadow-sm text-left">
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">First Name</label>
                  <input type="text" className="w-full px-4 py-3 bg-neutral-50/50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors" placeholder="Jane" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Last Name</label>
                  <input type="text" className="w-full px-4 py-3 bg-neutral-50/50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors" placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Work Email</label>
                <input type="email" className="w-full px-4 py-3 bg-neutral-50/50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors" placeholder="jane@company.com" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Company</label>
                <input type="text" className="w-full px-4 py-3 bg-neutral-50/50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors" placeholder="Acme Inc" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">How can we help?</label>
                <textarea className="w-full px-4 py-3 bg-neutral-50/50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 min-h-[140px] resize-none transition-colors" placeholder="Tell us about your use case..."></textarea>
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full bg-black hover:bg-black/90 text-white dark:bg-white dark:text-black dark:hover:bg-white/90 rounded-lg py-3.5 px-4 font-medium transition-colors">
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
