'use client';
import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { TechOrbitDisplay, Ripple, BottomGradient } from '@/features/auth/components/modern-animated-sign-in';
import { ButtonGlow } from '@/components/ui/ButtonGlow';
import { RefreshCw, Mail, LogOut, CheckCircle2 } from 'lucide-react';

function PendingApprovalContent() {
  const router = useRouter();
  const supabase = createClient();
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const fetchStatus = useCallback(async () => {
    setRefreshing(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    setUserEmail(user.email || '');

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      router.push('/register');
      return;
    }

    const { data: organization } = await supabase
      .from('organizations')
      .select('name, status, approval_status, created_at')
      .eq('id', profile.organization_id)
      .single();

    if (organization) {
      setOrg(organization);
      const isApproved =
        organization.status === 'approved' ||
        organization.status === 'APPROVED' ||
        organization.status === 'active' ||
        organization.approval_status === 'approved' ||
        organization.approval_status === 'APPROVED';
      if (isApproved) {
        router.push('/dashboard');
      }
    }
    
    setLoading(false);
    setRefreshing(false);
  }, [supabase, router]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex w-full h-screen bg-black text-white items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen bg-black text-white relative overflow-hidden selection:bg-orange-500/30">
      <div className="z-10 flex w-full min-h-screen items-stretch justify-center">
        
        {/* Left Side */}
        <div className="hidden lg:flex w-1/2 relative justify-center items-center bg-zinc-950/50 border-r border-zinc-900">
          
          <div className="text-center relative z-10 max-w-sm">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-100 mb-4">Registration Submitted</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Your organization has been successfully registered and is currently under review by the KantaSwara team.
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full lg:w-1/2 flex justify-center items-center p-6 md:p-12 overflow-y-auto">
          <div className="w-full max-w-md relative z-20 py-12">
            
            <div className="mb-8">
              <h1 className="font-bold text-3xl text-zinc-100">
                Pending Approval
              </h1>
              <p className="text-zinc-400 text-sm mt-2">
                We'll verify your organization and activate your workspace after approval.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8 space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                <span className="text-zinc-500 text-sm">Organization</span>
                <span className="text-zinc-200 font-medium">{org?.name}</span>
              </div>
              
              <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                <span className="text-zinc-500 text-sm">Registered Email</span>
                <span className="text-zinc-200">{userEmail}</span>
              </div>
              
              <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                <span className="text-zinc-500 text-sm">Date</span>
                <span className="text-zinc-200">
                  {org?.created_at ? new Date(org.created_at).toLocaleDateString() : 'Just now'}
                </span>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <span className="text-zinc-500 text-sm">Status</span>
                <span className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs px-3 py-1.5 rounded-full font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Pending Approval
                </span>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 mb-8">
              <h3 className="text-sm font-medium text-zinc-300 mb-1">Estimated Review Time</h3>
              <p className="text-xs text-zinc-500">Within 1 business day. We will email you once approved.</p>
            </div>

            <div className="space-y-4">
              <ButtonGlow
                onClick={fetchStatus}
                disabled={refreshing}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
                showArrow={false}
              >
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Checking Status...' : 'Refresh Status'}
                </div>
              </ButtonGlow>

              <div className="flex gap-4">
                <button
                  onClick={() => window.location.href = 'mailto:support@kantaswara.com'}
                  className="flex-1 flex items-center justify-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 rounded-full py-2.5 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Contact Support
                </button>
                
                <button
                  onClick={handleSignOut}
                  className="flex-1 flex items-center justify-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 rounded-full py-2.5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default function PendingApprovalPage() {
  return (
    <Suspense fallback={<div className="flex h-screen bg-black items-center justify-center"><div className="animate-spin h-8 w-8 border-b-2 border-orange-500 rounded-full" /></div>}>
      <PendingApprovalContent />
    </Suspense>
  );
}
