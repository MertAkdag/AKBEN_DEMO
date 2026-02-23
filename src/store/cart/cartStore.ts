import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Product } from '../../Types/catalog';

export interface CartItemState {
  product: Product;
  quantity: number;
  capturedPricePerUnit: number;
  capturedAt: string;
}

interface CartState {
  items: CartItemState[];
  totalCount: number;
  addToCart: (product: Product) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalCount: 0,
      addToCart: (product) => {
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          if (existing) {
            const items = state.items.map((i) =>
              i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
            );
            const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
            return { items, totalCount };
          }
          const now = new Date().toISOString();
          const items = [
            ...state.items,
            {
              product,
              quantity: 1,
              capturedPricePerUnit: product.pricePerUnit,
              capturedAt: now,
            },
          ];
          const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
          return { items, totalCount };
        });
      },
      updateQuantity: (productId, quantity) => {
        set((state) => {
          const items =
            quantity <= 0
              ? state.items.filter((i) => i.product.id !== productId)
              : state.items.map((i) =>
                  i.product.id === productId ? { ...i, quantity } : i,
                );
          const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
          return { items, totalCount };
        });
      },
      removeFromCart: (productId) => {
        set((state) => {
          const items = state.items.filter((i) => i.product.id !== productId);
          const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
          return { items, totalCount };
        });
      },
      clearCart: () => set({ items: [], totalCount: 0 }),
      isInCart: (productId) => get().items.some((i) => i.product.id === productId),
    }),
    {
      name: 'golden-erp-cart',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        items: state.items,
        totalCount: state.totalCount,
      }),
    },
  ),
);

