/**
 * Create New Menu Page
 *
 * Form to create a new menu
 */

import { DashboardHeader } from '@/components/layouts/dashboard-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getCurrentUser } from '@/lib/supabase/actions';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function NewMenuPage() {
  const user = await getCurrentUser();

  async function createMenu(formData: FormData) {
    'use server';

    const supabase = await createClient();
    const menuDate = formData.get('menu_date') as string;

    if (!menuDate) {
      redirect('/editor/new?error=missing_date');
    }

    // Check if menu already exists for this date
    const { data: existingMenu } = await supabase
      .from('menus')
      .select('id')
      .eq('menu_date', menuDate)
      .single();

    if (existingMenu) {
      redirect(`/editor/menus/${existingMenu.id}?error=already_exists`);
    }

    // Create menu
    const { data: menu, error } = await supabase
      .from('menus')
      .insert({
        menu_date: menuDate,
        is_published: false,
        created_by: user!.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating menu:', error);
      redirect('/editor/new?error=create_failed');
    }

    redirect(`/editor/menus/${menu.id}`);
  }

  // Get today's date as minimum
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen">
      <DashboardHeader
        user={user!}
        title="Crear Nuevo Menú"
        subtitle="Configura un nuevo menú para un día específico"
      />

      <div className="p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Información del Menú</CardTitle>
            <CardDescription>
              Selecciona la fecha para el menú. Luego podrás agregar los platillos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createMenu} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="menu_date">Fecha del Menú *</Label>
                <Input
                  id="menu_date"
                  name="menu_date"
                  type="date"
                  min={today}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  La fecha debe ser hoy o en el futuro
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">¿Qué sigue?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Podrás agregar platillos, bebidas y postres</li>
                  <li>• Configurar precios y cantidades disponibles</li>
                  <li>• Publicar el menú cuando esté listo</li>
                  <li>• Los empleados podrán ver y pedir del menú publicado</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                  Cancelar
                </Button>
                <Button type="submit">Crear Menú</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
