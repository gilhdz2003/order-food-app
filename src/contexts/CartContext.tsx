'use client';

/**
 * Shopping Cart Context
 *
 * Manages the local state of the employee's shopping cart.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Dish, CartItem } from '@/types';

interface CartContextType {
  items: CartItem[];
  addItem: (dish: Dish) => void;
  removeItem: (dishId: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalAmount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((dish: Dish) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.dish.id === dish.id);

      if (existing) {
        // Increment quantity if already exists
        return prev.map((item) =>
          item.dish.id === dish.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      // Add new item
      return [...prev, { dish, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((dishId: string) => {
    setItems((prev) => prev.filter((item) => item.dish.id !== dishId));
  }, []);

  const updateQuantity = useCallback((dishId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(dishId);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.dish.id === dishId ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getTotalItems = useCallback(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const getTotalAmount = useCallback(() => {
    return items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
