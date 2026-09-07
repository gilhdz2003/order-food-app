'use client';

/**
 * DishCard Component
 *
 * Displays a single dish with image, name, price, and availability badge.
 * Allows adding to cart with quantity controls.
 */

import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import type { Dish, CartItem } from '@/types';

interface DishCardProps {
  dish: Dish;
  cartItem?: CartItem;
  onAdd: () => void;
  onUpdateQuantity: (quantity: number) => void;
}

const categoryColors: Record<string, string> = {
  platillo: 'bg-orange-500',
  bebida: 'bg-blue-500',
  postre: 'bg-pink-500',
};

export function DishCard({ dish, cartItem, onAdd, onUpdateQuantity }: DishCardProps) {
  const quantity = cartItem?.quantity || 0;
  const isSoldOut = dish.available_quantity === 0;
  const isLowStock = dish.available_quantity > 0 && dish.available_quantity < 5;

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {dish.image_url ? (
          <Image
            src={dish.image_url}
            alt={dish.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            <svg
              className="h-16 w-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
        )}

        {/* Category Badge */}
        <Badge
          className={`absolute left-2 top-2 text-white ${
            categoryColors[dish.category] || 'bg-gray-500'
          }`}
        >
          {dish.category}
        </Badge>

        {/* Availability Badges */}
        {isSoldOut && (
          <Badge className="absolute right-2 top-2 bg-red-500 text-white">
            Agotado
          </Badge>
        )}
        {isLowStock && (
          <Badge className="absolute right-2 top-2 bg-yellow-500 text-white">
            Quedan {dish.available_quantity}
          </Badge>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-1">{dish.name}</h3>
        {dish.description && (
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
            {dish.description}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <p className="text-lg font-bold text-orange-600">
            ${dish.price.toFixed(2)}
          </p>

          {/* Quantity Controls or Add Button */}
          {quantity > 0 ? (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateQuantity(quantity - 1)}
                disabled={isSoldOut}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateQuantity(quantity + 1)}
                disabled={isSoldOut || quantity >= dish.available_quantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={onAdd}
              disabled={isSoldOut}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Agregar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
