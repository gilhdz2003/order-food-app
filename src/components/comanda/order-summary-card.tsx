/**
 * OrderSummaryCard Component
 *
 * Displays a single order with its items, user info, and action buttons.
 * Includes StatusActions for status changes and PrintLabelButton for printing.
 */

'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, User, Building2, Printer } from 'lucide-react';
import type { OrderStatus } from '@/types';
import { StatusActions } from './status-actions';
import { PrintLabelButton } from './print-label-button';

interface OrderSummaryCardProps {
  order: any;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  onPrint: (orderId: string) => void;
}

const timeStatusConfig: Record<OrderStatus, { label: string; color: string }> = {
  pendiente: { label: 'Pendiente', color: 'text-yellow-600' },
  confirmado: { label: 'Confirmado', color: 'text-blue-600' },
  en_preparacion: { label: 'Preparando', color: 'text-orange-600' },
  listo: { label: 'Listo', color: 'text-green-600' },
  entregado: { label: 'Entregado', color: 'text-gray-600' },
  cancelado: { label: 'Cancelado', color: 'text-red-600' },
};

export function OrderSummaryCard({ order, onStatusChange, onPrint }: OrderSummaryCardProps) {
  const statusInfo = timeStatusConfig[order.status as OrderStatus];
  const orderTime = format(new Date(order.created_at), 'HH:mm', { locale: es });

  return (
    <div className="relative rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Header with order code and time */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900">
              #{order.order_code}
            </h3>
            <span className={`text-sm font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{orderTime}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => onPrint(order.id)}
          className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          title="Imprimir etiqueta"
        >
          <Printer className="h-4 w-4" />
        </button>
      </div>

      {/* User and company info */}
      <div className="mb-3 space-y-1 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <User className="h-3.5 w-3.5 text-gray-400" />
          <span className="font-medium">{order.user?.full_name || 'Usuario'}</span>
        </div>
        {order.company && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building2 className="h-3.5 w-3.5 text-gray-400" />
            <span>{order.company.name}</span>
          </div>
        )}
      </div>

      {/* Order items */}
      <div className="mb-4 space-y-2">
        {order.items?.map((item: any) => (
          <div key={item.id} className="flex justify-between text-sm">
            <div className="flex-1">
              <span className="font-medium text-gray-700">
                {item.quantity}x
              </span>
              <span className="ml-1 text-gray-600">{item.dish?.name}</span>
            </div>
            <span className="text-gray-500">
              ${((item.price_at_order * item.quantity) / 100).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mb-3 flex justify-between border-t border-gray-100 pt-2">
        <span className="font-medium text-gray-700">Total</span>
        <span className="font-bold text-gray-900">
          ${(order.total_amount / 100).toFixed(2)}
        </span>
      </div>

      {/* Status actions */}
      <StatusActions
        orderId={order.id}
        currentStatus={order.status as OrderStatus}
        onStatusChange={onStatusChange}
      />
    </div>
  );
}
