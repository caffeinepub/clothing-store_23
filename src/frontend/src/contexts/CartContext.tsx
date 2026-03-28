import { type ReactNode, createContext, useContext, useState } from "react";
import type { Product } from "../backend.d";

export interface CartItem {
  product: Product;
  size: string;
  color: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, size: string, color: string) => void;
  removeItem: (productId: bigint, size: string, color: string) => void;
  updateQuantity: (
    productId: bigint,
    size: string,
    color: string,
    quantity: number,
  ) => void;
  clearCart: () => void;
  total: bigint;
  itemCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product, size: string, color: string) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) =>
          i.product.id === product.id && i.size === size && i.color === color,
      );
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id && i.size === size && i.color === color
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        );
      }
      return [...prev, { product, size, color, quantity: 1 }];
    });
  };

  const removeItem = (productId: bigint, size: string, color: string) => {
    setItems((prev) =>
      prev.filter(
        (i) =>
          !(i.product.id === productId && i.size === size && i.color === color),
      ),
    );
  };

  const updateQuantity = (
    productId: bigint,
    size: string,
    color: string,
    quantity: number,
  ) => {
    if (quantity <= 0) {
      removeItem(productId, size, color);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId && i.size === size && i.color === color
          ? { ...i, quantity }
          : i,
      ),
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce(
    (sum, i) => sum + i.product.price * BigInt(i.quantity),
    0n,
  );

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
