'use client';

import React, { useState } from 'react';
import { Search, Bell, LogOut, Sun, Moon, LifeBuoy, User, X, AlertTriangle, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/providers/ThemeProvider';
import Link from 'next/link';
import styles from '@/components/layout/AppShell/AppShell.module.css';

const NOTIFICATIONS = [
  { id: 1, type: 'warning', title: 'SLA Warning: Acme Corp', time: '10m ago', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 2, type: 'error', title: 'Knowledge Processing Failed', time: '1h ago', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  { id: 3, type: 'success', title: 'Global Tech Deployment Ready', time: '2h ago', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 4, type: 'info', title: 'New Change Request', time: '5h ago', icon: RefreshCw, color: 'text-blue-500', bg: 'bg-blue-500/10' },
];

export function Header({ user }: { user: any }) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = await createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const getInitials = (name: string | undefined | null, fallback: string) => {
    if (!name) return fallback;
    const parts = name.trim().split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const userInitials = getInitials(user?.full_name, 'SA');

  return (
    <>
      <header className={styles.topbar}>
        <div className={styles.topbar__left}>
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link href="/delivery-console" className={styles['breadcrumb-item']}>Delivery Console</Link>
            <span className={styles['breadcrumb-separator']}>/</span>
            <span className={styles['breadcrumb-item--current']}>Overview</span>
          </nav>
        </div>

        <div className={styles.topbar__right}>
          <button className={styles['command-trigger']} onClick={() => setSearchOpen(true)}>
            <Search size={14} />
            <span>Search projects, agents, orgs...</span>
            <kbd className={styles['command-trigger__kbd']}>⌘K</kbd>
          </button>

          <Link href="/delivery-console/support" className={styles.topbar__action} aria-label="Support">
            <LifeBuoy size={18} />
          </Link>

          <button className={styles.topbar__action} aria-label="Toggle Theme" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="relative">
            <button className={styles.topbar__action} aria-label="Notifications" onClick={() => { setNotificationsOpen(!notificationsOpen); setUserMenuOpen(false); }}>
              <Bell size={18} />
              <span className={styles['topbar__action-badge']} />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl shadow-lg overflow-hidden z-50">
                <div className="p-3 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Notifications</h3>
                  <button onClick={() => setNotificationsOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                    <X size={14} />
                  </button>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {NOTIFICATIONS.map(notif => (
                    <div key={notif.id} className="p-3 border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-subtle)] transition-colors cursor-pointer flex gap-3">
                      <div className={`w-8 h-8 rounded-full ${notif.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <notif.icon size={14} className={notif.color} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">{notif.title}</p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1">{notif.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 bg-[var(--color-bg-base)] text-center border-t border-[var(--color-border-subtle)]">
                  <span className="text-xs text-[#ff6600] font-medium cursor-pointer hover:underline">Mark all as read</span>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button 
              className={styles['user-menu-trigger']} 
              onClick={() => { setUserMenuOpen(!userMenuOpen); setNotificationsOpen(false); }}
            >
              <span style={{ fontSize: 12, fontWeight: 600 }}>{userInitials}</span>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl shadow-lg overflow-hidden z-50">
                <div className="p-3 border-b border-[var(--color-border-subtle)]">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{user?.full_name || 'Solutions Admin'}</p>
                  <p className="text-xs text-[var(--color-text-muted)] truncate">{user?.email || 'admin@kantaswara.com'}</p>
                </div>
                <div className="p-1">
                  <Link href="/delivery-console/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-primary)] rounded-lg transition-colors">
                    <User size={14} /> Profile
                  </Link>
                  <button 
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleSignOut();
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

      {/* Global Search Modal Mockup */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-32 bg-black/50 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
          <div className="w-full max-w-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-2xl rounded-xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center px-4 py-3 border-b border-[var(--color-border-default)]">
              <Search size={18} className="text-[var(--color-text-muted)] mr-3" />
              <input 
                autoFocus
                type="text"
                placeholder="Search across organizations, projects, agents, or deployments..."
                className="flex-1 bg-transparent border-none text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none text-base"
              />
              <kbd className="hidden sm:inline-flex px-2 py-1 text-xs font-medium text-[var(--color-text-muted)] bg-[var(--color-bg-subtle)] rounded border border-[var(--color-border-subtle)]">
                ESC
              </kbd>
            </div>
            <div className="p-2 max-h-[400px] overflow-y-auto">
              <div className="px-3 py-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Recent Searches
              </div>
              <div className="px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[#ff6600]/10 hover:text-[#ff6600] rounded-lg cursor-pointer flex items-center gap-3 transition-colors">
                <Search size={14} className="text-[var(--color-text-muted)]" />
                <span>Acme Corp Project (PRJ-8422)</span>
              </div>
              <div className="px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[#ff6600]/10 hover:text-[#ff6600] rounded-lg cursor-pointer flex items-center gap-3 transition-colors">
                <Search size={14} className="text-[var(--color-text-muted)]" />
                <span>Global Tech Deployments</span>
              </div>
              <div className="px-3 py-2 mt-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Quick Filters
              </div>
              <div className="flex flex-wrap gap-2 px-3 py-2">
                <span className="px-2.5 py-1 text-xs font-medium bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] rounded-md text-[var(--color-text-secondary)] hover:border-[#ff6600] hover:text-[#ff6600] cursor-pointer">/projects</span>
                <span className="px-2.5 py-1 text-xs font-medium bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] rounded-md text-[var(--color-text-secondary)] hover:border-[#ff6600] hover:text-[#ff6600] cursor-pointer">/agents</span>
                <span className="px-2.5 py-1 text-xs font-medium bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] rounded-md text-[var(--color-text-secondary)] hover:border-[#ff6600] hover:text-[#ff6600] cursor-pointer">/deployments</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

