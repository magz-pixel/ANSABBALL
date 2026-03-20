"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getProductById,
  lineKey,
  type Product,
} from "@/lib/merchandise";

const STORAGE_KEY = "ansa-merch-cart-v1";

export interface CartLine {
  productId: string;
  size?: string;
  quantity: number;
}

interface CartContextValue {
  lines: CartLine[];
  addItem: (productId: string, quantity?: number, size?: string) => void;
  setQuantity: (productId: string, quantity: number, size?: string) => void;
  removeLine: (productId: string, size?: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotalKes: number;
  linesWithProducts: { line: CartLine; product: Product }[];
}

const CartContext = createContext<CartContextValue | null>(null);

function loadInitial(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is CartLine =>
        x &&
        typeof x === "object" &&
        typeof (x as CartLine).productId === "string" &&
        typeof (x as CartLine).quantity === "number" &&
        (x as CartLine).quantity > 0
    );
  } catch {
    return [];
  }
}

export function MerchandiseCartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setLines(loadInitial());
      setHydrated(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const addItem = useCallback(
    (productId: string, quantity = 1, size?: string) => {
      const product = getProductById(productId);
      if (!product) return;
      const defaultSize = product.sizes?.[0];
      const resolvedSize = product.sizes?.length ? size ?? defaultSize : undefined;

      setLines((prev) => {
        const key = lineKey(productId, resolvedSize);
        const idx = prev.findIndex(
          (l) => lineKey(l.productId, l.size) === key
        );
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = {
            ...next[idx],
            quantity: next[idx].quantity + quantity,
          };
          return next;
        }
        return [...prev, { productId, quantity, size: resolvedSize }];
      });
    },
    []
  );

  const setQuantity = useCallback(
    (productId: string, quantity: number, size?: string) => {
      const key = lineKey(productId, size);
      setLines((prev) => {
        if (quantity <= 0) {
          return prev.filter((l) => lineKey(l.productId, l.size) !== key);
        }
        return prev.map((l) =>
          lineKey(l.productId, l.size) === key ? { ...l, quantity } : l
        );
      });
    },
    []
  );

  const removeLine = useCallback((productId: string, size?: string) => {
    const key = lineKey(productId, size);
    setLines((prev) =>
      prev.filter((l) => lineKey(l.productId, l.size) !== key)
    );
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const value = useMemo((): CartContextValue => {
    const linesWithProducts: { line: CartLine; product: Product }[] = [];
    let subtotalKes = 0;
    let itemCount = 0;
    for (const line of lines) {
      const product = getProductById(line.productId);
      if (!product) continue;
      linesWithProducts.push({ line, product });
      subtotalKes += product.priceKes * line.quantity;
      itemCount += line.quantity;
    }
    return {
      lines,
      addItem,
      setQuantity,
      removeLine,
      clearCart,
      itemCount,
      subtotalKes,
      linesWithProducts,
    };
  }, [lines, addItem, setQuantity, removeLine, clearCart]);

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useMerchCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useMerchCart must be used within MerchandiseCartProvider");
  }
  return ctx;
}
