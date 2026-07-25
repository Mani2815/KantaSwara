'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

type SupabaseContextValue = {
  supabase: SupabaseClient<Database>;
  user: User | null;
  isLoading: boolean;
};

const SupabaseContext = createContext<SupabaseContextValue | undefined>(undefined);

/**
 * SupabaseProvider — wraps the app with a shared Supabase browser client
 * and listens for real-time auth state changes.
 *
 * Must be rendered inside a Client Component boundary.
 * Place high in the tree (e.g. root layout) but below ThemeProvider.
 */
export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function initUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!ignore) {
        setUser(user);
        setIsLoading(false);
      }
    }
    initUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      ignore = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <SupabaseContext.Provider value={{ supabase, user, isLoading }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase(): SupabaseContextValue {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within <SupabaseProvider>');
  }
  return context;
}
