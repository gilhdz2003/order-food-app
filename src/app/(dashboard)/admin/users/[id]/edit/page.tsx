/**
 * Edit User Page
 *
 * Form to edit an existing user in the system
 */

import { DashboardHeader } from '@/components/layouts/dashboard-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserStatusSwitch } from '@/components/forms/user-status-switch';
import { createAdminClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/actions';
import { redirect, notFound } from 'next/navigation';
import type { UserRole } from '@/types';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  const supabaseAdmin = await createAdminClient();

  // Fetch the user to edit
  const { data: targetUser, error } = await supabaseAdmin
    .from('users')
    .select(`
      *,
      company:companies(*)
    `)
    .eq('id', id)
    .single();

  if (error || !targetUser) {
    notFound();
  }

  // Fetch all companies
  const { data: companies } = await supabaseAdmin
    .from('companies')
    .select('*')
    .eq('is_active', true)
    .order('name');

  async function updateUser(formData: FormData) {
    'use server';

    const supabaseAdmin = await createAdminClient();

    const fullName = formData.get('full_name') as string;
    const phone = formData.get('phone') as string;
    const companyId = formData.get('company_id') as string;
    const role = formData.get('role') as UserRole;
    const isActive = formData.get('is_active') === 'true';

    // Update user
    const { error } = await supabaseAdmin
      .from('users')
      .update({
        full_name: fullName || null,
        phone: phone || null,
        company_id: companyId || null,
        role,
        is_active: isActive,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating user:', error);
      redirect(`/admin/users/${id}/edit?error=failed`);
    }

    redirect('/admin/users?success=updated');
  }

  const getRoleLabel = (role: UserRole) => {
    const roles: Record<UserRole, string> = {
      admin: 'Administrador',
      editor_menu: 'Editor de Menús',
      empleado: 'Empleado',
      comanda_user: 'Cocina/Comanda',
    };
    return roles[role] || role;
  };

  return (
    <div className="min-h-screen">
      <DashboardHeader
        user={user!}
        title="Editar Usuario"
        subtitle={`Modificando: ${targetUser.full_name || targetUser.email}`}
      />

      <div className="p-6 max-w-2xl">
        {/* Current User Info Card */}
        <Card className="mb-6 bg-gray-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Información de Registro</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p><span className="text-muted-foreground">Email:</span> {targetUser.email}</p>
            <p><span className="text-muted-foreground">ID Auth:</span> <code className="text-xs bg-gray-200 px-1 rounded">{targetUser.id}</code></p>
            <p><span className="text-muted-foreground">Registrado:</span> {new Date(targetUser.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Editar Perfil</CardTitle>
            <CardDescription>
              Modifica el rol, empresa y estado del usuario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateUser} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nombre Completo</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="Juan Pérez García"
                  defaultValue={targetUser.full_name || ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+52 81 1234 5678"
                  defaultValue={targetUser.phone || ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rol *</Label>
                <Select name="role" required defaultValue={targetUser.role}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="empleado">Empleado - Realiza pedidos</SelectItem>
                    <SelectItem value="comanda_user">Cocina/Comanda - Recibe pedidos</SelectItem>
                    <SelectItem value="editor_menu">Editor de Menús - Administra menús</SelectItem>
                    <SelectItem value="admin">Administrador - Acceso total</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Actual: <strong>{getRoleLabel(targetUser.role)}</strong>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_id">Empresa</Label>
                <Select name="company_id" defaultValue={targetUser.company_id || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin empresa</SelectItem>
                    {companies?.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Actual: <strong>{targetUser.company?.name || 'Sin asignar'}</strong>
                </p>
              </div>

              <UserStatusSwitch
                defaultChecked={targetUser.is_active}
                label="Estado de la Cuenta"
                description={`Usuario ${targetUser.is_active ? 'activo' : 'inactivo'}`}
              />

              <div className="flex justify-between pt-4 border-t">
                <Button type="button" variant="outline" asChild>
                  <Link href="/admin/users">Cancelar</Link>
                </Button>
                <Button type="submit">Guardar Cambios</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Role Description Card */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-900">Permisos por Rol</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-2">
            <div><strong>Administrador:</strong> Acceso completo, gestión de usuarios, empresas, menús y reportes.</div>
            <div><strong>Editor de Menús:</strong> Crear y editar menús diarios para las empresas.</div>
            <div><strong>Empleado:</strong> Ver menú del día y realizar pedidos de comida.</div>
            <div><strong>Cocina/Comanda:</strong> Ver y gestionar los pedidos recibidos (comandas).</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
