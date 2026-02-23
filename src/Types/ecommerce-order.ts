import type { Product } from './catalog';

/** Sipariş durumları */
export type OrderStatus =
  | 'PENDING'      // Beklemede
  | 'CONFIRMED'    // Onaylandı
  | 'PROCESSING'   // Hazırlanıyor
  | 'SHIPPED'      // Kargoya verildi
  | 'DELIVERED'    // Teslim edildi
  | 'CANCELLED';   // İptal edildi

/** Kargo durumları */
export type ShippingStatus =
  | 'PREPARING'    // Hazırlanıyor
  | 'PICKED_UP'    // Teslim alındı
  | 'IN_TRANSIT'   // Taşımada
  | 'OUT_FOR_DELIVERY' // Dağıtımda
  | 'DELIVERED'    // Teslim edildi
  | 'FAILED'       // Teslim edilemedi
  | 'RETURNED';    // İade edildi

/** Kargo takip olayı */
export interface TrackingEvent {
  id: string;
  status: ShippingStatus;
  timestamp: string;
  location: string;
  description: string;
}

/** Teslimat adresi */
export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  district: string;
  zipCode: string;
}

/** Kargo/sevkiyat bilgisi */
export interface ShippingInfo {
  id: string;
  orderId: string;
  carrier: string;           // "Yurtiçi Kargo" | "Aras Kargo" | "MNG Kargo"
  carrierCode: string;       // "yurtici" | "aras" | "mng" — harici servis için
  trackingNumber: string;
  trackingUrl?: string;      // Harici kargo takip URL'si (ileriye dönük)
  currentStatus: ShippingStatus;
  estimatedDelivery?: string;
  shippedAt: string;
  deliveredAt?: string;
  address: ShippingAddress;
  events: TrackingEvent[];
}

/** Sipariş durum zaman çizelgesi kaydı */
export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

/** Sipariş öğesi */
export interface OrderItem {
  product: Product;
  quantity: number;
  pricePerUnit: number;
}

/** E-ticaret siparişi */
export interface EcommerceOrder {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  statusHistory: OrderStatusHistory[];
  shippingInfo?: ShippingInfo;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  cancelledReason?: string;
}

/** Sipariş filtreleme */
export type OrderFilter = 'ALL' | OrderStatus;

/** Sevkiyat filtreleme */
export type ShippingFilter = 'ALL' | ShippingStatus;
