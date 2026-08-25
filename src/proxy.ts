import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js Middleware — runs on every matched request.
 *
 * Responsibilities:
 * 1. Refresh Supabase session cookies (keep user logged in)
 * 2. Redirect unauthenticated users to /login for protected routes
 * 3. Redirect authenticated users away from auth pages to /dashboard
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Update session and get current user
  const { response, user, supabase } = await updateSession(request);


  // ─── Auth Routes ───────────────────────────────────────────────────────────
  const externalAuthRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const internalAuthRoutes = ['/console/login', '/console/forgot-password', '/console/reset-password', '/console/activate-account'];
  
  const isExternalAuthRoute = externalAuthRoutes.some((route) => pathname.startsWith(route) && !pathname.includes('/pending-approval'));
  const isInternalAuthRoute = internalAuthRoutes.some((route) => pathname.startsWith(route));

  // ─── Protected Routes ──────────────────────────────────────────────────────
  const isConsoleRoute = pathname.startsWith('/console') || pathname.startsWith('/superadmin') || pathname.startsWith('/delivery-console');
  const isPlatformRoute = pathname.startsWith('/dashboard') || 
                          pathname.startsWith('/agents') || 
                          pathname.startsWith('/workflows') || 
                          pathname.startsWith('/calls') || 
                          pathname.startsWith('/knowledge') || 
                          pathname.startsWith('/leads') || 
                          pathname.startsWith('/analytics') || 
                          pathname.startsWith('/settings');

  // Handle Unauthenticated
  if (!user) {
    if (isConsoleRoute && !isInternalAuthRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/console/login';
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    if (isPlatformRoute && !isExternalAuthRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  // Handle Authenticated Users
  let isEmployee = user.app_metadata?.is_employee === true || 
                   user.app_metadata?.is_employee === 'true' || 
                   user.app_metadata?.user_type === 'INTERNAL';
                   
  let employeeRole = user.app_metadata?.employee_role;
  let employeeStatus = user.app_metadata?.employee_status || user.app_metadata?.account_status;

  // Fallback if JWT hook hasn't populated employee data (e.g. stale token)
  if (!isEmployee && (user.app_metadata?.is_employee === undefined && user.app_metadata?.user_type === undefined)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile && ['super_admin', 'solutions_admin', 'support_admin'].includes(profile.role)) {
      isEmployee = true;
      employeeRole = profile.role === 'super_admin' ? 'SUPER_ADMIN' : 
                     profile.role === 'solutions_admin' ? 'AI_SOLUTIONS_ADMIN' : 'SUPPORT_ADMIN';
      employeeStatus = 'ACTIVE';
    }
  }

  if (isEmployee) {

    if (employeeStatus !== 'ACTIVE') {
      if (!isInternalAuthRoute) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/console/login';
        redirectUrl.searchParams.set('error', 'account_disabled');
        return NextResponse.redirect(redirectUrl);
      }
      return response;
    }

    // Block internal users from accessing external routes
    if (isPlatformRoute || isExternalAuthRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/superadmin/dashboard';
      if (employeeRole === 'AI_SOLUTIONS_ADMIN') redirectUrl.pathname = '/delivery-console';
      else if (employeeRole === 'SUPPORT_ADMIN') redirectUrl.pathname = '/support-console'; // Assuming fallback
      return NextResponse.redirect(redirectUrl);
    }

    if (pathname === '/console' || isInternalAuthRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/superadmin/dashboard';
      if (employeeRole === 'AI_SOLUTIONS_ADMIN') redirectUrl.pathname = '/delivery-console';
      else if (employeeRole === 'SUPPORT_ADMIN') redirectUrl.pathname = '/support-console';
      return NextResponse.redirect(redirectUrl);
    }

    // Role-based protection for internal routes
    if (pathname.startsWith('/superadmin') && employeeRole !== 'SUPER_ADMIN') {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/console/login'; // or an unauthorized page
      return NextResponse.redirect(redirectUrl);
    }
    if (pathname.startsWith('/delivery-console') && employeeRole !== 'AI_SOLUTIONS_ADMIN') {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/console/login';
      return NextResponse.redirect(redirectUrl);
    }

  } else {
    // EXTERNAL User
    let orgId = user.app_metadata?.organization_id;
    let orgStatus = user.app_metadata?.organization_status;
    const accountStatus = user.app_metadata?.account_status || 'ACTIVE';

    if (accountStatus !== 'ACTIVE') {
      if (!isExternalAuthRoute) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/login';
        redirectUrl.searchParams.set('error', 'account_disabled');
        return NextResponse.redirect(redirectUrl);
      }
      return response;
    }

    // Block external users from accessing internal routes
    if (isConsoleRoute) {
      return new NextResponse(null, { status: 403, statusText: 'Forbidden' });
    }

    // If JWT hook hasn't populated org data, fall back to a DB lookup.
    // This handles cases where the Supabase hook is not yet enabled or the
    // token was issued before the hook was installed.
    if (!orgId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id, organizations!inner(status, approval_status)')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.organization_id) {
        orgId = profile.organization_id;
        const org = profile.organizations as any;
        // Prefer approval_status if explicitly set, fall back to status
        orgStatus = org?.approval_status || org?.status;
      }
    }

    if (!orgId) {
      if (isPlatformRoute) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/register';
        return NextResponse.redirect(redirectUrl);
      }
    } else {
      const APPROVED_STATUSES = ['approved', 'APPROVED', 'active', 'ACTIVE'];
      const PENDING_STATUSES = ['pending', 'pending_approval', 'PENDING_APPROVAL'];
      const isPending = orgStatus
        ? PENDING_STATUSES.includes(orgStatus)
        : !APPROVED_STATUSES.includes(orgStatus ?? '');

      if (isPending) {
        if (isPlatformRoute || isExternalAuthRoute) {
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname = '/pending-approval';
          return NextResponse.redirect(redirectUrl);
        }
      } else {
        if (isExternalAuthRoute) {
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname = '/dashboard';
          return NextResponse.redirect(redirectUrl);
        }
      }
    }
  }

  return response;
}


export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - Public files in /public folder (fonts, images, etc.)
     * - API routes that handle their own auth
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|fonts/|images/|icons/|api/).*)',
  ],
};
