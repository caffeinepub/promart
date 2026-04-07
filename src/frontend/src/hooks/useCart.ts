import { useEffect, useState } from "react";
import type { CartItem, Product } from "../lib/types";

const STORAGE_KEY = "promart_cart";

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      /* ignore */
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing)
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) =>
    setCart((prev) => prev.filter((i) => i.product.id !== id));

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.product.id === id ? { ...i, quantity: qty } : i)),
    );
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const count = cart.reduce((sum, i) => sum + i.quantity, 0);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    total,
    count,
  };
}
