import type { OrderStatus } from '../../../src/Types/ecommerce-order';

export const getStatusInfo = (status: OrderStatus) => {
  switch (status) {
    case 'PENDING':
      return { label: 'Beklemede', color: '#F59E0B', icon: 'time-outline' as const };
    case 'CONFIRMED':
      return { label: 'Onaylandı', color: '#3B82F6', icon: 'checkmark-circle-outline' as const };
    case 'PROCESSING':
      return { label: 'Hazırlanıyor', color: '#8B5CF6', icon: 'construct-outline' as const };
    case 'SHIPPED':
      return { label: 'Kargoda', color: '#06B6D4', icon: 'car-outline' as const };
    case 'DELIVERED':
      return { label: 'Teslim Edildi', color: '#10B981', icon: 'checkmark-done-circle' as const };
    case 'CANCELLED':
      return { label: 'İptal Edildi', color: '#EF4444', icon: 'close-circle-outline' as const };
    default:
      return { label: 'Bilinmiyor', color: '#6B7280', icon: 'help-circle-outline' as const };
  }
};
