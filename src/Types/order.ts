export type OrderStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';


export interface OrderProduct {
  id: string;
  name: string;
  model: string;
  status: string;
  location: string;
  runtime: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface AssignedUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'TECHNICIAN' | 'USER';
}

export interface Order {
  id: string;
  title: string;
  description: string;
  status: OrderStatus;
  assignedTo: string;
  deadline: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  product: OrderProduct;
  assignedUser: AssignedUser;
}

export interface OrdersResponse {
  success: boolean;
  data: Order[];
  meta?: {
    pagination: {
      total: number;
      limit: number;
      currentPage: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      nextPage: number | null;
      previousPage: number | null;
    };
  };
}

export interface OrderDetailResponse {
  success: boolean;
  data: Order;
}

export interface UpdateOrderPayload {
  status?: OrderStatus;
  title?: string;
  description?: string;
  deadline?: string;
  assignedTo?: string;
  productId?: string;
}

export type OrderFilterOption = 'All' | 'Pending' | 'In-Progress' | 'Completed';

export const filterToStatus: Record<OrderFilterOption, OrderStatus | null> = {
  'All': null,
  'Pending': 'PENDING',
  'In-Progress': 'IN_PROGRESS',
  'Completed': 'COMPLETED',
};

export const statusToDisplay: Record<OrderStatus, string> = {
  'PENDING': 'Bekleyen',
  'IN_PROGRESS': 'Üretimde',
  'COMPLETED': 'Tamamlandı',
};
