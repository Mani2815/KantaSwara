import React from 'react';
import { Clock, Building2, CheckCircle2, Mail, Calendar, RefreshCcw, HeadphonesIcon } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@server/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export const metadata = {
  title: 'Pending Approval — KantaSwara',
};

export default async function PendingApprovalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch the user's profile and organization
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, organization_id, organizations!inner(name, created_at, status, approval_status)')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/register');
  }

  const org = profile.organizations as any;

  const isApproved =
    org.status === 'approved' ||
    org.status === 'APPROVED' ||
    org.status === 'active' ||
    org.approval_status === 'approved' ||
    org.approval_status === 'APPROVED';

  if (isApproved) {
    redirect('/dashboard');
  }

  const registrationDate = new Date(org.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center p-4 selection:bg-orange-500/30">
      
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-xl w-full bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden relative z-10">
        
        {/* Header Section */}
        <div className="p-8 pb-6 border-b border-zinc-800 text-center">
          <div className="w-16 h-16 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">
            Organization Registration Received
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-md mx-auto">
            Your organization has been successfully registered. Our team is currently reviewing your registration before activating your workspace. This helps us maintain a secure, high-quality platform and prepare your organization for onboarding.
          </p>
        </div>

        {/* Details Section */}
        <div className="p-8 bg-zinc-900/30">
          
          <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-lg border border-zinc-800 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
              <span className="text-sm font-medium text-zinc-300">Status</span>
            </div>
            <span className="text-sm font-semibold text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
              Pending Approval
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800/50">
              <div className="flex items-center gap-3 text-zinc-400">
                <Building2 className="w-4 h-4" />
                <span className="text-sm">Organization Name</span>
              </div>
              <span className="text-sm font-medium text-white">{org.name}</span>
            </div>

            <div className="flex items-center justify-between pb-4 border-b border-zinc-800/50">
              <div className="flex items-center gap-3 text-zinc-400">
                <Mail className="w-4 h-4" />
                <span className="text-sm">Verified Email</span>
              </div>
              <span className="text-sm font-medium text-white">{user.email}</span>
            </div>

            <div className="flex items-center justify-between pb-4 border-b border-zinc-800/50">
              <div className="flex items-center gap-3 text-zinc-400">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Registration Date</span>
              </div>
              <span className="text-sm font-medium text-white">{registrationDate}</span>
            </div>

            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-3 text-zinc-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Estimated Review Time</span>
              </div>
              <span className="text-sm font-medium text-white">1 - 2 Business Days</span>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="p-8 pt-6 flex gap-4">
          <form className="w-full">
            <button 
              formAction={async () => {
                'use server';
                revalidatePath('/pending-approval');
                redirect('/pending-approval');
              }}
              className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-zinc-200 transition-colors py-2.5 rounded-full text-sm font-medium"
            >
              <RefreshCcw className="w-4 h-4" />
              Refresh Status
            </button>
          </form>

          <Link href="mailto:support@kantaswara.com" className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white border border-zinc-800 hover:bg-zinc-800 transition-colors py-2.5 rounded-full text-sm font-medium">
            <HeadphonesIcon className="w-4 h-4" />
            Contact Support
          </Link>
        </div>

      </div>

      <div className="mt-8 text-center">
        <form action="/auth/signout" method="post">
          <button type="submit" className="text-sm text-zinc-500 hover:text-white transition-colors">
            Sign out of {user.email}
          </button>
        </form>
      </div>
    </div>
  );
}
