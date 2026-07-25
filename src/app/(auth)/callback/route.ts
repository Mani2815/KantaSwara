import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@server/lib/supabase/server';

/**
 * Auth Callback Route Handler
 *
 * Handles:
 * 1. Email verification (PKCE flow)
 * 2. Password reset links
 * 3. OAuth callbacks (if enabled later)
 *
 * Supabase sends the user here after they click a link in their email.
 * The `code` query param is exchanged for a session.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';
  const type = searchParams.get('type');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Password reset: redirect to the reset page
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/reset-password`);
      }

      // Check for pending organization signup
      const pendingOrgName = request.cookies.get('pending_org_name')?.value;
      
      if (pendingOrgName) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Check if profile already exists to prevent duplicate creation
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();

          if (!existingProfile) {
            const { supabaseAdmin } = await import('@server/lib/supabase/admin');
            
            // Create slug
            const baseSlug = pendingOrgName
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '')
              .substring(0, 50);

            let orgSlug = baseSlug;
            let slugCount = 1;
            
            // Basic conflict resolution loop
            while (true) {
              const { data: existingOrg } = await supabaseAdmin
                .from('organizations')
                .select('id')
                .eq('slug', orgSlug)
                .single();
                
              if (!existingOrg) break;
              orgSlug = `${baseSlug}-${slugCount}`;
              slugCount++;
            }

            // Insert organization (inactive pending approval)
            const { data: orgData, error: orgError } = await supabaseAdmin
              .from('organizations')
              .insert({
                name: pendingOrgName,
                slug: orgSlug,
                is_active: false,
              })
              .select('id')
              .single();

            if (orgData) {
              // Insert org_settings
              await supabaseAdmin
                .from('org_settings')
                .insert({ organization_id: orgData.id });

              // Insert profile
              await supabaseAdmin
                .from('profiles')
                .insert({
                  id: user.id,
                  organization_id: orgData.id,
                  full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                  email: user.email,
                  role: 'org_admin',
                });
            } else {
              console.error('Failed to create organization from pending cookie', orgError);
            }
          }
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      let response;
      if (isLocalEnv) {
        response = NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        response = NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        response = NextResponse.redirect(`${origin}${next}`);
      }

      // Clear the pending org cookie if it existed
      if (pendingOrgName) {
        response.cookies.delete('pending_org_name');
      }

      return response;
    }
  }

  // Code missing or exchange failed — redirect to error page
  return NextResponse.redirect(
    `${origin}/login?error=auth_callback_failed`
  );
}
