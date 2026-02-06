/**
 * Auth Callback Route
 *
 * Handles OAuth callback from Google
 * Creates or updates user in database
 */

import { createClient } from '@/lib/supabase/server';
import { upsertUser } from '@/lib/supabase/actions';
import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(
        new URL('/login?error=oauth_failed', request.url)
      );
    }

    if (data.user) {
      // Create or update user in database
      const { error: upsertError } = await upsertUser(
        data.user.email!,
        data.user.user_metadata?.full_name || data.user.user_metadata?.name,
        data.user.id
      );

      if (upsertError) {
        console.error('Error upserting user:', upsertError);
      }
    }
  }

  // Redirect to the appropriate dashboard
  // The middleware will handle role-based redirection
  return NextResponse.redirect(new URL('/', request.url));
}
