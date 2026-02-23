import { useCallback, useMemo } from 'react';
import { useCartStore } from '../../store/cart/cartStore';
import { CartItem as CartItemEntity } from '../../domain/entities/CartItem';
import { CheckoutUseCase } from '../../domain/use-cases/cart/CheckoutUseCase';
import { CatalogPriceService } from '../../infrastructure/services/PriceService';
import { backgroundSyncQueue } from '../../infrastructure/services/BackgroundSyncQueue';

const priceService = new CatalogPriceService();
const checkoutUseCase = new CheckoutUseCase(priceService);

export type CartItem = CartItemEntity;

export function useCart() {
  const itemsState = useCartStore((s) => s.items);
  const totalCount = useCartStore((s) => s.totalCount);
  const addToCart = useCartStore((s) => s.addToCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const clearCart = useCartStore((s) => s.clearCart);
  const isInCart = useCartStore((s) => s.isInCart);

  const items = useMemo(
    () =>
      itemsState.map(
        (i) =>
          new CartItemEntity(
            i.product,
            i.quantity,
            i.capturedPricePerUnit,
            new Date(i.capturedAt),
          ),
      ),
    [itemsState],
  );

  const checkout = useCallback(async () => {
    if (!items.length) {
      return { priceChanges: [], queued: false as const };
    }

    const result = await checkoutUseCase.execute({ items });

    let queued = false;
    if (result.priceChanges.length === 0) {
      try {
        await backgroundSyncQueue.add({
          type: 'CREATE_ORDER',
          payload: {
            items: itemsState,
            createdAt: new Date().toISOString(),
          },
          priority: 1,
        });
        queued = true;
      } catch {
        queued = false;
      }
    }

    return { ...result, queued };
  }, [items, itemsState]);

  return {
    items,
    totalCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    isInCart,
    checkout,
  };
}


