/**
 * Supabase Server Client Proxy
 * Exports createClient from @server/lib/supabase/server
 * to ensure compatibility with imports pointing to @/lib/supabase/server.
 */
export { createClient } from '@server/lib/supabase/server';
