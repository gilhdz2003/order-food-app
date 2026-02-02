/**
 * Create New User Page
 *
 * Form to create a new user in the system
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
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/actions';
import { redirect } from 'next/navigation';
import type { UserRole } from '@/types';

export default async function NewUserPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();

  // Fetch all companies
  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .eq('is_active', true)
    .order('name');

  async function createUser(formData: FormData) {
    'use server';

    const supabase = await createClient();

    const email = formData.get('email') as string;
    const fullName = formData.get('full_name') as string;
    const phone = formData.get('phone') as string;
    const companyId = formData.get('company_id') as string;
    const role = formData.get('role') as UserRole;
    const isActive = formData.get('is_active') === 'true';

    // Create user
    const { error } = await supabase.from('users').insert({
      email,
      full_name: fullName || null,
      phone: phone || null,
      company_id: companyId || null,
      role,
      is_active: isActive,
    });

    if (error) {
      console.error('Error creating user:', error);
      redirect('/admin/users/new?error=failed');
    }

    redirect('/admin/users?success=created');
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader
        user={user!}
        title="Nuevo Usuario"
        subtitle="Crear un nuevo usuario en el sistema"
      />

      <div className="p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Información del Usuario</CardTitle>
            <CardDescription>
              Completa los datos para crear un nuevo usuario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createUser} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Nombre Completo</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="Juan Pérez García"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+52 81 1234 5678"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rol *</Label>
                <Select name="role" required defaultValue="empleado">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="empleado">Empleado</SelectItem>
                    <SelectItem value="comanda_user">Cocina/Comanda</SelectItem>
                    <SelectItem value="editor_menu">Editor de Menús</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_id">Empresa</Label>
                <Select name="company_id">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="is_active">Estado *</Label>
                <Select name="is_active" required defaultValue="true">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Activo</SelectItem>
                    <SelectItem value="false">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                  Cancelar
                </Button>
                <Button type="submit">Crear Usuario</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> El usuario deberá iniciar sesión con Google OAuth.
            Se le asignará automáticamente el rol y empresa configurados aquí.
          </p>
        </div>
      </div>
    </div>
  );
}
