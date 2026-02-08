import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../Api/orderService';
import { 
  Order, 
  OrderStatus, 
  UpdateOrderPayload,
  OrderFilterOption,
  filterToStatus 
} from '../Types/order';


const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: { status?: OrderStatus | null; search?: string }) => 
    [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

export function useOrdersList() {
  return useQuery({
    queryKey: orderKeys.lists(),
    queryFn: () => orderService.getOrders(),
    staleTime: 1000 * 60 * 2,
    select: (data) => data.data,
  });
}

export function useFilteredOrders(filter: OrderFilterOption, searchQuery: string = '') {
  const { data: orders, ...rest } = useOrdersList();

  const filteredOrders = orders?.filter((order) => {
    const statusFilter = filterToStatus[filter];
    const matchesStatus = statusFilter === null || order.status === statusFilter;

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      order.title.toLowerCase().includes(searchLower) ||
      order.assignedUser.name.toLowerCase().includes(searchLower) ||
      order.machine.name.toLowerCase().includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  return {
    orders: filteredOrders || [],
    ...rest,
  };
}


export function useOrderDetail(id: string | null) {
  return useQuery({
    queryKey: orderKeys.detail(id || ''),
    queryFn: () => orderService.getOrderById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 1,
    select: (data) => data.data,
  });
}


export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateOrderPayload }) =>
      orderService.updateOrder(id, payload),

    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: orderKeys.lists() });
      await queryClient.cancelQueries({ queryKey: orderKeys.detail(id) });

      const previousOrders = queryClient.getQueryData(orderKeys.lists());
      const previousDetail = queryClient.getQueryData(orderKeys.detail(id));

      queryClient.setQueryData(orderKeys.lists(), (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((order: Order) =>
            order.id === id ? { ...order, ...payload } : order
          ),
        };
      });

      queryClient.setQueryData(orderKeys.detail(id), (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: { ...old.data, ...payload },
        };
      });

      return { previousOrders, previousDetail };
    },

    onError: (_err, { id }, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(orderKeys.lists(), context.previousOrders);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(orderKeys.detail(id), context.previousDetail);
      }
    },

    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
    },
  });
}
