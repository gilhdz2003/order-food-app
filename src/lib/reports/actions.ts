'use server';

/**
 * Report Server Actions
 *
 * Server-side functions for generating reports and analytics
 */

import { createAdminClient } from '@/lib/supabase/server';
import type { Order, OrderWithItems, User, Company } from '@/types';

/**
 * Get today's date in Mexico City timezone (UTC-6)
 */
function getTodayInMexicoCity(): string {
  const today = new Date();
  const mexicoCityOffset = 6; // UTC-6
  const localDate = new Date(today.getTime() - mexicoCityOffset * 60 * 60 * 1000);
  return localDate.toISOString().split('T')[0];
}

/**
 * Get date range (start and end) for a period
 */
function getDateRange(period: 'today' | 'week' | 'month' | 'custom', startDate?: string, endDate?: string): { start: string; end: string } {
  const today = new Date();
  const mexicoCityOffset = 6;
  const localToday = new Date(today.getTime() - mexicoCityOffset * 60 * 60 * 1000);

  if (period === 'today') {
    const todayStr = localToday.toISOString().split('T')[0];
    return { start: todayStr, end: todayStr };
  }

  if (period === 'week') {
    // Get start of week (Monday)
    const dayOfWeek = localToday.getDay();
    const startOfWeek = new Date(localToday);
    startOfWeek.setDate(localToday.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const startStr = startOfWeek.toISOString().split('T')[0];
    const endStr = localToday.toISOString().split('T')[0];
    return { start: startStr, end: endStr };
  }

  if (period === 'month') {
    // Get start of month
    const startOfMonth = new Date(localToday.getFullYear(), localToday.getMonth(), 1);
    const startStr = startOfMonth.toISOString().split('T')[0];
    const endStr = localToday.toISOString().split('T')[0];
    return { start: startStr, end: endStr };
  }

  // Custom range
  return {
    start: startDate || localToday.toISOString().split('T')[0],
    end: endDate || localToday.toISOString().split('T')[0],
  };
}

/**
 * Report data interface
 */
export interface DailyReportData {
  date: string;
  orders: OrderWithItems[];
  totalAmount: number;
  orderCount: number;
  statusBreakdown: Record<string, number>;
  companyBreakdown: Array<{
    company: Company;
    orderCount: number;
    totalAmount: number;
  }>;
}

export interface WeeklyReportData {
  startDate: string;
  endDate: string;
  orders: OrderWithItems[];
  totalAmount: number;
  orderCount: number;
  dailyBreakdown: Array<{
    date: string;
    orderCount: number;
    totalAmount: number;
  }>;
  companyBreakdown: Array<{
    company: Company;
    orderCount: number;
    totalAmount: number;
  }>;
  topDishes: Array<{
    dishName: string;
    quantity: number;
    totalAmount: number;
  }>;
}

export interface CompanyReportData {
  company: Company;
  startDate: string;
  endDate: string;
  orders: OrderWithItems[];
  totalAmount: number;
  orderCount: number;
  employeeBreakdown: Array<{
    employee: User;
    orderCount: number;
    totalAmount: number;
  }>;
  averageOrderAmount: number;
}

export interface EmployeeReportData {
  employee: User;
  startDate: string;
  endDate: string;
  orders: OrderWithItems[];
  totalAmount: number;
  orderCount: number;
  averageOrderAmount: number;
  favoriteDishes: Array<{
    dishName: string;
    quantity: number;
  }>;
}

/**
 * Get daily report
 */
export async function getDailyReport(date?: string): Promise<DailyReportData> {
  const supabase = await createAdminClient();

  const reportDate = date || getTodayInMexicoCity();

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      user:users (
        id,
        full_name,
        email
      ),
      company:companies (
        id,
        name
      ),
      items:order_items (
        *,
        dish:dishes (
          id,
          name,
          category
        )
      )
    `)
    .gte('created_at', reportDate)
    .lt('created_at', `${reportDate}T23:59:59.999Z`)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching daily report:', error);
    return {
      date: reportDate,
      orders: [],
      totalAmount: 0,
      orderCount: 0,
      statusBreakdown: {},
      companyBreakdown: [],
    };
  }

  // Calculate metrics
  const totalAmount = orders?.reduce((sum: number, order: OrderWithItems) => sum + (order.total_amount || 0), 0) || 0;
  const orderCount = orders?.length || 0;

  // Status breakdown
  const statusBreakdown: Record<string, number> = {};
  orders?.forEach((order: OrderWithItems) => {
    const status = order.status || 'unknown';
    statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
  });

  // Company breakdown
  const companyMap = new Map<string, { company: Company; orderCount: number; totalAmount: number }>();
  orders?.forEach((order: OrderWithItems) => {
    const companyId = order.company_id;
    if (!companyMap.has(companyId)) {
      companyMap.set(companyId, {
        company: order.company as Company,
        orderCount: 0,
        totalAmount: 0,
      });
    }
    const data = companyMap.get(companyId)!;
    data.orderCount++;
    data.totalAmount += order.total_amount || 0;
  });

  const companyBreakdown = Array.from(companyMap.values());

  return {
    date: reportDate,
    orders: orders as OrderWithItems[],
    totalAmount,
    orderCount,
    statusBreakdown,
    companyBreakdown,
  };
}

/**
 * Get weekly report
 */
export async function getWeeklyReport(startDate?: string, endDate?: string): Promise<WeeklyReportData> {
  const supabase = await createAdminClient();

  const { start, end } = getDateRange('custom', startDate, endDate);

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      user:users (
        id,
        full_name,
        email
      ),
      company:companies (
        id,
        name
      ),
      items:order_items (
        *,
        dish:dishes (
          id,
          name,
          category
        )
      )
    `)
    .gte('created_at', start)
    .lte('created_at', `${end}T23:59:59.999Z`)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching weekly report:', error);
    return {
      startDate: start,
      endDate: end,
      orders: [],
      totalAmount: 0,
      orderCount: 0,
      dailyBreakdown: [],
      companyBreakdown: [],
      topDishes: [],
    };
  }

  // Calculate metrics
  const totalAmount = orders?.reduce((sum: number, order: OrderWithItems) => sum + (order.total_amount || 0), 0) || 0;
  const orderCount = orders?.length || 0;

  // Daily breakdown
  const dailyMap = new Map<string, { orderCount: number; totalAmount: number }>();
  orders?.forEach((order: OrderWithItems) => {
    const date = order.created_at.split('T')[0];
    if (!dailyMap.has(date)) {
      dailyMap.set(date, { orderCount: 0, totalAmount: 0 });
    }
    const data = dailyMap.get(date)!;
    data.orderCount++;
    data.totalAmount += order.total_amount || 0;
  });

  const dailyBreakdown = Array.from(dailyMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Company breakdown
  const companyMap = new Map<string, { company: Company; orderCount: number; totalAmount: number }>();
  orders?.forEach((order: OrderWithItems) => {
    const companyId = order.company_id;
    if (!companyMap.has(companyId)) {
      companyMap.set(companyId, {
        company: order.company as Company,
        orderCount: 0,
        totalAmount: 0,
      });
    }
    const data = companyMap.get(companyId)!;
    data.orderCount++;
    data.totalAmount += order.total_amount || 0;
  });

  const companyBreakdown = Array.from(companyMap.values())
    .sort((a, b) => b.totalAmount - a.totalAmount);

  // Top dishes
  const dishMap = new Map<string, { dishName: string; quantity: number; totalAmount: number }>();
  orders?.forEach((order: OrderWithItems) => {
    order.items?.forEach(item => {
      const dish = item.dish as any;
      if (!dishMap.has(dish.id)) {
        dishMap.set(dish.id, {
          dishName: dish.name,
          quantity: 0,
          totalAmount: 0,
        });
      }
      const data = dishMap.get(dish.id)!;
      data.quantity += item.quantity;
      data.totalAmount += item.price_at_order * item.quantity;
    });
  });

  const topDishes = Array.from(dishMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  return {
    startDate: start,
    endDate: end,
    orders: orders as OrderWithItems[],
    totalAmount,
    orderCount,
    dailyBreakdown,
    companyBreakdown,
    topDishes,
  };
}

/**
 * Get company report
 */
export async function getCompanyReport(companyId: string, startDate?: string, endDate?: string): Promise<CompanyReportData | null> {
  const supabase = await createAdminClient();

  // Verify company exists
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single();

  if (!company) {
    return null;
  }

  const { start, end } = getDateRange('custom', startDate, endDate);

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      user:users (
        id,
        full_name,
        email
      ),
      items:order_items (
        *,
        dish:dishes (
          id,
          name,
          category
        )
      )
    `)
    .eq('company_id', companyId)
    .gte('created_at', start)
    .lte('created_at', `${end}T23:59:59.999Z`)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching company report:', error);
    return null;
  }

  const totalAmount = orders?.reduce((sum: number, order: OrderWithItems) => sum + (order.total_amount || 0), 0) || 0;
  const orderCount = orders?.length || 0;
  const averageOrderAmount = orderCount > 0 ? totalAmount / orderCount : 0;

  // Employee breakdown
  const employeeMap = new Map<string, { employee: User; orderCount: number; totalAmount: number }>();
  orders?.forEach((order: OrderWithItems) => {
    const userId = order.user_id;
    if (!employeeMap.has(userId)) {
      employeeMap.set(userId, {
        employee: order.user as User,
        orderCount: 0,
        totalAmount: 0,
      });
    }
    const data = employeeMap.get(userId)!;
    data.orderCount++;
    data.totalAmount += order.total_amount || 0;
  });

  const employeeBreakdown = Array.from(employeeMap.values())
    .sort((a, b) => b.totalAmount - a.totalAmount);

  return {
    company,
    startDate: start,
    endDate: end,
    orders: orders as OrderWithItems[],
    totalAmount,
    orderCount,
    employeeBreakdown,
    averageOrderAmount,
  };
}

/**
 * Get employee report
 */
export async function getEmployeeReport(userId: string, startDate?: string, endDate?: string): Promise<EmployeeReportData | null> {
  const supabase = await createAdminClient();

  // Verify user exists
  const { data: employee } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (!employee) {
    return null;
  }

  const { start, end } = getDateRange('custom', startDate, endDate);

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items (
        *,
        dish:dishes (
          id,
          name,
          category
        )
      )
    `)
    .eq('user_id', userId)
    .gte('created_at', start)
    .lte('created_at', `${end}T23:59:59.999Z`)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching employee report:', error);
    return null;
  }

  const totalAmount = orders?.reduce((sum: number, order: OrderWithItems) => sum + (order.total_amount || 0), 0) || 0;
  const orderCount = orders?.length || 0;
  const averageOrderAmount = orderCount > 0 ? totalAmount / orderCount : 0;

  // Favorite dishes
  const dishMap = new Map<string, { dishName: string; quantity: number }>();
  orders?.forEach((order: OrderWithItems) => {
    order.items?.forEach(item => {
      const dish = item.dish as any;
      if (!dishMap.has(dish.id)) {
        dishMap.set(dish.id, {
          dishName: dish.name,
          quantity: 0,
        });
      }
      const data = dishMap.get(dish.id)!;
      data.quantity += item.quantity;
    });
  });

  const favoriteDishes = Array.from(dishMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return {
    employee,
    startDate: start,
    endDate: end,
    orders: orders as OrderWithItems[],
    totalAmount,
    orderCount,
    averageOrderAmount,
    favoriteDishes,
  };
}

/**
 * Get all companies for filter dropdown
 */
export async function getAllCompanies(): Promise<Company[]> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching companies:', error);
    return [];
  }

  return data as Company[];
}

/**
 * Get all users for filter dropdown
 */
export async function getAllUsers(): Promise<User[]> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('is_active', true)
    .order('full_name');

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return data as User[];
}
