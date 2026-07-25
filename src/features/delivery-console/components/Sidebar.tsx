'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Inbox, 
  FolderKanban,
  Bot,
  Library,
  Workflow,
  Brain,
  TestTube,
  ShieldCheck,
  Rocket, 
  Users, 
  Wrench,
  BarChart
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Logo } from '@/components/common/Logo';
import styles from '@/components/layout/AppShell/AppShell.module.css';

const NAVIGATION = [
  { name: 'Overview', href: '/delivery-console', icon: LayoutDashboard },
  { name: 'Agent Requests', href: '/delivery-console/requests', icon: Inbox },
  { name: 'Projects', href: '/delivery-console/projects', icon: FolderKanban },
  { name: 'AI Agent Builder', href: '/delivery-console/builder', icon: Bot },
  { name: 'Prompt Library', href: '/delivery-console/library/prompts', icon: Library },
  { name: 'Workflow Templates', href: '/delivery-console/library/workflows', icon: Workflow },
  { name: 'Knowledge Config', href: '/delivery-console/knowledge', icon: Brain },
  { name: 'Testing', href: '/delivery-console/testing', icon: TestTube },
  { name: 'QA Center', href: '/delivery-console/qa', icon: ShieldCheck },
  { name: 'Deployments', href: '/delivery-console/deployments', icon: Rocket },
  { name: 'Assignments', href: '/delivery-console/assignments', icon: Users },
  { name: 'Maintenance', href: '/delivery-console/maintenance', icon: Wrench },
  { name: 'Reports', href: '/delivery-console/reports', icon: BarChart },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebar__header}>
        <Link href="/delivery-console" className={styles.sidebar__brand}>
          <Logo className="h-11 md:h-12 w-auto text-[#ff6600]" />
        </Link>
      </div>
      
      <nav className={styles.sidebar__nav} aria-label="Main Navigation">
        <div className={styles['nav-group']}>
          <div className={styles['nav-group__label']}>Delivery Console</div>
          {NAVIGATION.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/delivery-console' && pathname.startsWith(item.href));
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
        <Link href="/delivery-console/projects" className={styles['tenant-selector']} style={{ textDecoration: 'none' }}>
          <div className={styles['tenant-selector__avatar']}>
            <Rocket size={16} />
          </div>
          <div className={styles['tenant-selector__info']}>
            <span className={styles['tenant-selector__name']}>Delivery Workspace</span>
            <span className={styles['tenant-selector__plan']}>Solutions Admin</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
