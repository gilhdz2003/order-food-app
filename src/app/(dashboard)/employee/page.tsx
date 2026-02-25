/**
 * Employee Dashboard - Main Page
 *
 * Employees can view today's menu and place orders
 */

import { DashboardHeader } from '@/components/layouts/dashboard-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getCurrentUser, getTodayOrder } from '@/lib/supabase/actions';
import { UtensilsCrossed, Clock, Calendar, ShoppingCart, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function EmployeeDashboard() {
  const user = await getCurrentUser();
  const todayOrder = await getTodayOrder() as any;

  return (
    <div className="space-y-6">
      <DashboardHeader
        user={user}
        title="Panel de Empleado"
        subtitle="Realiza tu pedido del día"
      />

      {/* Welcome Card */}
      <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5 text-orange-600" />
            ¡Hola, {user?.full_name || 'Usuario'}!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Bienvenido al sistema de pedidos. Aquí podrás ver el menú del día y realizar tu pedido.
          </p>
        </CardContent>
      </Card>

      {/* Today's Order Alert */}
      {todayOrder && (
        <Alert className="border-green-200 bg-green-50">
          <ShoppingCart className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-sm text-green-800 flex items-center justify-between">
            <span>
              Ya tienes un pedido para hoy: <strong>{todayOrder.order_code}</strong>
            </span>
            <Link
              href={`/employee/orders/${todayOrder.id}`}
              className="text-green-700 underline hover:text-green-800"
            >
              Ver pedido
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Menú del Día</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <p className="text-2xl font-bold">Disponible</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Horario Límite</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <p className="text-2xl font-bold">11:30 AM</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">Para modificar tu pedido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Tu Empresa</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{user?.company?.name || 'Sin asignar'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      {!todayOrder && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-900">¿Listo para pedir?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Ve al menú del día, selecciona tus platillos favoritos y confirma tu pedido.
            </p>
            <Link href="/employee/menu">
              <Button className="bg-orange-600 hover:bg-orange-700">
                Ver Menú del Día
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href="/employee/menu" className="block">
            <Button variant="outline" className="w-full justify-between">
              Ver Menú del Día
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/employee/orders" className="block">
            <Button variant="outline" className="w-full justify-between">
              Mis Pedidos
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
