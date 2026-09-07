/**
 * Comanda Dashboard Page
 *
 * Kitchen view for managing orders.
 * Groups orders by status with real-time polling (30s).
 */

'use client';

import { useState, useCallback } from 'react';
import { RefreshCw, Clock, AlertCircle } from 'lucide-react';
import { useComandaPolling } from '@/hooks/useComandaPolling';
import { OrderGroupCard } from '@/components/comanda/order-group-card';
import { updateOrderStatus } from '@/lib/supabase/actions';
import type { OrderStatus } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Status order for display
const statusOrder: OrderStatus[] = ['pendiente', 'confirmado', 'en_preparacion', 'listo', 'entregado'];

export default function ComandaPage() {
  const { orders, lastUpdate, isLoading, error, refresh } = useComandaPolling({
    interval: 30000, // 30 seconds
    enabled: true,
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Group orders by status
  const ordersByStatus = statusOrder.reduce((acc, status) => {
    acc[status] = orders.filter((order) => order.status === status);
    return acc;
  }, {} as Record<OrderStatus, typeof orders>);

  // Handle status change
  const handleStatusChange = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdating(true);
    setUpdatingOrderId(orderId);

    try {
      await updateOrderStatus(orderId, newStatus);
      // Polling will refresh automatically
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Error al actualizar el estado del pedido');
    } finally {
      setIsUpdating(false);
      setUpdatingOrderId(null);
    }
  }, []);

  // Handle print
  const handlePrint = useCallback((orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    // Create printable element and trigger print
    const printContent = document.createElement('div');
    printContent.className = 'print-label-container';
    printContent.innerHTML = generatePrintLabel(order);

    // Store original body content
    const originalContent = document.body.innerHTML;

    // Replace with print content
    document.body.innerHTML = printContent.innerHTML;

    // Add print styles
    const style = document.createElement('style');
    style.textContent = getPrintStyles();
    document.head.appendChild(style);

    // Trigger print
    window.print();

    // Restore original content
    document.body.innerHTML = originalContent;
    document.head.removeChild(style);
  }, [orders]);

  // Generate print label HTML
  const generatePrintLabel = (order: any) => {
    const orderTime = format(new Date(order.created_at), 'HH:mm', { locale: es });

    return `
      <div class="printable-label">
        <div class="text-center border-b-2 border-black pb-2 mb-2">
          <h1 class="text-xl font-bold">PEDIDO #${order.order_code}</h1>
          <p class="text-sm">${orderTime}</p>
        </div>
        <div class="mb-2 border-b border-dashed border-black pb-2">
          <p class="font-bold">${order.user?.full_name || 'Cliente'}</p>
          ${order.company ? `<p class="text-sm">${order.company.name}</p>` : ''}
        </div>
        <div class="mb-2">
          ${order.items?.map((item: any) => `
            <div class="flex justify-between text-sm mb-1">
              <span><strong>${item.quantity}x</strong> ${item.dish?.name}</span>
            </div>
          `).join('')}
        </div>
        <div class="text-center border-t-2 border-black pt-2 mt-2">
          <p class="text-xs">Total: $${(order.total_amount / 100).toFixed(2)}</p>
        </div>
      </div>
    `;
  };

  // Get print styles
  const getPrintStyles = () => {
    return `
      @media print {
        @page {
          size: 80mm 50mm;
          margin: 0;
        }
        body {
          margin: 0;
          padding: 5mm;
          font-family: Arial, sans-serif;
          font-size: 12px;
        }
        .printable-label {
          display: flex;
          flex-direction: column;
          height: 100%;
          justify-content: space-between;
        }
      }
    `;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comanda</h1>
          <p className="text-gray-600">Vista de cocina para gestionar pedidos</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Last update indicator */}
          {lastUpdate && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>
                Actualizado: {format(lastUpdate, 'HH:mm:ss', { locale: es })}
              </span>
            </div>
          )}

          {/* Refresh button */}
          <button
            onClick={refresh}
            disabled={isLoading || isUpdating}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {orders.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-gray-100 p-4">
            <Clock className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No hay pedidos hoy</h3>
          <p className="text-gray-600">Los pedidos aparecerán aquí cuando se creen.</p>
        </div>
      )}

      {/* Orders grouped by status */}
      <div className="space-y-6">
        {statusOrder.map((status) => (
          <OrderGroupCard
            key={status}
            status={status}
            orders={ordersByStatus[status]}
            onStatusChange={handleStatusChange}
            onPrint={handlePrint}
          />
        ))}
      </div>
    </div>
  );
}
