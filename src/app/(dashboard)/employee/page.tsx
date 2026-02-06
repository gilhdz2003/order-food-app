/**
 * Employee Dashboard - Main Page
 *
 * Employees can view today's menu and place orders
 */

import { DashboardHeader } from '@/components/layouts/dashboard-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/supabase/actions';
import { UtensilsCrossed, Clock, Calendar } from 'lucide-react';

export default async function EmployeeDashboard() {
  const user = await getCurrentUser();

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

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Menú del Día</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <p className="text-2xl font-bold">Próximamente</p>
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

      {/* Coming Soon Notice */}
      <Card>
        <CardHeader>
          <CardTitle>Sistema de Pedidos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            El módulo de pedidos para empleados está en desarrollo. Próximamente podrás:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Ver el menú del día con fotos y descripciones</li>
            <li>Seleccionar tus platillos, bebidas y postres</li>
            <li>Ver el historial de tus pedidos</li>
            <li>Modificar tu pedido antes de las 11:30 AM</li>
          </ul>
          <Button disabled className="mt-4">
            Pedidos Disponibles Próximamente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
