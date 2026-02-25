'use client';

/**
 * MenuGrid Component
 *
 * Displays a grid of dishes with category filtering tabs.
 */

import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DishCard } from './dish-card';
import type { Dish, CartItem } from '@/types';
import type { DishCategory } from '@/types';

interface MenuGridProps {
  dishes: Dish[];
  cartItems: CartItem[];
  onAdd: (dish: Dish) => void;
  onUpdateQuantity: (dishId: string, quantity: number) => void;
  isLoading?: boolean;
}

const categories: Array<{ value: DishCategory; label: string }> = [
  { value: 'platillo', label: 'Platillos' },
  { value: 'bebida', label: 'Bebidas' },
  { value: 'postre', label: 'Postres' },
];

export function MenuGrid({
  dishes,
  cartItems,
  onAdd,
  onUpdateQuantity,
  isLoading = false,
}: MenuGridProps) {
  const [activeTab, setActiveTab] = useState<string>('todos');

  // Filter dishes by category
  const filteredDishes = React.useMemo(() => {
    if (activeTab === 'todos') {
      return dishes;
    }
    return dishes.filter((dish) => dish.category === activeTab);
  }, [dishes, activeTab]);

  // Get cart item for a dish
  const getCartItem = (dishId: string) => {
    return cartItems.find((item) => item.dish.id === dishId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Tabs skeleton */}
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
        {/* Grid skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="aspect-square w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (dishes.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No hay menú disponible para hoy. Contacta al administrador.
        </AlertDescription>
      </Alert>
    );
  }

  if (filteredDishes.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No hay {categories.find((c) => c.value === activeTab)?.label.toLowerCase()} disponibles en el menú de hoy.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-4">
        <TabsTrigger value="todos">Todos</TabsTrigger>
        {categories.map((cat) => (
          <TabsTrigger key={cat.value} value={cat.value}>
            {cat.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={activeTab} className="mt-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDishes.map((dish) => (
            <DishCard
              key={dish.id}
              dish={dish}
              cartItem={getCartItem(dish.id)}
              onAdd={() => onAdd(dish)}
              onUpdateQuantity={(qty) => onUpdateQuantity(dish.id, qty)}
            />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
