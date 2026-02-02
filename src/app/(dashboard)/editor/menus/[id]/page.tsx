/**
 * Edit Menu Page
 *
 * Page to add/edit/delete dishes for a menu
 */

import { DashboardHeader } from '@/components/layouts/dashboard-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/actions';
import { redirect, notFound } from 'next/navigation';
import type { DishCategory } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

export default async function EditMenuPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  const supabase = await createClient();

  // Fetch menu with dishes
  const { data: menu, error } = await supabase
    .from('menus')
    .select(`
      *,
      dishes(*)
    `)
    .eq('id', params.id)
    .single();

  if (error || !menu) {
    notFound();
  }

  // Server action to add dish
  async function addDish(formData: FormData) {
    'use server';

    const supabase = await createClient();

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const category = formData.get('category') as DishCategory;
    const initialQuantity = parseInt(formData.get('initial_quantity') as string);
    const imageUrl = formData.get('image_url') as string;

    const { error } = await supabase.from('dishes').insert({
      menu_id: params.id,
      name,
      description: description || null,
      price,
      category,
      initial_quantity: initialQuantity,
      available_quantity: initialQuantity,
      image_url: imageUrl || null,
    });

    if (error) {
      console.error('Error adding dish:', error);
      redirect(`/editor/menus/${params.id}?error=add_failed`);
    }

    redirect(`/editor/menus/${params.id}?success=dish_added`);
  }

  // Server action to delete dish
  async function deleteDish(dishId: string) {
    'use server';

    const supabase = await createClient();

    const { error } = await supabase.from('dishes').delete().eq('id', dishId);

    if (error) {
      console.error('Error deleting dish:', error);
      redirect(`/editor/menus/${params.id}?error=delete_failed`);
    }

    redirect(`/editor/menus/${params.id}?success=dish_deleted`);
  }

  // Server action to publish/unpublish menu
  async function togglePublish() {
    'use server';

    const supabase = await createClient();

    const { error } = await supabase
      .from('menus')
      .update({
        is_published: !menu.is_published,
        published_at: !menu.is_published ? new Date().toISOString() : null,
      })
      .eq('id', params.id);

    if (error) {
      console.error('Error toggling publish:', error);
      redirect(`/editor/menus/${params.id}?error=publish_failed`);
    }

    redirect(`/editor/menus/${params.id}?success=publish_toggled`);
  }

  const categoryLabels: Record<DishCategory, string> = {
    platillo: 'Platillo',
    bebida: 'Bebida',
    postre: 'Postre',
  };

  const getCategoryColor = (category: DishCategory) => {
    const colors: Record<DishCategory, string> = {
      platillo: 'bg-orange-100 text-orange-800',
      bebida: 'bg-blue-100 text-blue-800',
      postre: 'bg-pink-100 text-pink-800',
    };
    return colors[category];
  };

  const menuDate = new Date(menu.menu_date);
  const today = new Date();
  const isToday = menuDate.toDateString() === today.toDateString();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = menuDate.toDateString() === tomorrow.toDateString();

  const dateLabel = isToday ? 'Hoy' : isTomorrow ? 'Mañana' : format(menuDate, "EEEE d 'de' MMMM", { locale: es });

  return (
    <div className="min-h-screen">
      <DashboardHeader
        user={user!}
        title={`Menú: ${dateLabel}`}
        subtitle={
          menu.is_published
            ? 'Publicado - Visible para empleados'
            : 'Borrador - No visible para empleados'
        }
        actions={
          <div className="flex space-x-2">
            <Link href="/editor">
              <Button variant="outline">Volver</Button>
            </Link>
            <form action={togglePublish}>
              <Button
                type="submit"
                variant={menu.is_published ? 'outline' : 'default'}
                className={menu.is_published ? 'text-orange-600' : ''}
              >
                {menu.is_published ? 'Despublicar' : 'Publicar Menú'}
              </Button>
            </form>
          </div>
        }
      />

      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Add Dish Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Agregar Platillo</CardTitle>
                <CardDescription>
                  Agrega un nuevo platillo al menú
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={addDish} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Nombre *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Tacos al Pastor"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">
                      Descripción
                    </label>
                    <Input
                      id="description"
                      name="description"
                      type="text"
                      placeholder="Con piña, cilantro y cebolla"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="price" className="text-sm font-medium">
                        Precio *
                      </label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="85.00"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="initial_quantity" className="text-sm font-medium">
                        Cantidad *
                      </label>
                      <Input
                        id="initial_quantity"
                        name="initial_quantity"
                        type="number"
                        min="1"
                        placeholder="20"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">
                      Categoría *
                    </label>
                    <Select name="category" required defaultValue="platillo">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="platillo">Platillo</SelectItem>
                        <SelectItem value="bebida">Bebida</SelectItem>
                        <SelectItem value="postre">Postre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="image_url" className="text-sm font-medium">
                      URL de Imagen
                    </label>
                    <Input
                      id="image_url"
                      name="image_url"
                      type="url"
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Agregar Platillo
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Dishes List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Platillos del Menú</CardTitle>
                <CardDescription>
                  {menu.dishes?.length || 0} platillos configurados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {menu.dishes && menu.dishes.length > 0 ? (
                  <div className="space-y-4">
                    {menu.dishes.map((dish: any) => (
                      <div
                        key={dish.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold">{dish.name}</h4>
                              {dish.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {dish.description}
                                </p>
                              )}
                            </div>
                            <Badge className={getCategoryColor(dish.category)}>
                              {categoryLabels[dish.category]}
                            </Badge>
                          </div>
                          <div className="mt-2 flex items-center space-x-4 text-sm">
                            <span className="font-medium text-lg">
                              ${dish.price.toFixed(2)}
                            </span>
                            <span className="text-muted-foreground">
                              Disponibles: {dish.available_quantity}/{dish.initial_quantity}
                            </span>
                          </div>
                        </div>

                        <form action={async () => {
                          'use server';
                          await deleteDish(dish.id);
                        }}>
                          <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        </form>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-muted-foreground">No hay platillos en este menú</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Agrega platillos usando el formulario
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
