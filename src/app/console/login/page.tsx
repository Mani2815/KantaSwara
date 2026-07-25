'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TechOrbitDisplay, Ripple, Input, Label } from '@/features/auth/components/modern-animated-sign-in';
import { ButtonGlow } from '@/components/ui/ButtonGlow';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function ConsoleLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/console/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      router.push(data.redirectUrl || '/console');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full h-screen bg-black text-white relative overflow-hidden selection:bg-orange-500/30">
      <div className="z-10 flex w-full h-screen items-stretch justify-center">
        {/* Left Side: Tech Orbit Display */}
        <div className="hidden lg:flex w-1/2 relative justify-center items-center overflow-hidden bg-zinc-950 border-r border-zinc-900">
          <Ripple />
          <TechOrbitDisplay iconsArray={[]} text={"KantaSwara\nConsole"} />
        </div>

        {/* Right Side: Auth Form */}
        <div className="w-full lg:w-1/2 h-screen flex justify-center p-6 md:p-12 overflow-y-auto custom-scrollbar">
          <div className="w-full max-w-md relative z-20 my-auto">
            
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium mb-3">
                <ShieldCheck className="w-3.5 h-3.5" /> Internal Console Access
              </div>
              <h2 className="font-bold text-3xl text-zinc-100">Employee Sign In</h2>
              <p className="text-zinc-400 text-sm mt-2">
                Access the KantaSwara administrative management console.
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3.5 rounded-lg flex items-center gap-2">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">Company Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="employee@kantaswara.com"
                  className="bg-zinc-900/50 border-zinc-800 focus:border-orange-500 text-white"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-zinc-300">Password</Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-zinc-900/50 border-zinc-800 focus:border-orange-500 text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <ButtonGlow
                  type="submit"
                  disabled={isLoading}
                  showArrow={false}
                  className="w-full h-11 bg-orange-600 hover:bg-orange-500 text-white font-semibold"
                >
                  {isLoading ? 'Authenticating...' : 'Sign In to Console'}
                </ButtonGlow>
              </div>
            </form>

            <div className="mt-8 text-center text-xs text-zinc-500">
              Restricted access system. Authorized employees only.
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
