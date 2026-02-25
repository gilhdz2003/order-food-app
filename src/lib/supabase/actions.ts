'use server';

/**
 * Authentication Server Actions
 *
 * Server-side functions for authentication operations
 */

import { revalidatePath } from 'next/cache';
import { createClient, createAdminClient } from './server';
import { canEditOrder } from '@/lib/utils/order';
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

  // Use admin client to bypass RLS when checking user
  const supabaseAdmin = await createAdminClient();

  // First, try to find user by ID (most common case)
  const { data: userById } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', authUserId)
    .single();

  if (userById) {
    if (!userById.is_active) {
      return { error: 'Tu cuenta está inactiva. Contacta al administrador.' };
    }
    revalidatePath('/', 'layout');
    return { data, user: userById };
  }

  // User not found by ID, check by email (in case IDs don't match from seed data)
  const { data: userByEmail } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (userByEmail) {
    // Update the user ID to match auth.users
    await supabaseAdmin
      .from('users')
      .update({ id: authUserId })
      .eq('email', email);

    if (!userByEmail.is_active) {
      return { error: 'Tu cuenta está inactiva. Contacta al administrador.' };
    }
    revalidatePath('/', 'layout');
    return { data, user: { ...userByEmail, id: authUserId } };
  }

  // User doesn't exist - create it using service_role (bypass RLS)
  console.log('Usuario no encontrado en tabla users, creando automáticamente...');

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

  // Use admin client to bypass RLS when fetching user
  const supabaseAdmin = await createAdminClient();

  const { data: user, error } = await supabaseAdmin
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
export async function upsertUser(email: string, fullName?: string, authUserId?: string) {
  // Use admin client to bypass RLS
  const supabaseAdmin = await createAdminClient();

  // Check if user exists by email
  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (existingUser) {
    // Update user and sync ID if provided
    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update({
        full_name: fullName || existingUser.full_name,
        updated_at: new Date().toISOString(),
        ...(authUserId && { id: authUserId }),
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
  const { data: newUser, error } = await supabaseAdmin
    .from('users')
    .insert({
      id: authUserId,
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

// ============================================================================
// MENU SERVER ACTIONS
// ============================================================================

/**
 * Publish a menu
 */
export async function publishMenu(menuId: string) {
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from('menus')
    .update({ is_published: true, published_at: new Date().toISOString() })
    .eq('id', menuId);

  if (error) {
    console.error('Error publishing menu:', error);
    return { error: error.message };
  }

  revalidatePath('/editor', 'page');
  return { success: true };
}

/**
 * Unpublish a menu
 */
export async function unpublishMenu(menuId: string) {
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from('menus')
    .update({ is_published: false, published_at: null })
    .eq('id', menuId);

  if (error) {
    console.error('Error unpublishing menu:', error);
    return { error: error.message };
  }

  revalidatePath('/editor', 'page');
  return { success: true };
}

// ============================================================================
// ORDER SERVER ACTIONS
// ============================================================================

/**
 * Generate unique 8-character order code
 */
function generateOrderCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 for clarity
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Validate order creation rules
 */
interface ValidationResult {
  valid: boolean;
  error?: string;
}

async function validateOrderCreation(userId: string, companyId: string): Promise<ValidationResult> {
  const supabase = await createAdminClient();

  // Get today's date in Mexico City timezone
  const today = new Date();
  const mexicoCityOffset = 6; // UTC-6 (standard time)
  const localDate = new Date(today.getTime() - mexicoCityOffset * 60 * 60 * 1000);
  const todayStr = localDate.toISOString().split('T')[0];

  // Check 1: No order today for this user
  const { data: existingOrder } = await supabase
    .from('orders')
    .select('id, order_code')
    .eq('user_id', userId)
    .gte('created_at', todayStr)
    .single();

  if (existingOrder) {
    return {
      valid: false,
      error: `Ya tienes un pedido para hoy: ${existingOrder.order_code}`,
    };
  }

  // Check 2: Max 5 orders this week
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const { data: weekOrders, error: weekError } = await supabase
    .from('orders')
    .select('id')
    .eq('user_id', userId)
    .gte('created_at', weekAgo.toISOString());

  if (!weekError && weekOrders && weekOrders.length >= 5) {
    return {
      valid: false,
      error: 'Alcanzaste el límite de 5 pedidos esta semana. Intenta la próxima.',
    };
  }

  return { valid: true };
}

/**
 * Create order with items (atomic transaction using RPC)
 */
export async function createOrder(
  menuId: string,
  items: Array<{ dish_id: string; quantity: number }>
) {
  const user = await requireAuth();

  if (!user.company_id) {
    return { error: 'No tienes empresa asignada. Contacta al administrador.' };
  }

  // Validate order creation rules
  const validation = await validateOrderCreation(user.id, user.company_id);
  if (!validation.valid) {
    return { error: validation.error };
  }

  const supabase = await createAdminClient();

  // First, validate all items have availability
  for (const item of items) {
    const { data: dish } = await supabase
      .from('dishes')
      .select('id, name, available_quantity')
      .eq('id', item.dish_id)
      .single();

    if (!dish) {
      return { error: `Platillo no encontrado: ${item.dish_id}` };
    }

    if (dish.available_quantity < item.quantity) {
      return {
        error: `${dish.name} solo tiene ${dish.available_quantity} disponibles. Solicitaste: ${item.quantity}`,
      };
    }
  }

  try {
    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        menu_id: menuId,
        company_id: user.company_id,
        order_code: generateOrderCode(),
        status: 'pendiente',
        total_amount: 0, // Will be calculated below
        can_edit: true,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Error creating order:', orderError);
      return { error: 'Error al crear el pedido. Por favor intenta de nuevo.' };
    }

    // Create order items and calculate total
    let totalAmount = 0;
    const orderItemsToInsert = [];

    for (const item of items) {
      const { data: dish } = await supabase
        .from('dishes')
        .select('price')
        .eq('id', item.dish_id)
        .single();

      if (!dish) {
        throw new Error(`Dish not found: ${item.dish_id}`);
      }

      const itemTotal = dish.price * item.quantity;
      totalAmount += itemTotal;

      orderItemsToInsert.push({
        order_id: order.id,
        dish_id: item.dish_id,
        quantity: item.quantity,
        price_at_order: dish.price,
      });

      // Decrement availability
      const { error: updateError } = await supabase
        .from('dishes')
        .update({
          available_quantity: supabase.rpc('available_quantity')?.minus(item.quantity) || 0,
        })
        .eq('id', item.dish_id)
        .gt('available_quantity', item.quantity - 1);

      if (updateError) {
        throw new Error(`Failed to update availability for dish: ${item.dish_id}`);
      }
    }

    // Insert order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert);

    if (itemsError) {
      throw new Error('Failed to create order items');
    }

    // Update order total
    const { error: totalError } = await supabase
      .from('orders')
      .update({ total_amount: totalAmount })
      .eq('id', order.id);

    if (totalError) {
      throw new Error('Failed to update order total');
    }

    revalidatePath('/employee', 'layout');
    revalidatePath('/employee/orders', 'page');

    return {
      success: true,
      order: { ...order, total_amount: totalAmount },
    };
  } catch (error) {
    console.error('Unexpected error creating order:', error);
    return { error: 'Error al crear el pedido. Por favor intenta de nuevo.' };
  }
}

/**
 * Get today's menu with dishes
 */
export async function getTodayMenu() {
  const supabase = await createClient();

  // Get today's date in Mexico City timezone
  const today = new Date();
  const mexicoCityOffset = 6;
  const localDate = new Date(today.getTime() - mexicoCityOffset * 60 * 60 * 1000);
  const todayStr = localDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('menus')
    .select(`
      *,
      dishes (*)
    `)
    .eq('menu_date', todayStr)
    .eq('is_published', true)
    .single();

  if (error) {
    console.error('Error fetching today menu:', error);
    return null;
  }

  return data;
}

/**
 * Get user's orders
 */
export async function getUserOrders() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      menu:menus (*),
      items:order_items (
        *,
        dish:dishes (*)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return data;
}

/**
 * Get today's order for current user
 */
export async function getTodayOrder() {
  const user = await requireAuth();
  const supabase = await createClient();

  // Get today's date in Mexico City timezone
  const today = new Date();
  const mexicoCityOffset = 6;
  const localDate = new Date(today.getTime() - mexicoCityOffset * 60 * 60 * 1000);
  const todayStr = localDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      menu:menus (*),
      items:order_items (
        *,
        dish:dishes (*)
      )
    `)
    .eq('user_id', user.id)
    .gte('created_at', todayStr)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned - no order today
      return null;
    }
    console.error('Error fetching today order:', error);
    return null;
  }

  return data;
}

/**
 * Cancel order
 */
export async function cancelOrder(orderId: string) {
  const user = await requireAuth();
  const supabase = await createAdminClient();

  // Verify order belongs to user
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single();

  if (!order) {
    return { error: 'Pedido no encontrado.' };
  }

  // Check if can edit (same deadline applies)
  if (!canEditOrder(order.created_at)) {
    return { error: 'El horario para cancelar pedidos (11:30 AM) ha terminado.' };
  }

  // Get order items to restore availability
  const { data: items } = await supabase
    .from('order_items')
    .select('dish_id, quantity')
    .eq('order_id', orderId);

  if (items) {
    for (const item of items) {
      await supabase.rpc('increment_dish_availability', {
        p_dish_id: item.dish_id,
        p_quantity: item.quantity,
      });
    }
  }

  // Update status to cancelled
  const { error } = await supabase
    .from('orders')
    .update({ status: 'cancelado', updated_at: new Date().toISOString() })
    .eq('id', orderId);

  if (error) {
    console.error('Error cancelling order:', error);
    return { error: error.message };
  }

  revalidatePath('/employee/orders', 'page');
  revalidatePath('/employee', 'page');
  return { success: true };
}
