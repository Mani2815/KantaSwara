'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Building2, 
  CreditCard, 
  Users, 
  Server, 
  ShieldCheck, 
  LifeBuoy, 
  Settings, 
  Megaphone,
  ClipboardList,
  Receipt
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Logo } from '@/components/common/Logo';
import styles from '@/components/layout/AppShell/AppShell.module.css';

const NAV_ITEMS = [
  { name: 'Platform Overview', href: '/superadmin/dashboard', icon: LayoutDashboard },
  { name: 'Organizations', href: '/superadmin/organizations', icon: Building2 },
  { name: 'Agent Requests', href: '/superadmin/requests', icon: ClipboardList },
  { name: 'Quotations', href: '/superadmin/quotations', icon: ClipboardList },
  { name: 'Subscriptions', href: '/superadmin/subscriptions', icon: CreditCard },
  { name: 'Invoices', href: '/superadmin/invoices', icon: Receipt },
  { name: 'User Directory', href: '/superadmin/users', icon: Users },
  { name: 'Internal Admins', href: '/superadmin/admins', icon: ShieldCheck },
  { name: 'Infrastructure', href: '/superadmin/infrastructure', icon: Server },
  { name: 'Security & Audit', href: '/superadmin/security', icon: ShieldCheck },
  { name: 'Support', href: '/superadmin/support', icon: LifeBuoy },
  { name: 'System Config', href: '/superadmin/settings', icon: Settings },
  { name: 'Announcements', href: '/superadmin/announcements', icon: Megaphone },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebar__header}>
        <Link href="/superadmin/dashboard" className={styles.sidebar__brand}>
          <Logo className="h-11 md:h-12 w-auto text-[#ff6600]" />
        </Link>
      </div>
      
      <nav className={styles.sidebar__nav} aria-label="Main Navigation">
        <div className={styles['nav-group']}>
          <div className={styles['nav-group__label']}>Administration</div>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(styles['nav-item'], isActive && styles['nav-item--active'])}
              >
                <item.icon className={styles['nav-item__icon']} />
                <span className={styles['nav-item__label']}>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      
      <div className={styles.sidebar__footer}>
        <Link href="/superadmin/infrastructure" className={styles['tenant-selector']} style={{ textDecoration: 'none' }}>
          <div className={styles['tenant-selector__avatar']}>SA</div>
          <div className={styles['tenant-selector__info']}>
            <span className={styles['tenant-selector__name']}>Super Admin</span>
            <span className={styles['tenant-selector__plan']}>All systems operational</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
