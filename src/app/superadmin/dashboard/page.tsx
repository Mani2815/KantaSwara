import { supabaseAdmin } from '@server/lib/supabase/admin';
import { 
  Building2, Users, Bot, PhoneCall, TrendingUp, Activity, 
  ShieldCheck, Server, DollarSign, Database, HardDrive, AlertTriangle 
} from 'lucide-react';

export const metadata = {
  title: 'KantaSwara — Platform Overview',
};

async function getPlatformStats() {
  const [orgsRes, usersRes, agentsRes, callsRes, activeSubs] = await Promise.all([
    supabaseAdmin.from('organizations').select('id, name, slug, plan, is_active, created_at', { count: 'exact' }),
    supabaseAdmin.from('profiles').select('id, full_name, email, role, is_active, created_at, organization_id', { count: 'exact' }),
    supabaseAdmin.from('agents').select('id, status', { count: 'exact' }),
    supabaseAdmin.from('conversations').select('id, duration_seconds', { count: 'exact' }),
    // Using Prisma for billing data
    import('@server/lib/prisma').then(m => m.prisma.organizationSubscription.findMany({
      where: { status: 'active' },
      include: { plan: true },
    }))
  ]);

  const orgs = orgsRes.data ?? [];
  const activeOrgs = orgs.filter(o => o.is_active).length;
  
  const monthlyRevenue = activeSubs.reduce((sum, sub) => {
    return sum + Number(sub.customMonthlyPrice || sub.plan.priceMonthly);
  }, 0);

  return {
    totalOrgs: orgsRes.count ?? 0,
    activeOrgs,
    totalUsers: usersRes.count ?? 0,
    totalAgents: agentsRes.count ?? 0,
    totalCalls: callsRes.count ?? 0,
    monthlyRevenue,
  };
}

export default async function SuperAdminDashboard() {
  const stats = await getPlatformStats();

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Platform Overview</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Real-time health, tenant metrics, and infrastructure status.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">All Systems Operational</span>
        </div>
      </div>

      {/* SECTION 1: Tenant & Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Building2 size={20} className="text-orange-500" />
            </div>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">+12% MoM</span>
          </div>
          <h3 className="text-3xl font-bold text-[var(--color-text-primary)] mb-1">{stats.totalOrgs}</h3>
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">Total Organizations</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">{stats.activeOrgs} active tenants</p>
        </div>

        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <DollarSign size={20} className="text-emerald-500" />
            </div>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">+8% MoM</span>
          </div>
          <h3 className="text-3xl font-bold text-[var(--color-text-primary)] mb-1">${stats.monthlyRevenue.toLocaleString()}</h3>
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">Monthly Recurring Revenue</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Across all active plans</p>
        </div>

        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <PhoneCall size={20} className="text-blue-500" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-[var(--color-text-primary)] mb-1">{stats.totalCalls.toLocaleString()}</h3>
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">Total Calls Processed</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Platform aggregate</p>
        </div>

        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Bot size={20} className="text-purple-500" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-[var(--color-text-primary)] mb-1">{stats.totalAgents.toLocaleString()}</h3>
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">Active AI Agents</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Deployed across orgs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SECTION 2: Infrastructure Health */}
        <div className="lg:col-span-2 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="text-[var(--color-text-secondary)]" size={18} />
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Infrastructure Health</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Core API', status: 'Healthy', latency: '42ms', icon: Server, color: 'text-emerald-500' },
              { name: 'Supabase DB', status: 'Healthy', latency: '12ms', icon: Database, color: 'text-emerald-500' },
              { name: 'Chroma Vector', status: 'Healthy', latency: '89ms', icon: HardDrive, color: 'text-emerald-500' },
              { name: 'Voice Provider', status: 'Degraded', latency: '405ms', icon: PhoneCall, color: 'text-yellow-500' },
            ].map((service) => (
              <div key={service.name} className="bg-[var(--color-bg-subtle)] border border-[var(--color-border-default)] rounded-lg p-4 flex flex-col items-center justify-center text-center">
                <service.icon size={24} className={`mb-3 ${service.color}`} />
                <span className="text-xs font-semibold text-[var(--color-text-primary)] mb-1">{service.name}</span>
                <span className={`text-[10px] uppercase font-bold tracking-wider ${service.color}`}>{service.status}</span>
                <span className="text-[10px] text-[var(--color-text-muted)] mt-2">{service.latency}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: Security & Alerts */}
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-[var(--color-text-secondary)]" size={18} />
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Security & Alerts</h2>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
              <div>
                <p className="text-xs font-semibold text-red-400">Multiple Failed Logins</p>
                <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">14 failed attempts on admin@acmecorp.com from IP 192.168.1.1</p>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-2">10 mins ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <Activity className="text-yellow-500 shrink-0 mt-0.5" size={16} />
              <div>
                <p className="text-xs font-semibold text-yellow-400">Voice API Latency Spike</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">Twilio provider returning &gt;400ms TTFB.</p>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-2">45 mins ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
