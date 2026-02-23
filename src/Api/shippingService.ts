/**
 * Shipping Service
 *
 * Şu an: Mock data ile çalışır.
 * İleriye dönük: axiosClient ile gerçek kargo API'sine bağlanacak.
 * Harici servis entegrasyonu için `trackingUrl` alanı kullanılacak.
 *
 * API geçişi için sadece mock fonksiyonlarını axiosClient çağrılarıyla
 * değiştirmek yeterlidir — arayüz aynı kalacak.
 */

import type { ShippingInfo, ShippingStatus, TrackingEvent } from '../Types/ecommerce-order';

// ─── TODO: API geçişinde bu satırı aktif et ───────────────────────────────────
// import axiosClient from './axiosClient';
// ─────────────────────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Mock veri üretici ───────────────────────────────────────────────────────

function makeMockShipping(orderId: string, orderNumber: string): ShippingInfo {
  const carriers = [
    { name: 'Yurtiçi Kargo', code: 'yurtici', urlTemplate: 'https://www.yurticikargo.com/tr/online-islemler/gonderi-sorgula?code={trackingNo}' },
    { name: 'Aras Kargo', code: 'aras', urlTemplate: 'https://kargotakip.araskargo.com.tr/mainpage.aspx?code={trackingNo}' },
    { name: 'MNG Kargo', code: 'mng', urlTemplate: 'https://www.mngkargo.com.tr/gonderi-sorgulama?code={trackingNo}' },
  ];
  const carrier = carriers[Math.floor(Math.random() * carriers.length)];
  const trackingNo = `MK${Math.floor(Math.random() * 9000000000 + 1000000000)}`;
  const now = new Date();

  const events: TrackingEvent[] = [
    {
      id: 'ev1',
      status: 'PREPARING',
      timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'İstanbul Merkez Şube',
      description: 'Kargo hazırlanıyor, etiket oluşturuldu.',
    },
    {
      id: 'ev2',
      status: 'PICKED_UP',
      timestamp: new Date(now.getTime() - 2.5 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'İstanbul Merkez Şube',
      description: 'Kargo gönderilmek üzere teslim alındı.',
    },
    {
      id: 'ev3',
      status: 'IN_TRANSIT',
      timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'İstanbul Aktarma Merkezi',
      description: 'Kargo aktarma merkezinde işlem görüyor.',
    },
    {
      id: 'ev4',
      status: 'IN_TRANSIT',
      timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Ankara Dağıtım Merkezi',
      description: 'Kargo hedef şehre ulaştı.',
    },
    {
      id: 'ev5',
      status: 'OUT_FOR_DELIVERY',
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      location: 'Ankara Çankaya Şube',
      description: 'Kargo dağıtıma çıktı.',
    },
  ];

  return {
    id: `ship-${orderId}`,
    orderId,
    carrier: carrier.name,
    carrierCode: carrier.code,
    trackingNumber: trackingNo,
    trackingUrl: carrier.urlTemplate.replace('{trackingNo}', trackingNo),
    currentStatus: 'OUT_FOR_DELIVERY',
    estimatedDelivery: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    shippedAt: new Date(now.getTime() - 2.5 * 24 * 60 * 60 * 1000).toISOString(),
    address: {
      fullName: 'Demo Kullanıcı',
      phone: '0532 000 00 00',
      addressLine: 'Kızılay Mah. Atatürk Bulvarı No: 1 Daire: 5',
      city: 'Ankara',
      district: 'Çankaya',
      zipCode: '06420',
    },
    events,
  };
}

// ─── Service ─────────────────────────────────────────────────────────────────

export interface ShippingListResponse {
  success: boolean;
  data: ShippingInfo[];
}

export interface ShippingDetailResponse {
  success: boolean;
  data: ShippingInfo;
}

export interface TrackingRefreshResponse {
  success: boolean;
  data: TrackingEvent[];
  lastUpdated: string;
}

export const shippingService = {
  /**
   * Tüm sevkiyatları getir.
   * TODO: GET /api/v1/shipments
   */
  async getShipments(orderIds: string[]): Promise<ShippingListResponse> {
    await delay(400);
    // TODO: return axiosClient.get('/api/v1/shipments', { params: { orderIds } });
    const data = orderIds.map((id) => makeMockShipping(id, `ORD-${id.slice(-6)}`));
    return { success: true, data };
  },

  /**
   * Tek sevkiyat detayını getir.
   * TODO: GET /api/v1/shipments/:orderId
   */
  async getShipmentByOrderId(orderId: string): Promise<ShippingDetailResponse> {
    await delay(300);
    // TODO: return axiosClient.get(`/api/v1/shipments/${orderId}`);
    return { success: true, data: makeMockShipping(orderId, `ORD-${orderId.slice(-6)}`) };
  },

  /**
   * Kargo takip olaylarını güncelle (harici kargo API'sinden çek).
   * TODO: POST /api/v1/shipments/:orderId/refresh
   */
  async refreshTracking(orderId: string): Promise<TrackingRefreshResponse> {
    await delay(600);
    // TODO: return axiosClient.post(`/api/v1/shipments/${orderId}/refresh`);
    const fresh: TrackingEvent = {
      id: `ev-${Date.now()}`,
      status: 'OUT_FOR_DELIVERY',
      timestamp: new Date().toISOString(),
      location: 'Güncellendi',
      description: 'Kargo son durum güncellendi.',
    };
    return { success: true, data: [fresh], lastUpdated: new Date().toISOString() };
  },
};
