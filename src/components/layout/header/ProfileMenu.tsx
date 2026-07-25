'use client';

import { LogOut, User, Settings, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function ProfileMenu() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = await createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-orange-300 flex items-center justify-center text-white font-semibold shadow-sm">
          JD
        </div>
      </button>

      {/* Dropdown Menu - Simple CSS hover based for now until Radix/Shadcn is fully added */}
      <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-[#1A1A1A] border border-neutral-200 dark:border-neutral-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
        <div className="p-3 border-b border-neutral-200 dark:border-neutral-800">
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">John Doe</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">john@acmecorp.com</p>
        </div>
        
        <div className="p-1">
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors text-left">
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors text-left">
            <Settings className="w-4 h-4" />
            <span>Preferences</span>
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors text-left">
            <CreditCard className="w-4 h-4" />
            <span>Billing</span>
          </button>
        </div>

        <div className="p-1 border-t border-neutral-200 dark:border-neutral-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
