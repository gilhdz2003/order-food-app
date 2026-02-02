/**
 * Supabase Client for Browser/Client Components
 *
 * This is the singleton Supabase client for use in browser environments
 * and React Client Components.
 *
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs?router=app
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Singleton instance for client components
 * Use this for direct access in client components
 */
export const supabase = createClient();
