import type { PropsWithChildren } from 'react';
import { useCart } from '../features/cart/useCart';

export type { CartItem } from '../features/cart/useCart';

export { useCart };

export const CartProvider = ({ children }: PropsWithChildren) => {
  // Şimdilik yalnızca hook üzerinden yönetiliyor; provider routing/side-effect için yer tutucu.
  useCart();
  return <>{children}</>;
};

