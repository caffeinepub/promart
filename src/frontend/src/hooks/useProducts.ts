import { useEffect, useState } from "react";
import { sampleProducts } from "../lib/sampleData";
import type { Product } from "../lib/types";

const STORAGE_KEY = "promart_products";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      /* ignore */
    }
    return sampleProducts;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  const addProduct = (p: Product) => setProducts((prev) => [p, ...prev]);

  const updateProduct = (updated: Product) =>
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

  const deleteProduct = (id: string) =>
    setProducts((prev) => prev.filter((p) => p.id !== id));

  const importProducts = (newProducts: Product[]) =>
    setProducts((prev) => [...prev, ...newProducts]);

  return { products, addProduct, updateProduct, deleteProduct, importProducts };
}
