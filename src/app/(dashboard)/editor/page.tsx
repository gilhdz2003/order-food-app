/**
 * Editor Dashboard - Menus List Page
 *
 * List all menus with actions to edit, publish/unpublish
 */

import { DashboardHeader } from '@/components/layouts/dashboard-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/actions';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default async function EditorMenusPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();

  // Fetch all menus with dish count
  const { data: menus } = await supabase
    .from('menus')
    .select(`
      *,
      dishes(count)
    `)
    .order('menu_date', { ascending: false });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Mañana';
    } else {
      return format(date, "EEEE d 'de' MMMM", { locale: es });
    }
  };

  return (
    <div className="min-h-screen">
      <DashboardHeader
        user={user!}
        title="Mis Menús"
        subtitle="Gestiona los menús diarios"
        actions={
          <Link href="/editor/new">
            <Button>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Crear Menú
            </Button>
          </Link>
        }
      />

      <div className="p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {menus && menus.length > 0 ? (
            menus.map((menu: any) => (
              <Card key={menu.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        {formatDate(menu.menu_date)}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {menu.dishes?.[0]?.count || 0} platillos
                      </CardDescription>
                    </div>
                    <Badge
                      variant={menu.is_published ? 'default' : 'secondary'}
                      className={menu.is_published ? 'bg-green-500' : ''}
                    >
                      {menu.is_published ? 'Publicado' : 'Borrador'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          Creado: {format(new Date(menu.created_at), "d MMM yyyy", { locale: es })}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Link href={`/editor/menus/${menu.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          {menu.dishes?.[0]?.count > 0 ? 'Editar' : 'Agregar Platillos'}
                        </Button>
                      </Link>

                      {menu.is_published ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-orange-600 hover:text-orange-700"
                          onClick={async () => {
                            'use server';
                            const supabase = await createClient();
                            await supabase
                              .from('menus')
                              .update({ is_published: false, published_at: null })
                              .eq('id', menu.id);
                          }}
                        >
                          Despublicar
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                          onClick={async () => {
                            'use server';
                            const supabase = await createClient();
                            await supabase
                              .from('menus')
                              .update({ is_published: true, published_at: new Date().toISOString() })
                              .eq('id', menu.id);
                          }}
                        >
                          Publicar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <svg className="h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No hay menús creados
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Crea tu primer menú para comenzar
                </p>
                <Link href="/editor/new">
                  <Button>Crear Menú</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
