'use client';

/**
 * Employee Menu Page
 *
 * Displays today's menu with dishes and allows employees to place orders.
 */

import React, { useState, useEffect } from 'react';
import { MenuGrid } from '@/components/menu/menu-grid';
import { CartFloating } from '@/components/orders/cart-floating';
import { ConfirmOrderDialog } from '@/components/orders/confirm-order-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { getTodayMenu, createOrder, getTodayOrder } from '@/lib/supabase/actions';
import type { Dish, Menu } from '@/types';
import { RefreshCw, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

export default function EmployeeMenuPage() {
  const [menu, setMenu] = useState<Menu | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [todayOrder, setTodayOrder] = useState<any>(null);

  const { items, addItem, updateQuantity, clearCart, getTotalAmount } = useCart();

  // Load today's menu
  useEffect(() => {
    loadMenu();
    checkTodayOrder();
  }, []);

  const loadMenu = async () => {
    try {
      setIsLoading(true);
      const data = await getTodayMenu() as any;
      if (data) {
        setMenu(data);
        setDishes(data.dishes || []);
      }
    } catch (error) {
      console.error('Error loading menu:', error);
      toast.error('Error al cargar el menú');
    } finally {
      setIsLoading(false);
    }
  };

  const checkTodayOrder = async () => {
    try {
      const order = await getTodayOrder();
      setTodayOrder(order);
    } catch (error) {
      console.error('Error checking today order:', error);
    }
  };

  const handleAddDish = (dish: Dish) => {
    addItem(dish);
    toast.success(`${dish.name} agregado al carrito`);
  };

  const handleUpdateQuantity = (dishId: string, quantity: number) => {
    updateQuantity(dishId, quantity);
  };

  const handleOpenCart = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmOrder = async () => {
    if (!menu) {
      toast.error('No hay menú seleccionado');
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare order items
      const orderItems = items.map((item) => ({
        dish_id: item.dish.id,
        quantity: item.quantity,
      }));

      // Create order
      const result = await createOrder(menu.id, orderItems);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      // Success
      toast.success(`Pedido confirmado: ${result.order?.order_code}`);
      clearCart();
      setShowConfirmDialog(false);
      checkTodayOrder();
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Error al crear el pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Menú del Día</h1>
        <p className="text-sm text-gray-600 mt-1">Selecciona tus platillos y realiza tu pedido</p>
      </div>

      {/* Today's Order Banner */}
      {todayOrder && (
        <Alert className="border-green-200 bg-green-50">
          <ShoppingCart className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-sm text-green-800">
            Ya tienes un pedido para hoy: <strong>{todayOrder.order_code}</strong>.
            {' '}
            <a href={`/employee/orders/${todayOrder.id}`} className="underline">
              Ver pedido
            </a>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      ) : !menu ? (
        /* No Menu State */
        <Alert>
          <AlertDescription>
            No hay menú disponible para hoy. Contacta al administrador.
            <Button
              variant="link"
              onClick={loadMenu}
              className="ml-2"
            >
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        /* Menu Grid */
        <MenuGrid
          dishes={dishes}
          cartItems={items}
          onAdd={handleAddDish}
          onUpdateQuantity={handleUpdateQuantity}
        />
      )}

      {/* Floating Cart Button */}
      <CartFloating
        itemCount={items.length}
        totalAmount={getTotalAmount()}
        onClick={handleOpenCart}
        isVisible={items.length > 0 && !todayOrder}
      />

      {/* Confirm Order Dialog */}
      <ConfirmOrderDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmOrder}
        cartItems={items}
        totalAmount={getTotalAmount()}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
