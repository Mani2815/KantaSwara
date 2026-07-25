import Link from 'next/link';
import type { Metadata } from 'next';
import { Ripple, TechOrbitDisplay } from '@/features/auth/components/modern-animated-sign-in';
import { Mail, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'KantaSwara — Verify Your Email',
  description: 'Check your inbox to verify your email and activate your KantaSwara workspace.',
};

export default function VerifyEmailPage() {
  return (
    <div className="flex w-full min-h-screen bg-black text-white relative overflow-hidden">
      <div className="z-10 flex w-full min-h-screen items-stretch justify-center">

        {/* Left Side: Tech Orbit Display */}
        <div className="hidden lg:flex w-1/2 relative justify-center items-center">
          <Ripple />
          <TechOrbitDisplay iconsArray={[]} text="KantaSwara" />
        </div>

        {/* Right Side: Verify Email Card */}
        <div className="w-full lg:w-1/2 flex justify-center items-center p-6 md:p-12">
          <div className="w-full max-w-sm relative z-20">

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-[#ff6600]/20 blur-xl scale-150" />
                <div className="relative w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <Mail className="w-9 h-9 text-[#ff6600]" strokeWidth={1.5} />
                </div>
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-3xl font-bold text-white text-center mb-2">
              Check your inbox
            </h1>
            <p className="text-zinc-400 text-sm text-center mb-8 leading-relaxed">
              We&apos;ve sent a verification email to your address. Click the link
              inside to activate your KantaSwara workspace.
            </p>

            {/* Checklist */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-8 space-y-3">
              {[
                {
                  icon: <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />,
                  text: 'Check your spam or junk folder if you don\'t see it',
                },
                {
                  icon: <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />,
                  text: 'The link expires in 24 hours',
                },
                {
                  icon: <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />,
                  text: 'Make sure you used the correct email address',
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  {item.icon}
                  <p className="text-zinc-300 text-sm">{item.text}</p>
                </div>
              ))}
            </div>

            {/* Back to sign in button */}
            <Link
              href="/login"
              id="go-to-login"
              className="group relative block w-full text-center text-zinc-400 hover:text-white font-medium py-2.5 transition-colors"
            >
              <span className="relative z-10">← Back to sign in</span>
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}
