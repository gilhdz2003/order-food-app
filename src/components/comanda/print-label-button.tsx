/**
 * PrintLabelButton Component
 *
 * Hidden print button for thermal label printing (80mm x 50mm).
 * Uses @media print CSS for proper formatting.
 */

'use client';

import { useRef, useEffect } from 'react';
import type { OrderWithItems } from '@/types';

interface PrintableLabelProps {
  order: OrderWithItems;
}

// Printable label component (only visible when printing)
function PrintableLabel({ order }: PrintableLabelProps) {
  const orderTime = new Date(order.created_at).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="printable-label">
      {/* Header */}
      <div className="text-center border-b-2 border-black pb-2 mb-2">
        <h1 className="text-xl font-bold">PEDIDO #{order.order_code}</h1>
        <p className="text-sm">{orderTime}</p>
      </div>

      {/* Customer Info */}
      <div className="mb-2 border-b border-dashed border-black pb-2">
        <p className="font-bold">{order.user?.full_name || 'Cliente'}</p>
        {order.company && (
          <p className="text-sm">{order.company.name}</p>
        )}
      </div>

      {/* Items */}
      <div className="mb-2">
        {order.items?.map((item) => (
          <div key={item.id} className="flex justify-between text-sm mb-1">
            <span>
              <strong>{item.quantity}x</strong> {item.dish?.name}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center border-t-2 border-black pt-2 mt-2">
        <p className="text-xs">
          Total: ${(order.total_amount / 100).toFixed(2)}
        </p>
      </div>
    </div>
  );
}

interface PrintLabelButtonProps {
  orderId: string;
  order: OrderWithItems;
}

export function PrintLabelButton({ orderId, order }: PrintLabelButtonProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Hidden printable label - only visible during print */}
      <div ref={printRef} className="hidden print:block print-label-container">
        <PrintableLabel order={order} />
      </div>

      {/* Inline print styles for thermal label (80mm x 50mm) */}
      <style jsx global>{`
        @media print {
          @page {
            size: 80mm 50mm;
            margin: 0;
          }

          body * {
            visibility: hidden;
          }

          .print-label-container,
          .print-label-container * {
            visibility: visible;
          }

          .print-label-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            height: 50mm;
            padding: 5mm;
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: black;
            background: white;
          }

          .printable-label {
            display: flex;
            flex-direction: column;
            height: 100%;
            justify-content: space-between;
          }

          .printable-label h1 {
            margin: 0;
            font-size: 16px;
          }

          .printable-label p {
            margin: 2px 0;
          }

          .printable-label .text-xs {
            font-size: 10px;
          }

          .printable-label .text-sm {
            font-size: 11px;
          }

          .printable-label .font-bold {
            font-weight: bold;
          }

          /* Hide all other elements during print */
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}

// Export a hook-based version for easier use in components
export function usePrintLabel() {
  const handlePrint = () => {
    window.print();
  };

  return { handlePrint };
}
