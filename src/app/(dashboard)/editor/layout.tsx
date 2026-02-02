/**
 * Editor Dashboard Layout
 *
 * Layout for editor menu dashboard pages
 */

import { getCurrentUser } from '@/lib/supabase/actions';
import { DashboardSidebar } from '@/components/layouts/dashboard-sidebar';
import { redirect } from 'next/navigation';

export default async function EditorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Verify user has editor_menu or admin role
  if (user.role !== 'editor_menu' && user.role !== 'admin') {
    redirect('/employee');
  }

  const navigation = [
    {
      name: 'Mis Menús',
      href: '/editor',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      name: 'Crear Menú',
      href: '/editor/new',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar user={user} navigation={navigation} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
