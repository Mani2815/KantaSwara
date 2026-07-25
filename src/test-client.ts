import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

async function run() {
  const supabase = {} as SupabaseClient<Database>;
  const q = await supabase.from('profiles').select('role').single();
  console.log(q.data?.role);
}
