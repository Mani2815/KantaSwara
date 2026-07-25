'use client';

import React, { useState } from 'react';
import { createInternalAdmin } from './actions';
import { UserPlus, Loader2, ShieldCheck, Rocket } from 'lucide-react';

export function CreateAdminForm() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await createInternalAdmin(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        (e.target as HTMLFormElement).reset();
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
          <UserPlus className="text-orange-500" size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Provision Internal Admin</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Create credentials for a new Super Admin or Solutions Admin.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-500/20">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
            Admin successfully provisioned!
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Full Name</label>
            <input 
              name="fullName"
              type="text" 
              required
              placeholder="Jane Doe"
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email Address</label>
            <input 
              name="email"
              type="email" 
              required
              placeholder="jane@kantaswara.com"
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Temporary Password</label>
          <input 
            name="password"
            type="password" 
            required
            placeholder="Min. 8 characters"
            minLength={8}
            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Admin Role</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="relative flex cursor-pointer rounded-lg border bg-white dark:bg-zinc-900 p-4 shadow-sm focus:outline-none hover:border-zinc-300 dark:hover:border-zinc-700 border-zinc-200 dark:border-zinc-800 has-[:checked]:border-orange-500 has-[:checked]:ring-1 has-[:checked]:ring-orange-500 transition-colors">
              <input type="radio" name="role" value="super_admin" className="sr-only" required />
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-orange-500" size={20} />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-zinc-900 dark:text-white">Super Admin</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">Full platform access</span>
                  </div>
                </div>
              </div>
            </label>

            <label className="relative flex cursor-pointer rounded-lg border bg-white dark:bg-zinc-900 p-4 shadow-sm focus:outline-none hover:border-zinc-300 dark:hover:border-zinc-700 border-zinc-200 dark:border-zinc-800 has-[:checked]:border-indigo-500 has-[:checked]:ring-1 has-[:checked]:ring-indigo-500 transition-colors">
              <input type="radio" name="role" value="solutions_admin" className="sr-only" required />
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-3">
                  <Rocket className="text-indigo-500" size={20} />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-zinc-900 dark:text-white">Solutions Admin</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">AI Delivery Console access</span>
                  </div>
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="pt-2">
          <button 
            type="submit" 
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
            Create Credentials
          </button>
        </div>
      </form>
    </div>
  );
}
