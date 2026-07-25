'use client';

import { Menu } from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';
import { ProfileMenu } from './ProfileMenu';
import { CommandPalette } from './CommandPalette';
import { NotificationCenter } from './NotificationCenter';
import { MobileNav } from '../sidebar/MobileNav';

export function GlobalHeader() {
  return (
    <header className="h-14 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-30">
      
      {/* Left section: Mobile menu & Breadcrumbs */}
      <div className="flex items-center gap-4 flex-1">
        <MobileNav />
        <Breadcrumbs />
      </div>

      {/* Right section: Search, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Command Palette Trigger */}
        <CommandPalette />

        {/* Notifications */}
        <NotificationCenter />

        <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-800 mx-1" />

        <ProfileMenu />
      </div>
    </header>
  );
}
