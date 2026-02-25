/**
 * OrderGroupCard Component
 *
 * Displays a group of orders filtered by status.
 * Each order is shown as an OrderSummaryCard.
 */

'use client';

import { OrderStatus } from '@/types';
import { OrderSummaryCard } from './order-summary-card';

interface OrderGroupCardProps {
  status: OrderStatus;
  orders: any[];
  onStatusChange: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  onPrint: (orderId: string) => void;
}

const statusConfig: Record<OrderStatus, { title: string; color: string; bgColor: string; borderColor: string }> = {
  pendiente: {
    title: 'Pendientes',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  confirmado: {
    title: 'Confirmados',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  en_preparacion: {
    title: 'En Preparación',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  listo: {
    title: 'Listos para Entregar',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  entregado: {
    title: 'Entregados',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
  cancelado: {
    title: 'Cancelados',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
};

export function OrderGroupCard({ status, orders, onStatusChange, onPrint }: OrderGroupCardProps) {
  const config = statusConfig[status];

  if (orders.length === 0) {
    return null;
  }

  return (
    <div className={`rounded-lg border-2 ${config.borderColor} ${config.bgColor} p-4`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className={`text-xl font-bold ${config.color}`}>
          {config.title}
          <span className="ml-2 text-sm font-normal opacity-75">
            ({orders.length})
          </span>
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <OrderSummaryCard
            key={order.id}
            order={order}
            onStatusChange={onStatusChange}
            onPrint={onPrint}
          />
        ))}
      </div>
    </div>
  );
}
