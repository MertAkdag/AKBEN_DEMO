import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Product } from '../../Types/catalog';

interface FavoritesState {
  productIds: string[];
  products: Product[];
  addFavorite: (product: Product) => void;
  removeFavorite: (productId: string) => void;
  toggleFavorite: (product: Product) => void;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      productIds: [],
      products: [],
      addFavorite: (product) => {
        set((state) => {
          if (state.productIds.includes(product.id)) return state;
          return {
            productIds: [...state.productIds, product.id],
            products: [...state.products, product],
          };
        });
      },
      removeFavorite: (productId) => {
        set((state) => ({
          productIds: state.productIds.filter((id) => id !== productId),
          products: state.products.filter((p) => p.id !== productId),
        }));
      },
      toggleFavorite: (product) => {
        const { isFavorite, addFavorite, removeFavorite } = get();
        if (isFavorite(product.id)) {
          removeFavorite(product.id);
        } else {
          addFavorite(product);
        }
      },
      isFavorite: (productId) => get().productIds.includes(productId),
      clearFavorites: () => set({ productIds: [], products: [] }),
    }),
    {
      name: 'golden-erp-favorites',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        productIds: state.productIds,
        products: state.products,
      }),
    },
  ),
);
