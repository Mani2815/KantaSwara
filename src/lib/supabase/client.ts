import type { Database } from '@/types/supabase';
import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser-side Supabase client.
 * Safe to use in Client Components, hooks, and event handlers.
 * Singleton pattern — only one instance created per browser session.
 */
let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (client) return client;

  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return client;
}
