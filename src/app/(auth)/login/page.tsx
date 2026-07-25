'use client';
import { Suspense } from 'react';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AuthTabs, TechOrbitDisplay, Ripple } from '@/features/auth/components/modern-animated-sign-in';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/dashboard';
  const supabase = createClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    const email = formData.get('Email') as string;
    const password = formData.get('Password') as string;

    setServerError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setServerError(
        error.message === 'Invalid login credentials'
          ? 'Invalid email or password. Please try again.'
          : error.message
      );
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  const handleGoogleLogin = async () => {
    setServerError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/callback`,
      },
    });

    if (error) {
      setServerError(error.message);
    }
  };

  const formFields = {
    header: 'Welcome back',
    subHeader: 'Sign in to your account',
    fields: [
      {
        label: 'Email',
        type: 'email' as const,
        required: true,
        placeholder: 'Enter your email address',
        onChange: () => {},
      },
      {
        label: 'Password',
        type: 'password' as const,
        required: true,
        placeholder: 'Enter your password',
        onChange: () => {},
      },
    ],
    submitButton: 'Sign in',
    textVariantButton: "Forgot password?",
    errorField: serverError ?? undefined,
  };

  return (
    <div className="flex w-full h-screen bg-black text-white relative overflow-hidden">
      <div className="z-10 flex w-full h-screen items-stretch justify-center">
        {/* Left Side: Tech Orbit Display */}
        <div className="hidden lg:flex w-1/2 relative justify-center items-center overflow-hidden bg-zinc-950">
          <Ripple />
          <TechOrbitDisplay iconsArray={[]} text="KantaSwara" />
        </div>

        {/* Right Side: Auth Form */}
        <div className="w-full lg:w-1/2 h-screen flex justify-center p-6 md:p-12 overflow-y-auto">
          <div className="w-full max-w-sm relative z-20 my-auto">
             <AuthTabs 
                formFields={formFields} 
                goTo={(e) => { e.preventDefault(); router.push('/forgot-password'); }} 
                handleSubmit={handleSubmit} 
                handleGoogleLogin={handleGoogleLogin}
             />
             <div className="mt-8 text-center">
                <button onClick={() => router.push('/register')} className="text-sm text-[#ff6600] hover:underline cursor-pointer">
                  Don&apos;t have an account? Create one
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
