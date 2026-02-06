/**
 * Dashboard Header Component
 *
 * Shared header for dashboard pages
 * This is a Server Component - interactive elements are in separate Client Components
 */

import type { User } from '@/types';
import { UserMenu } from './user-menu';

interface DashboardHeaderProps {
  user: User | null;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function DashboardHeader({ user, title, subtitle, actions }: DashboardHeaderProps) {
  return (
    <header className="border-b bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>

        <div className="flex items-center space-x-4">
          {actions}

          {user && <UserMenu user={user} />}
        </div>
      </div>
    </header>
  );
}
