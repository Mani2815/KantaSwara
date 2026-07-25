'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Activity, LayoutDashboard, Bot, PhoneCall, 
  BookOpen, Users, BarChart2, Bell, Search,
  ChevronRight, PanelLeftClose, PanelLeftOpen, Moon, Sun,
  Plug, LifeBuoy, Building, LogOut, User, ClipboardList
} from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';

import styles from './AppShell.module.css';
import { cn } from '@/lib/utils/cn';
import { ROUTES } from '@/constants/routes';
import { useUIStore } from '@/lib/store/ui.store';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/components/common/Logo';

// ============================================
// NAVIGATION CONFIG
// ============================================
const NAVIGATION: {
  group: string;
  items: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    badge?: string;
  }[];
}[] = [
  {
    group: 'Overview',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, href: ROUTES.DASHBOARD },
    ],
  },
  {
    group: 'Operations',
    items: [
      { label: 'Agent Requests', icon: ClipboardList, href: ROUTES.AGENT_REQUESTS },
      { label: 'Assigned Agents', icon: Bot, href: ROUTES.AGENTS },
      { label: 'Live Calls', icon: PhoneCall, href: ROUTES.CALLS },
    ],
  },
  {
    group: 'Business',
    items: [
      { label: 'CRM / Leads', icon: Users, href: ROUTES.LEADS },
      { label: 'Knowledge Base', icon: BookOpen, href: ROUTES.KNOWLEDGE },
      { label: 'Analytics', icon: BarChart2, href: ROUTES.ANALYTICS },
    ],
  },
  {
    group: 'Support',
    items: [
      { label: 'Organization', icon: Building, href: ROUTES.ORGANIZATION },
      { label: 'Support & Help', icon: LifeBuoy, href: '/support' },
    ],
  },
  {
    group: 'Settings',
    items: [
      { label: 'API & Billing', icon: Plug, href: ROUTES.SETTINGS },
    ],
  }
];

// ============================================
// COMPONENTS
// ============================================

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { 
    sidebarCollapsed, setSidebarCollapsed, 
    systemHealth, apiLatency, activeAgentsCount, activeCallsCount 
  } = useUIStore();
  const { profile, organization, signOut } = useAuth();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Generate basic breadcrumbs from pathname
  const paths = pathname.split('/').filter(Boolean);

  const getInitials = (name: string | undefined | null, fallback: string) => {
    if (!name) return fallback;
    const parts = name.trim().split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };
  
  const orgName = organization?.name || 'Acme Corp';
  const orgPlan = organization?.plan ? organization.plan.charAt(0).toUpperCase() + organization.plan.slice(1) + ' Plan' : 'Free Plan';
  const orgInitials = getInitials(organization?.name, 'AC');
  const userInitials = getInitials(profile?.full_name, 'JD');
  
  return (
    <div className={styles['app-shell']}>
      {/* ============================================
          SIDEBAR
          ============================================ */}
      <aside 
        className={cn(
          styles.sidebar,
          sidebarCollapsed && styles['sidebar--collapsed'],
          mobileOpen && styles['sidebar--mobile-open']
        )}
      >
        <div className={styles.sidebar__header}>
          <Link href={ROUTES.DASHBOARD} className={styles.sidebar__brand}>
            <Logo iconOnly={sidebarCollapsed} className={sidebarCollapsed ? "h-10 w-auto text-[#ff6600]" : "h-11 md:h-12 w-auto text-[#ff6600]"} />
          </Link>
        </div>

        <nav className={styles.sidebar__nav}>
          {NAVIGATION.map((group, i) => (
            <div key={i} className={styles['nav-group']}>
              {!sidebarCollapsed && <div className={styles['nav-group__label']}>{group.group}</div>}
              {group.items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link 
                    key={`${group.group}-${item.label}`} 
                    href={item.href}
                    className={cn(styles['nav-item'], isActive && styles['nav-item--active'])}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className={styles['nav-item__icon']} />
                    {!sidebarCollapsed && <span className={styles['nav-item__label']}>{item.label}</span>}
                    {!sidebarCollapsed && item.badge && (
                      <span className={styles['nav-item__badge']}>{item.badge}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className={styles.sidebar__footer}>
          {!sidebarCollapsed ? (
            <Link href={ROUTES.ORGANIZATION} className={styles['tenant-selector']} style={{ textDecoration: 'none' }}>
              <div className={styles['tenant-selector__avatar']}>{orgInitials}</div>
              <div className={styles['tenant-selector__info']}>
                <span className={styles['tenant-selector__name']}>{orgName}</span>
                <span className={styles['tenant-selector__plan']}>{orgPlan}</span>
              </div>
            </Link>
          ) : (
            <Link href={ROUTES.ORGANIZATION} className={styles['tenant-selector__avatar']} title={orgName} style={{ textDecoration: 'none' }}>
              {orgInitials}
            </Link>
          )}
        </div>
      </aside>

      {/* ============================================
          MAIN CONTENT AREA
          ============================================ */}
      <div className={styles['content-area']}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <div className={styles.topbar__left}>
            <button 
              className={styles.topbar__action}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
            
            <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
              <Link href={ROUTES.DASHBOARD} className={styles['breadcrumb-item']}>Home</Link>
              {paths.map((path, index) => {
                const href = `/${paths.slice(0, index + 1).join('/')}`;
                const isLast = index === paths.length - 1;
                // Basic capitalization for breadcrumb label
                const label = path.charAt(0).toUpperCase() + path.slice(1);
                
                return (
                  <span key={path} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ChevronRight size={14} className={styles['breadcrumb-separator']} />
                    {isLast ? (
                      <span className={cn(styles['breadcrumb-item'], styles['breadcrumb-item--current'])} aria-current="page">
                        {label}
                      </span>
                    ) : (
                      <Link href={href} className={styles['breadcrumb-item']}>{label}</Link>
                    )}
                  </span>
                );
              })}
            </nav>
          </div>

          <div className={styles.topbar__right}>
            <button className={styles['command-trigger']}>
              <Search size={14} />
              <span>Search or command...</span>
              <kbd className={styles['command-trigger__kbd']}>⌘K</kbd>
            </button>

            <Link href="/support" className={styles.topbar__action} aria-label="Support">
              <LifeBuoy size={18} />
            </Link>

            <button 
              className={styles.topbar__action} 
              aria-label="Toggle Theme"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            <button className={styles.topbar__action} aria-label="Notifications">
              <Bell size={18} />
              <span className={styles['topbar__action-badge']} />
            </button>

            <div className="relative">
              <button 
                className={styles['user-menu-trigger']} 
                aria-label="User menu"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                {/* Fallback to initials if no avatar */}
                <span style={{ fontSize: 12, fontWeight: 600 }}>{userInitials}</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl shadow-lg overflow-hidden z-50">
                  <div className="p-3 border-b border-[var(--color-border-subtle)]">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{profile?.full_name || 'User'}</p>
                    <p className="text-xs text-[var(--color-text-muted)] truncate">{profile?.role}</p>
                  </div>
                  <div className="p-1">
                    <Link href="/settings/users" className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-primary)] rounded-lg transition-colors">
                      <User size={14} /> Profile
                    </Link>
                    <button 
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors mt-1"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Scroll Area */}
        <main className={styles.main}>
          <div className={styles.main__inner}>
            {children}
          </div>
        </main>

        {/* Status Bar */}
        <footer className={styles['status-bar']}>
          <div className={styles['status-bar__left']}>
            <div className={styles['status-item']}>
              <span className={cn(styles['status-dot'], styles[`status-dot--${systemHealth}`])} />
              Platform {systemHealth === 'healthy' ? 'Operational' : systemHealth}
            </div>
            <div className={styles['status-item']}>
              <Plug size={12} />
              Voice: Connected
            </div>
            <div className={styles['status-item']}>
              <Users size={12} />
              CRM: Synced
            </div>
            <div className={styles['status-item']}>
              <BookOpen size={12} />
              KB: Synced
            </div>
          </div>
          
          <div className={styles['status-bar__right']}>
            <div className={styles['status-item']}>
              <Activity size={12} />
              {apiLatency}ms API Latency
            </div>
            <div className={styles['status-item']}>
              Last updated: Just now
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
