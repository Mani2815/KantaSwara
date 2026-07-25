'use client';

import React, { useState } from 'react';
import { Search, Bell, LogOut, Sun, Moon, LifeBuoy, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/providers/ThemeProvider';
import Link from 'next/link';
import styles from '@/components/layout/AppShell/AppShell.module.css';

export function Header({ user }: { user: any }) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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
    <header className={styles.topbar}>
      <div className={styles.topbar__left}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href="/superadmin/dashboard" className={styles['breadcrumb-item']}>Platform</Link>
          <span className={styles['breadcrumb-separator']}>/</span>
          <span className={styles['breadcrumb-item--current']}>Overview</span>
        </nav>
      </div>

      <div className={styles.topbar__right}>
        <button className={styles['command-trigger']}>
          <Search size={14} />
          <span>Search or command...</span>
          <kbd className={styles['command-trigger__kbd']}>⌘K</kbd>
        </button>

        <Link href="/superadmin/support" className={styles.topbar__action} aria-label="Support">
          <LifeBuoy size={18} />
        </Link>

        <button className={styles.topbar__action} aria-label="Toggle Theme" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className={styles.topbar__action} aria-label="Notifications">
          <Bell size={18} />
          <span className={styles['topbar__action-badge']} />
        </button>

        <div className="relative">
          <button 
            className={styles['user-menu-trigger']} 
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <span style={{ fontSize: 12, fontWeight: 600 }}>{userInitials}</span>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl shadow-lg overflow-hidden z-50">
              <div className="p-3 border-b border-[var(--color-border-subtle)]">
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{user?.full_name || 'Super Admin'}</p>
                <p className="text-xs text-[var(--color-text-muted)] truncate">{user?.email || 'admin@kantaswara.com'}</p>
              </div>
              <div className="p-1">
                <Link href="/superadmin/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-primary)] rounded-lg transition-colors">
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
  );
}
