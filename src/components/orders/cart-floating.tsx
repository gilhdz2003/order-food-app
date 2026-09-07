'use client';

/**
 * CartFloating Component
 *
 * Floating cart button in bottom-right corner with bounce animation.
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';

interface CartFloatingProps {
  itemCount: number;
  totalAmount: number;
  onClick: () => void;
  isVisible?: boolean;
}

export function CartFloating({
  itemCount,
  totalAmount,
  onClick,
  isVisible = true,
}: CartFloatingProps) {
  if (!isVisible || itemCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        size="lg"
        onClick={onClick}
        className="relative h-16 rounded-full bg-orange-600 px-6 shadow-lg transition-all hover:bg-orange-700 hover:shadow-xl animate-bounce-gentle"
      >
        <ShoppingCart className="h-6 w-6" />
        <Badge className="absolute -right-1 -top-1 h-7 w-7 rounded-full bg-white text-orange-600 text-sm font-bold">
          {itemCount}
        </Badge>
        <span className="ml-2 text-lg font-bold">
          ${totalAmount.toFixed(2)}
        </span>
      </Button>

      <style jsx>{`
        @keyframes bounce-gentle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
