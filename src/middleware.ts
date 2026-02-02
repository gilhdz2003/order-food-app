/**
 * Next.js Middleware
 *
 * Handles authentication and route protection
 *
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs?router=app
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Protected routes that require authentication
 */
const PROTECTED_ROUTES = ['/admin', '/editor', '/employee', '/comanda'];

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = ['/', '/login', '/auth/callback'];

/**
 * Route to role mapping
 */
const ROLE_ROUTES: Record<string, string[]> = {
  '/admin': ['admin'],
  '/editor': ['editor_menu', 'admin'],
  '/employee': ['empleado', 'admin'],
  '/comanda': ['comanda_user', 'admin'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Create Supabase client
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

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Redirect to login if no session
  if (!session) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Get user role from database
  const { data: user } = await supabase
    .from('users')
    .select('role, is_active')
    .eq('id', session.user.id)
    .single();

  // Redirect to login if user not found in database
  if (!user) {
    const redirectUrl = new URL('/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect to login if user is not active
  if (!user.is_active) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('error', 'account_inactive');
    return NextResponse.redirect(redirectUrl);
  }

  // Check role-based access
  for (const [route, allowedRoles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(route) && !allowedRoles.includes(user.role)) {
      // User doesn't have required role, redirect to their dashboard
      const dashboardRoute = getDashboardForRole(user.role);
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
