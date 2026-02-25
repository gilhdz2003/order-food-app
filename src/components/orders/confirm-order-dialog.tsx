'use client';

/**
 * ConfirmOrderDialog Component
 *
 * Modal for reviewing and confirming the order before submission.
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
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ShoppingCart } from 'lucide-react';
import type { CartItem } from '@/types';

interface ConfirmOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cartItems: CartItem[];
  totalAmount: number;
  isSubmitting?: boolean;
}

export function ConfirmOrderDialog({
  isOpen,
  onClose,
  onConfirm,
  cartItems,
  totalAmount,
  isSubmitting = false,
}: ConfirmOrderDialogProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
    }
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-orange-600" />
            Confirmar Pedido
          </DialogTitle>
          <DialogDescription>
            Por favor, revisa tu pedido antes de confirmar. No podrás hacer cambios después de las 11:30 AM.
          </DialogDescription>
        </DialogHeader>

        {/* Order Items */}
        <div className="my-4 max-h-64 overflow-y-auto">
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.dish.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex-1">
                  <p className="font-medium">{item.dish.name}</p>
                  <p className="text-sm text-gray-500">
                    {item.quantity} × ${item.dish.price.toFixed(2)}
                  </p>
                </div>
                <p className="font-semibold text-gray-900">
                  ${(item.quantity * item.dish.price).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between border-t pt-4">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-2xl font-bold text-orange-600">
            ${totalAmount.toFixed(2)}
          </span>
        </div>

        {/* Warning */}
        <Alert className="mt-4 border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-sm text-yellow-800">
            Tienes hasta las 11:30 AM para editar o cancelar tu pedido.
          </AlertDescription>
        </Alert>

        {/* Confirmation Checkbox */}
        <div className="flex items-start space-x-2 pt-4">
          <Checkbox
            id="confirm"
            checked={isConfirmed}
            onCheckedChange={(checked) => setIsConfirmed(checked as boolean)}
          />
          <label
            htmlFor="confirm"
            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Confirmo que he revisado mi pedido y que la información es correcta.
          </label>
        </div>

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Seguir Editando
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!isConfirmed || isSubmitting}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isSubmitting ? 'Confirmando...' : 'Confirmar Pedido'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
