/**
 * Next.js Middleware
 *
 * Handles authentication and route protection
 *
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs?router=app
 */

import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Route to role mapping
 */
const ROLE_ROUTES: Record<string, string[]> = {
  '/admin': ['admin'],
  '/editor': ['editor_menu', 'admin'],
  '/employee': ['empleado', 'admin'],
  '/comanda': ['comanda_user', 'admin'],
};

// Admin client singleton (created once, reused)
let adminClientInstance: ReturnType<typeof createSupabaseClient> | null = null;

/**
 * Get admin client for RLS bypass operations
 */
function getAdminClient() {
  if (!adminClientInstance) {
    adminClientInstance = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }
  return adminClientInstance;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth/callback (OAuth handler)
  if (pathname.startsWith('/auth/callback')) {
    return NextResponse.next();
  }

  // Create Supabase client for auth check
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Get user session using getUser() for security (validates with server)
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  // Special handling for home page (/)
  if (pathname === '/') {
    if (user && !userError) {
      // Use admin client to bypass RLS when checking user role
      const adminClient = getAdminClient();
      const { data: userData } = await adminClient
        .from('users')
        .select('role, is_active')
        .eq('id', user.id)
        .single();

      if (userData && userData.is_active) {
        const dashboardRoute = getDashboardForRole(userData.role);
        return NextResponse.redirect(new URL(dashboardRoute, request.url));
      }
    }
    // No session or inactive user - show landing page
    return NextResponse.next();
  }

  // Allow login page without auth
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // Redirect to login if no session (for protected routes)
  if (!user || userError) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Use admin client to bypass RLS when getting user role
  const adminClient = getAdminClient();
  const { data: userData } = await adminClient
    .from('users')
    .select('role, is_active')
    .eq('id', user.id)
    .single();

  // Redirect to login if user not found in database
  if (!userData) {
    const redirectUrl = new URL('/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect to login if user is not active
  if (!userData.is_active) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('error', 'account_inactive');
    return NextResponse.redirect(redirectUrl);
  }

  // Check role-based access
  for (const [route, allowedRoles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(route) && !allowedRoles.includes(userData.role)) {
      // User doesn't have required role, redirect to their dashboard
      const dashboardRoute = getDashboardForRole(userData.role);
      return NextResponse.redirect(new URL(dashboardRoute, request.url));
    }
  }

  return response;
}

/**
 * Get dashboard route for user role
 */
function getDashboardForRole(role: string): string {
  const dashboards: Record<string, string> = {
    admin: '/admin',
    editor_menu: '/editor',
    empleado: '/employee',
    comanda_user: '/comanda',
  };
  return dashboards[role] || '/employee';
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
