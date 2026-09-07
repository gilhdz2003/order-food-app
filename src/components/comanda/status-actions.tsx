/**
 * StatusActions Component
 *
 * Displays action buttons based on the current order status.
 * Each button triggers a status transition following the pipeline:
 * pendiente → confirmado → en_preparacion → listo → entregado
 */

'use client';

import { useState } from 'react';
import { Check, X, ChefHat, Package, Truck, Loader2 } from 'lucide-react';
import type { OrderStatus } from '@/types';
import { updateOrderStatus, cancelOrderFromComanda, markOrderDelivered } from '@/lib/supabase/actions';

interface StatusActionsProps {
  orderId: string;
  currentStatus: OrderStatus;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => Promise<void>;
}

interface ActionButton {
  label: string;
  newStatus: OrderStatus;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
}

export function StatusActions({ orderId, currentStatus, onStatusChange }: StatusActionsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingTo, setUpdatingTo] = useState<OrderStatus | null>(null);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    setUpdatingTo(newStatus);

    try {
      await onStatusChange(orderId, newStatus);
    } finally {
      setIsUpdating(false);
      setUpdatingTo(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm('¿Cancelar este pedido? El inventario será restaurado.')) {
      return;
    }

    setIsUpdating(true);
    setUpdatingTo('cancelado');

    try {
      await cancelOrderFromComanda(orderId);
      await onStatusChange(orderId, 'cancelado');
    } finally {
      setIsUpdating(false);
      setUpdatingTo(null);
    }
  };

  const handleMarkDelivered = async () => {
    setIsUpdating(true);
    setUpdatingTo('entregado');

    try {
      await markOrderDelivered(orderId);
      await onStatusChange(orderId, 'entregado');
    } finally {
      setIsUpdating(false);
      setUpdatingTo(null);
    }
  };

  // Define available actions per status
  const actionsByStatus: Record<OrderStatus, ActionButton[]> = {
    pendiente: [
      {
        label: 'Confirmar',
        newStatus: 'confirmado',
        icon: <Check className="h-4 w-4" />,
        color: 'bg-blue-100 text-blue-700',
        hoverColor: 'hover:bg-blue-200',
      },
      {
        label: 'Cancelar',
        newStatus: 'cancelado',
        icon: <X className="h-4 w-4" />,
        color: 'bg-red-100 text-red-700',
        hoverColor: 'hover:bg-red-200',
      },
    ],
    confirmado: [
      {
        label: 'A Cocina',
        newStatus: 'en_preparacion',
        icon: <ChefHat className="h-4 w-4" />,
        color: 'bg-orange-100 text-orange-700',
        hoverColor: 'hover:bg-orange-200',
      },
    ],
    en_preparacion: [
      {
        label: 'Marcar Listo',
        newStatus: 'listo',
        icon: <Package className="h-4 w-4" />,
        color: 'bg-green-100 text-green-700',
        hoverColor: 'hover:bg-green-200',
      },
    ],
    listo: [
      {
        label: 'Entregar',
        newStatus: 'entregado',
        icon: <Truck className="h-4 w-4" />,
        color: 'bg-emerald-100 text-emerald-700',
        hoverColor: 'hover:bg-emerald-200',
      },
    ],
    entregado: [],
    cancelado: [],
  };

  const actions = actionsByStatus[currentStatus];

  if (actions.length === 0) {
    return (
      <div className="text-center text-sm text-gray-400">
        {currentStatus === 'entregado' ? 'Entregado' : 'Cancelado'}
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {actions.map((action) => (
        <button
          key={action.newStatus}
          onClick={() =>
            action.newStatus === 'cancelado'
              ? handleCancel()
              : action.newStatus === 'entregado' && currentStatus === 'listo'
                ? handleMarkDelivered()
                : handleStatusChange(action.newStatus)
          }
          disabled={isUpdating}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${action.color} ${action.hoverColor}`}
        >
          {isUpdating && updatingTo === action.newStatus ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            action.icon
          )}
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
}
