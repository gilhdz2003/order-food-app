'use client';

/**
 * Employee Orders History Page
 *
 * Displays the employee's order history with actions to view/edit/cancel.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EditOrderDialog } from '@/components/orders/edit-order-dialog';
import { getUserOrders, cancelOrder } from '@/lib/supabase/actions';
import { canEditOrder } from '@/lib/utils/order';
import type { OrderWithItems } from '@/types';
import { Clock, Calendar, DollarSign, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  pendiente: 'bg-yellow-500',
  confirmado: 'bg-blue-500',
  en_preparacion: 'bg-orange-500',
  listo: 'bg-green-500',
  entregado: 'bg-green-700',
  cancelado: 'bg-red-500',
};

const statusLabels: Record<string, string> = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  en_preparacion: 'En Preparación',
  listo: 'Listo',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

export default function EmployeeOrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const data = await getUserOrders();
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Error al cargar tus pedidos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditOrder = (order: OrderWithItems) => {
    if (!canEditOrder(order.created_at)) {
      toast.error('El horario para editar pedidos (11:30 AM) ha terminado.');
      return;
    }
    setSelectedOrder(order);
    setShowEditDialog(true);
  };

  const handleSaveChanges = async (items: Array<{ dish_id: string; quantity: number }>) => {
    if (!selectedOrder) return;

    try {
      setIsSaving(true);

      // Calculate new total
      const totalAmount = items.reduce((sum, item) => {
        const orderItem = selectedOrder.items?.find((oi) => oi.dish_id === item.dish_id);
        const price = orderItem?.price_at_order || 0;
        return sum + price * item.quantity;
      }, 0);

      // For now, we'll use a simpler approach - cancel and recreate
      // In production, this should be a proper update endpoint
      toast.info('Función de edición en desarrollo. Por favor cancela y crea un nuevo pedido.');
      setShowEditDialog(false);
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Error al actualizar el pedido');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;

    try {
      setIsSaving(true);
      const result = await cancelOrder(selectedOrder.id);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Pedido cancelado exitosamente');
      setShowEditDialog(false);
      setSelectedOrder(null);
      loadOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Error al cancelar el pedido');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Pedidos</h1>
          <p className="text-sm text-gray-600 mt-1">Historial de tus pedidos</p>
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Pedidos</h1>
        <p className="text-sm text-gray-600 mt-1">Historial de tus pedidos</p>
      </div>

      {orders.length === 0 ? (
        <Alert>
          <AlertDescription>
            No tienes pedidos aún. Ve al <a href="/employee/menu" className="text-orange-600 underline">menú del día</a> para hacer tu primer pedido.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Order Header */}
                <div className="border-b bg-gray-50 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold">{order.order_code}</h3>
                        <Badge className={`${statusColors[order.status]} text-white`}>
                          {statusLabels[order.status]}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(order.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatTime(order.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-600">
                        ${order.total_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4">
                  <p className="mb-2 text-sm font-medium text-gray-700">Items:</p>
                  <ul className="space-y-2">
                    {order.items?.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>
                          {item.quantity}x {item.dish.name}
                        </span>
                        <span className="text-gray-600">
                          ${(item.quantity * item.price_at_order).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="border-t bg-gray-50 p-4">
                  <div className="flex gap-2">
                    {canEditOrder(order.created_at) &&
                     order.status === 'pendiente' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditOrder(order)}
                          className="flex-1"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOrder(order);
                            handleCancelOrder();
                          }}
                          className="flex-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Cancelar
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto"
                      asChild
                    >
                      <a href={`/employee/orders/${order.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalle
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Order Dialog */}
      <EditOrderDialog
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setSelectedOrder(null);
        }}
        onSave={handleSaveChanges}
        onCancel={handleCancelOrder}
        order={selectedOrder}
        isSaving={isSaving}
      />
    </div>
  );
}
