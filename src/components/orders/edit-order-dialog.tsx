'use client';

/**
 * EditOrderDialog Component
 *
 * Modal for editing an existing order (only before 11:30 AM).
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Clock, Trash2 } from 'lucide-react';
import type { OrderWithItems } from '@/types';

interface EditOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (items: Array<{ dish_id: string; quantity: number }>) => void;
  onCancel: () => void;
  order: OrderWithItems | null;
  isSaving?: boolean;
}

export function EditOrderDialog({
  isOpen,
  onClose,
  onSave,
  onCancel,
  order,
  isSaving = false,
}: EditOrderDialogProps) {
  const [items, setItems] = useState<Array<{ dish_id: string; quantity: number }>>([]);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  React.useEffect(() => {
    if (order?.items) {
      setItems(
        order.items.map((item) => ({
          dish_id: item.dish_id,
          quantity: item.quantity,
        }))
      );
    }
  }, [order]);

  const handleQuantityChange = (dishId: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.dish_id === dishId
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
    );
  };

  const handleRemoveItem = (dishId: string) => {
    setItems((prev) => prev.filter((item) => item.dish_id !== dishId));
  };

  const handleSave = () => {
    const validItems = items.filter((item) => item.quantity > 0);
    if (validItems.length === 0) {
      return; // Don't save empty order
    }
    onSave(validItems);
  };

  const handleCancelOrder = () => {
    if (showCancelConfirm) {
      onCancel();
      setShowCancelConfirm(false);
      onClose();
    } else {
      setShowCancelConfirm(true);
    }
  };

  const totalAmount = items.reduce((sum, item) => {
    const orderItem = order?.items?.find((oi) => oi.dish_id === item.dish_id);
    const price = orderItem?.price_at_order || 0;
    return sum + price * item.quantity;
  }, 0);

  if (!order) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Pedido: {order.order_code}</DialogTitle>
          <DialogDescription>
            Modifica tu pedido. Tienes hasta las 11:30 AM.
          </DialogDescription>
        </DialogHeader>

        {/* Deadline Warning */}
        <Alert className="border-yellow-200 bg-yellow-50">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-sm text-yellow-800">
            El horario para editar (11:30 AM) está por vencer. Haz tus cambios pronto.
          </AlertDescription>
        </Alert>

        {/* Order Items */}
        <div className="my-4 max-h-64 overflow-y-auto">
          <div className="space-y-3">
            {order.items?.map((item) => {
              const currentItem = items.find((i) => i.dish_id === item.dish_id);
              const quantity = currentItem?.quantity || 0;

              return (
                <div
                  key={item.dish_id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.dish.name}</p>
                    <p className="text-sm text-gray-500">
                      ${item.price_at_order.toFixed(2)} c/u
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuantityChange(item.dish_id, -1)}
                      disabled={isSaving}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuantityChange(item.dish_id, 1)}
                      disabled={isSaving}
                    >
                      +
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveItem(item.dish_id)}
                      disabled={isSaving}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between border-t pt-4">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-2xl font-bold text-orange-600">
            ${totalAmount.toFixed(2)}
          </span>
        </div>

        <DialogFooter className="mt-4 flex-col gap-2">
          <div className="flex gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={items.filter((i) => i.quantity > 0).length === 0 || isSaving}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
          <Button
            type="button"
            variant="destructive"
            onClick={handleCancelOrder}
            disabled={isSaving}
            className="w-full"
          >
            {showCancelConfirm
              ? '¿Seguro que deseas cancelar? Confirma de nuevo'
              : 'Cancelar Pedido'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
