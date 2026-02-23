import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { EcommerceOrder, OrderStatus, OrderItem } from '../../Types/ecommerce-order';
import type { Product } from '../../Types/catalog';

interface OrdersState {
  orders: EcommerceOrder[];
  addOrder: (items: OrderItem[]) => EcommerceOrder;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  cancelOrder: (orderId: string, reason?: string) => void;
  getOrderById: (orderId: string) => EcommerceOrder | undefined;
  reorder: (orderId: string) => OrderItem[];
}

const generateOrderNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `ORD-${year}-${random}`;
};

const createStatusHistory = (status: OrderStatus, note?: string): { status: OrderStatus; timestamp: string; note?: string } => ({
  status,
  timestamp: new Date().toISOString(),
  note,
});

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (items) => {
        const now = new Date().toISOString();
        const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.pricePerUnit, 0);
        const orderNumber = generateOrderNumber();
        
        const newOrder: EcommerceOrder = {
          id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          orderNumber,
          items,
          status: 'PENDING',
          totalAmount,
          statusHistory: [createStatusHistory('PENDING', 'Sipariş oluşturuldu')],
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          orders: [newOrder, ...state.orders],
        }));

        return newOrder;
      },
      updateOrderStatus: (orderId, status, note) => {
        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id !== orderId) return order;
            return {
              ...order,
              status,
              updatedAt: new Date().toISOString(),
              statusHistory: [...order.statusHistory, createStatusHistory(status, note)],
            };
          }),
        }));
      },
      cancelOrder: (orderId, reason) => {
        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id !== orderId) return order;
            return {
              ...order,
              status: 'CANCELLED',
              cancelledAt: new Date().toISOString(),
              cancelledReason: reason,
              updatedAt: new Date().toISOString(),
              statusHistory: [...order.statusHistory, createStatusHistory('CANCELLED', reason || 'Sipariş iptal edildi')],
            };
          }),
        }));
      },
      getOrderById: (orderId) => get().orders.find((o) => o.id === orderId),
      reorder: (orderId) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order) return [];
        return order.items;
      },
    }),
    {
      name: 'golden-erp-orders',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        orders: state.orders,
      }),
    },
  ),
);
