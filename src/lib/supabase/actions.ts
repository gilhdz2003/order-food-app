'use server';

/**
 * Authentication Server Actions
 *
 * Server-side functions for authentication operations
 */

import { revalidatePath } from 'next/cache';
import { createClient, createAdminClient } from './server';
import type { User } from '@/types';

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('Error signing in with Google:', error);
    return { error: error.message };
  }

  return { data };
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmail(email: string, password: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Error signing in with email:', error);
    return { error: error.message };
  }

  // Get auth user ID
  const authUserId = data.user?.id;
  if (!authUserId) {
    return { error: 'Error al obtener el usuario de autenticación.' };
  }

  // Check if user exists in our users table
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (userError || !user) {
    // User doesn't exist in users table - create it using service_role (bypass RLS)
    console.log('Usuario no encontrado en tabla users, creando automáticamente...');

    // Create a client with service_role to bypass RLS
    const supabaseAdmin = await createAdminClient();

    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authUserId, // Use the same ID as auth.users
        email,
        full_name: data.user?.user_metadata?.full_name || data.user?.user_metadata?.name || email.split('@')[0],
        phone: data.user?.user_metadata?.phone || null,
        role: 'empleado', // Default role
        company_id: null, // Admin needs to assign
        is_active: true,
      })
      .select()
      .single();

    if (createError || !newUser) {
      console.error('Error creating user:', createError);
      return { error: 'Error al crear usuario. Contacta al administrador.' };
    }

    revalidatePath('/', 'layout');
    return { data, user: newUser };
  }

  if (!user.is_active) {
    return { error: 'Tu cuenta está inactiva. Contacta al administrador.' };
  }

  revalidatePath('/', 'layout');
  return { data, user };
}

/**
 * Sign out
 */
export async function signOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error signing out:', error);
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  const { data: user, error } = await supabase
    .from('users')
    .select(`
      *,
      company:companies(*)
    `)
    .eq('id', session.user.id)
    .single();

  if (error || !user) {
    console.error('Error fetching user:', error);
    return null;
  }

  return user as User;
}

/**
 * Get user session
 */
export async function getSession() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
}

/**
 * Create or update user after OAuth callback
 * This is called by the auth callback route
 */
export async function upsertUser(email: string, fullName?: string) {
  const supabase = await createClient();

  // Check if user exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (existingUser) {
    // Update user
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        full_name: fullName || existingUser.full_name,
        updated_at: new Date().toISOString(),
      })
      .eq('email', email)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return { error: error.message };
    }

    return { user: updatedUser };
  }

  // Create new user (default role: empleado)
  // Note: Company needs to be set by admin
  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      email,
      full_name: fullName || null,
      role: 'empleado',
      company_id: null,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    return { error: error.message };
  }

  return { user: newUser };
}

/**
 * Check if user has required role
 */
export async function hasRole(requiredRoles: string[]): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  return requiredRoles.includes(user.role);
}

/**
 * Require authentication - throw error if not authenticated
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

/**
 * Require specific role - throw error if user doesn't have required role
 */
export async function requireRole(requiredRoles: string[]): Promise<User> {
  const user = await requireAuth();

  if (!requiredRoles.includes(user.role)) {
    throw new Error('Forbidden');
  }

  return user;
}
