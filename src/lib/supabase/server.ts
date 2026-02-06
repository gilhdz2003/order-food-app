/**
 * Supabase Client for Server Components
 *
 * This creates a Supabase client for use in Server Components, Route Handlers,
 * and Server Actions.
 *
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs?router=app
 */

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types';

// Global admin client singleton (created once, reused)
let adminClientInstance: ReturnType<typeof createSupabaseClient<Database>> | null = null;

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if we have middleware refreshing user sessions.
          }
        },
      },
    }
  );
}

/**
 * Supabase Admin Client with service_role (bypasses RLS)
 *
 * Use this for operations that require elevated permissions,
 * such as creating users when the current user doesn't have INSERT permissions.
 *
 * IMPORTANT: This uses @supabase/supabase-js directly (NOT SSR) to completely
 * bypass RLS. The SSR client always applies user context even with service_role.
 */
export async function createAdminClient(serviceRoleKey?: string) {
  // Use singleton pattern for admin client
  if (!adminClientInstance) {
    adminClientInstance = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          // No session storage for admin client - it bypasses all auth checks
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }

  return adminClientInstance;
}
