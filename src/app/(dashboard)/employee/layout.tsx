/**
 * Layout for Employee Dashboard
 */

import { DashboardHeader } from '@/components/layouts/dashboard-header';
import { DashboardSidebar } from '@/components/layouts/dashboard-sidebar';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/actions';

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Employee-only route
  if (user.role !== 'empleado' && user.role !== 'admin') {
    redirect('/login');
  }

  const navigation = [
    {
      name: 'Mis Pedidos',
      href: '/employee/orders',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      name: 'Menú del Día',
      href: '/employee/menu',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      name: 'Historial',
      href: '/employee/history',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar user={user} navigation={navigation} />
      <main className="flex-1">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
