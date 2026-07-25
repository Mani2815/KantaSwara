import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

/**
 * Service-role admin Supabase client.
 *
 * ⚠️  SERVER-ONLY — Never import in Client Components or expose to the browser.
 *     This client bypasses Row Level Security (RLS).
 *
 * Use cases:
 * - Creating user profiles during registration
 * - Admin operations (Super Admin actions)
 * - Background jobs and cron tasks
 * - Verifying JWTs in the NestJS backend
 */
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
