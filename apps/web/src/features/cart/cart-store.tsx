"use client";

import type { CartItemInput } from "@fominiapp/shared";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";

interface CartContextValue {
  items: CartItemInput[];
  count: number;
  addItem: (productId: number, qtyRequested: number, itemComment?: string) => void;
  updateItem: (productId: number, qtyRequested: number, itemComment?: string) => void;
  removeItem: (productId: number) => void;
  clear: () => void;
}

const STORAGE_KEY = "fominiapp-cart";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItemInput[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setItems(JSON.parse(stored) as CartItemInput[]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((total, item) => total + item.qtyRequested, 0),
      addItem(productId, qtyRequested, itemComment) {
        setItems((current) => {
          const existing = current.find((item) => item.productId === productId);
          if (existing) {
            return current.map((item) =>
              item.productId === productId
                ? {
                    ...item,
                    qtyRequested: Number((item.qtyRequested + qtyRequested).toFixed(2)),
                    itemComment: itemComment ?? item.itemComment
                  }
                : item
            );
          }

          return [...current, { productId, qtyRequested, itemComment }];
        });
      },
      updateItem(productId, qtyRequested, itemComment) {
        setItems((current) =>
          qtyRequested <= 0
            ? current.filter((item) => item.productId !== productId)
            : current.map((item) =>
                item.productId === productId ? { ...item, qtyRequested, itemComment } : item
              )
        );
      },
      removeItem(productId) {
        setItems((current) => current.filter((item) => item.productId !== productId));
      },
      clear() {
        setItems([]);
      }
    }),
    [items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
