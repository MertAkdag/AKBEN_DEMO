import {
  OrdersResponse,
  OrderDetailResponse,
  UpdateOrderPayload,
  Order,
} from '../Types/order';
import { getMockOrders, getMockOrderById, updateMockOrder } from './mockData';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const orderService = {
  async getOrders(page = 1, pageSize = 20): Promise<OrdersResponse> {
    await delay(350);
    return getMockOrders(page, pageSize);
  },

  async getOrderById(id: string): Promise<OrderDetailResponse> {
    await delay(300);
    const result = getMockOrderById(id);
    if (!result) throw new Error('İş emri bulunamadı');
    return result;
  },

  async updateOrder(id: string, payload: UpdateOrderPayload): Promise<OrderDetailResponse> {
    await delay(400);
    const result = updateMockOrder(id, payload);
    if (!result) throw new Error('İş emri güncellenemedi');
    return result;
  },

  async createOrder(payload: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'machine' | 'assignedUser'>): Promise<OrderDetailResponse> {
    await delay(400);
    throw new Error('Mock modunda createOrder desteklenmiyor');
  },
};
