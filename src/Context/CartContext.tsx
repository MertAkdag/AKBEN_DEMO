import React, { createContext, useContext, useState, useCallback, useMemo, PropsWithChildren } from 'react';
import { Product } from '../Types/catalog';

/* ═══════════════════════════════════════════
   Sepet Öğesi Tipi
   ═══════════════════════════════════════════ */
export interface CartItem {
  product: Product;
  quantity: number;
}

/* ═══════════════════════════════════════════
   Context Arayüzü
   ═══════════════════════════════════════════ */
interface CartContextType {
  items: CartItem[];
  /** Sepetteki toplam ürün adedi */
  totalCount: number;
  /** Ürün zaten sepette mi? */
  isInCart: (productId: string) => boolean;
  /** Sepete ürün ekle (varsa miktarı artır) */
  addToCart: (product: Product) => void;
  /** Sepetteki ürün miktarını güncelle */
  updateQuantity: (productId: string, quantity: number) => void;
  /** Sepetten ürün kaldır */
  removeFromCart: (productId: string) => void;
  /** Sepeti tamamen temizle */
  clearCart: () => void;
}

const CartContext = createContext<CartContextType>({
  items: [],
  totalCount: 0,
  isInCart: () => false,
  addToCart: () => {},
  updateQuantity: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
});

export const useCart = () => useContext(CartContext);

/* ═══════════════════════════════════════════
   Provider
   ═══════════════════════════════════════════ */
export const CartProvider = ({ children }: PropsWithChildren) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const totalCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  const isInCart = useCallback(
    (productId: string) => items.some((i) => i.product.id === productId),
    [items],
  );

  const addToCart = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((i) => i.product.id !== productId);
      return prev.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i,
      );
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo(
    () => ({ items, totalCount, isInCart, addToCart, updateQuantity, removeFromCart, clearCart }),
    [items, totalCount, isInCart, addToCart, updateQuantity, removeFromCart, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
