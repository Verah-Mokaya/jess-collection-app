'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  size?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to load cart:', err);
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const addToCart = (item: CartItem) => {
    setItems(prevItems => {
      const existing = prevItems.find(i => i.id === item.id && i.size === item.size);
      if (existing) {
        return prevItems.map(i =>
          i.id === item.id && i.size === item.size ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i
        );
      }
      return [...prevItems, item];
    });
  };

  const removeFromCart = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
