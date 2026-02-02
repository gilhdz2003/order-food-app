/**
 * Admin Users Page
 *
 * User management with CRUD operations
 */

import { DashboardHeader } from '@/components/layouts/dashboard-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/actions';
import type { User, UserRole } from '@/types';
import Link from 'next/link';

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();

  // Fetch all users with company information
  const { data: users } = await supabase
    .from('users')
    .select(`
      *,
      company:companies(*)
    `)
    .order('created_at', { ascending: false });

  const getRoleLabel = (role: UserRole) => {
    const roles: Record<UserRole, { label: string; color: string }> = {
      admin: { label: 'Administrador', color: 'bg-red-100 text-red-800' },
      editor_menu: { label: 'Editor Menús', color: 'bg-blue-100 text-blue-800' },
      empleado: { label: 'Empleado', color: 'bg-green-100 text-green-800' },
      comanda_user: { label: 'Cocina', color: 'bg-orange-100 text-orange-800' },
    };
    return roles[role] || { label: role, color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <div className="min-h-screen">
      <DashboardHeader
        user={user!}
        title="Gestión de Usuarios"
        subtitle="Administra los usuarios del sistema"
        actions={
          <Link href="/admin/users/new">
            <Button>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Usuario
            </Button>
          </Link>
        }
      />

      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Usuarios</CardTitle>
            <CardDescription>
              {users?.length || 0} usuarios registrados en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users && users.length > 0 ? (
                    users.map((u: any) => {
                      const roleInfo = getRoleLabel(u.role);
                      return (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">
                            {u.full_name || 'Sin nombre'}
                          </TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>
                            <Badge className={roleInfo.color}>{roleInfo.label}</Badge>
                          </TableCell>
                          <TableCell>
                            {u.company?.name || 'Sin asignar'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={u.is_active ? 'default' : 'secondary'}>
                              {u.is_active ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Abrir menú</span>
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                  </svg>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/users/${u.id}`}>Ver detalles</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/users/${u.id}/edit`}>Editar</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  {u.is_active ? 'Desactivar' : 'Activar'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No hay usuarios registrados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
