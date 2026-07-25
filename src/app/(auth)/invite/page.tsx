'use client';
import { Suspense } from 'react';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserCheck, Shield, Lock, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function InviteAcceptPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const supabase = createClient();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    // Simulate accepting invitation and completing account setup
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-[#ff6600]/10 border border-[#ff6600]/20 flex items-center justify-center mb-6 text-[#ff6600]">
          <UserCheck className="w-6 h-6" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Accept Team Invitation</h1>
        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
          You have been invited to join an existing B2B Organization on KantaSwara. Set your password to access your team workspace.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleAcceptInvite} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-zinc-500" /> Set Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff6600]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-zinc-500" /> Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff6600]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff6600] hover:bg-[#ff6600]/90 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-6"
          >
            {loading ? 'Joining Team...' : <>Join Organization <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function InviteAcceptPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InviteAcceptPageContent />
    </Suspense>
  );
}
