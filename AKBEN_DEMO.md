# AKBEN Demo — Proje Dökümanı

> B2B Kuyumcu ERP & Marketplace Mobil Uygulaması  
> Platform: React Native + Expo  
> Versiyon: 2.0 | Şubat 2026

---

## İçindekiler

1. [Proje Özeti](#1-proje-özeti)
2. [Teknoloji Stack](#2-teknoloji-stack)
3. [Klasör Yapısı](#3-klasör-yapısı)
4. [Ekranlar & Durum Matrisi](#4-ekranlar--durum-matrisi)
5. [State Yönetimi](#5-state-yönetimi)
6. [API Katmanı](#6-api-katmanı)
7. [Navigation Yapısı](#7-navigation-yapısı)
8. [Bileşen Kütüphanesi](#8-bileşen-kütüphanesi)
9. [Tema & Tasarım Sistemi](#9-tema--tasarım-sistemi)
10. [Mock → Gerçek API Geçişi](#10-mock--gerçek-api-geçişi)
11. [Eksikler & Gelecek Planı](#11-eksikler--gelecek-planı)

---

## 1. Proje Özeti

AKBEN Demo, kuyumcu sektörüne yönelik B2B bir ERP ve e-ticaret uygulamasıdır.  
Kullanıcılar ürün kataloğunu inceleyebilir, sipariş oluşturabilir, kargo takibi yapabilir, altın/döviz fiyatlarını canlı takip edebilir.

### Özellikler

| Modül | Durum |
|---|---|
| Giriş / Onboarding | ✅ Tamamlandı |
| Ana Sayfa (Dashboard) | ✅ Tamamlandı |
| Ürün Kataloğu | ✅ Tamamlandı |
| Sepet | ✅ Tamamlandı |
| Siparişler | ✅ Tamamlandı |
| Sevkiyat & Kargo Takip | ✅ Tamamlandı |
| Favoriler | ✅ Tamamlandı |
| Bildirimler | ✅ Tamamlandı |
| Profil & Hesap | ✅ Tamamlandı |
| Cariler / Finans | ✅ Kısmi (mock) |
| İşlem Geçmişi | ✅ Kısmi (mock) |

---

## 2. Teknoloji Stack

| Paket | Versiyon | Kullanım |
|---|---|---|
| React Native | 0.76+ | Temel platform |
| Expo SDK | 52 | Build & servisler |
| Expo Router | 4 | File-based navigation |
| Zustand | 5 | Global state management |
| @tanstack/react-query | 5 | Server state / data fetching |
| Axios | - | HTTP client |
| Socket.IO Client | - | Canlı altın fiyatları |
| React Native Reanimated | 3 | Animasyonlar |
| React Native Gesture Handler | 2 | Gesture desteği |
| expo-image | - | Optimize görsel yükleme |
| AsyncStorage | - | Yerel veri saklama |
| react-native-safe-area-context | - | Safe area desteği |
| Ionicons | - | İkon seti |

---

## 3. Klasör Yapısı

```
AKBEN_DEMO/
├── app/                        # Expo Router ekranları
│   ├── (auth)/                 # Auth grubu (header yok)
│   │   ├── login.tsx           # Giriş ekranı
│   │   ├── forgot-password.tsx # Şifremi Unuttum
│   │   └── reset-password.tsx  # Şifre Sıfırlama
│   ├── (tabs)/                 # Tab navigator
│   │   ├── dashboard.tsx       # Ana sayfa
│   │   ├── catalog.tsx         # Ürün listesi
│   │   ├── cart.tsx            # Sepet
│   │   ├── favorites.tsx       # Favoriler
│   │   └── profile.tsx         # Profil
│   ├── catalog/
│   │   └── [id].tsx            # Ürün detay
│   ├── orders.tsx              # Sipariş listesi
│   ├── orders/
│   │   ├── [id].tsx            # Sipariş detay
│   │   └── components/
│   │       └── OrderStatusTimeline.tsx
│   ├── shipping/
│   │   ├── index.tsx           # Sevkiyat listesi
│   │   └── [id].tsx            # Sevkiyat detay & kargo takip
│   ├── notifications.tsx       # Bildirim listesi
│   ├── notifications/
│   │   ├── [id].tsx            # Bildirim detay
│   │   └── settings.tsx        # Bildirim ayarları
│   ├── profile/
│   │   ├── edit.tsx            # Profil düzenleme
│   │   └── change-password.tsx # Şifre değiştirme
│   ├── onboarding.tsx          # 3 aşamalı tanıtım slider
│   ├── index.tsx               # Splash + onboarding kontrol
│   ├── _layout.tsx             # Root layout
│   ├── cariler/                # Cari yönetimi
│   ├── transactions/           # İşlem geçmişi
│   └── dashboard-details.tsx   # ERP özet istatistikler
│
├── src/
│   ├── Api/                    # API servisleri
│   │   ├── axiosClient.ts      # Axios instance (token interceptor)
│   │   ├── catalogService.ts   # Ürün API
│   │   ├── shippingService.ts  # Sevkiyat API (mock + API-ready)
│   │   └── mockData.ts         # Mock veri üreticileri
│   ├── Components/
│   │   ├── Cards/
│   │   │   ├── ProductCard.tsx          # Ürün kartı
│   │   │   └── ProductOfWeekSlider.tsx  # Öne çıkan slider
│   │   ├── Modals/
│   │   │   ├── VariantSelectModal.tsx   # Varyant seçim modalı
│   │   │   └── PriceDetailModal.tsx     # Fiyat detay modalı
│   │   └── Ui/
│   │       ├── Input.tsx, Button.tsx, Skeleton.tsx, ErrorState.tsx
│   ├── Constants/
│   │   ├── Theme.ts            # Renk paleti (light/dark)
│   │   └── Spacing.ts          # Padding/margin sabitleri
│   ├── Context/
│   │   ├── ThemeContext.tsx     # Tema (light/dark toggle)
│   │   ├── AuthContext.tsx      # Giriş/çıkış durumu
│   │   ├── CartContext.tsx      # Sepet (context wrapper)
│   │   └── GoldPriceContext.tsx # Canlı altın fiyatı
│   ├── Hooks/
│   │   ├── useCatalog.ts       # React Query hooks
│   │   └── UseResponsive.ts    # Responsive font/boyut
│   ├── Shared/
│   │   └── Header.tsx          # ScreenHeader bileşeni
│   ├── store/
│   │   ├── cart/
│   │   │   └── cartStore.ts    # Zustand sepet store
│   │   ├── favorites/
│   │   │   └── favoritesStore.ts # Zustand favoriler store
│   │   └── orders/
│   │       └── ordersStore.ts  # Zustand sipariş store
│   ├── Types/
│   │   ├── catalog.ts          # Ürün, Kategori, Varyant tipleri
│   │   └── ecommerce-order.ts  # Sipariş, Sevkiyat, Kargo tipleri
│   ├── Utils/
│   │   └── haptics.ts          # Haptic feedback
│   └── features/
│       └── auth/
│           └── useAuth.ts      # Auth hook
│
└── assets/                     # Görseller, fontlar
```

---

## 4. Ekranlar & Durum Matrisi

### Giriş Akışı

| Ekran | Dosya | Durum | API |
|---|---|---|---|
| Splash | `app/index.tsx` | ✅ | — |
| Onboarding Slider | `app/onboarding.tsx` | ✅ | — |
| Giriş Yap | `app/(auth)/login.tsx` | ✅ | Mock |
| Şifremi Unuttum | `app/(auth)/forgot-password.tsx` | ✅ | Mock → `POST /auth/forgot-password` |
| Şifre Sıfırlama | `app/(auth)/reset-password.tsx` | ✅ | Mock → `POST /auth/reset-password` |

### Ana Sayfa

| Bölüm | Durum | API |
|---|---|---|
| Arama çubuğu | ✅ | Mock |
| Kategori chips | ✅ | Mock |
| Promosyon banner | ✅ | Mock → `GET /banners` |
| Günün fırsatları | ✅ | Mock → `GET /products?featured=true` |
| Anlık altın/döviz fiyatları | ✅ | Socket.IO |

### Ürünler

| Ekran | Dosya | Durum | API |
|---|---|---|---|
| Ürün Listesi | `app/(tabs)/catalog.tsx` | ✅ | Mock → `GET /products` |
| Ürün Arama | catalog.tsx içinde | ✅ | Mock |
| Ürün Filtreleme | catalog.tsx içinde | ✅ | Mock |
| Ürün Detay | `app/catalog/[id].tsx` | ✅ | Mock → `GET /products/:id` |
| Varyant Seçim Modalı | `src/Components/Modals/VariantSelectModal.tsx` | ✅ | Mock → `GET /variants` |
| Fiyat Detay Modalı | `src/Components/Modals/PriceDetailModal.tsx` | ✅ | Mock → `GET /products/:id/price-breakdown` |

### Sepet

| Özellik | Durum |
|---|---|
| Ürün ekleme/çıkarma | ✅ |
| Adet güncelleme | ✅ |
| Ürün silme onayı | ✅ |
| Fiyat değişimi uyarısı | ✅ |
| Sipariş oluşturma | ✅ |

### Siparişler

| Ekran | Dosya | Durum |
|---|---|---|
| Sipariş Listesi | `app/orders.tsx` | ✅ |
| Sipariş Filtreleme | orders.tsx içinde | ✅ |
| Sipariş Detay | `app/orders/[id].tsx` | ✅ |
| Durum Zaman Çizelgesi | `app/orders/components/OrderStatusTimeline.tsx` | ✅ |
| Sipariş İptal | orders/[id].tsx içinde | ✅ |
| Tekrar Sipariş | orders/[id].tsx içinde | ✅ |
| Kargo Takip Butonu | orders/[id].tsx içinde | ✅ |

### Sevkiyat

| Ekran | Dosya | Durum | API |
|---|---|---|---|
| Sevkiyat Listesi | `app/shipping/index.tsx` | ✅ | Mock → `GET /shipments` |
| Sevkiyat Detay | `app/shipping/[id].tsx` | ✅ | Mock → `GET /shipments/:orderId` |
| Kargo Hareketleri | shipping/[id].tsx içinde | ✅ | Mock → `GET /shipments/:orderId/events` |
| Harici Takip Linki | shipping/[id].tsx içinde | ✅ | Linking API |
| Takip Yenile | shipping/[id].tsx içinde | ✅ | Mock → `POST /shipments/:orderId/refresh` |

### Bildirimler

| Ekran | Dosya | Durum |
|---|---|---|
| Bildirim Listesi | `app/notifications.tsx` | ✅ |
| Bildirim Detay | `app/notifications/[id].tsx` | ✅ |
| Bildirim Ayarları | `app/notifications/settings.tsx` | ✅ |

### Profil

| Ekran / Özellik | Dosya | Durum |
|---|---|---|
| Profil Görüntüleme | `app/(tabs)/profile.tsx` | ✅ |
| Profil Düzenleme | `app/profile/edit.tsx` | ✅ |
| Şifre Değiştir | `app/profile/change-password.tsx` | ✅ |
| Tema Ayarları | profile.tsx içinde | ✅ |
| Çıkış Yap | profile.tsx içinde | ✅ |
| Siparişlerim linki | profile.tsx içinde | ✅ |
| Sevkiyatlarım linki | profile.tsx içinde | ✅ |

---

## 5. State Yönetimi

Tüm global state **Zustand** + **AsyncStorage persist** ile yönetilmektedir.

### `cartStore.ts`

```typescript
// src/store/cart/cartStore.ts
// Persist key: 'golden-erp-cart'
interface CartState {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  checkout: () => Promise<CheckoutResult>;
}
```

### `favoritesStore.ts`

```typescript
// src/store/favorites/favoritesStore.ts
// Persist key: 'golden-erp-favorites'
interface FavoritesState {
  productIds: string[];
  products: Product[];
  toggleFavorite: (product: Product) => void;
  isFavorite: (productId: string) => boolean;
}
```

### `ordersStore.ts`

```typescript
// src/store/orders/ordersStore.ts
// Persist key: 'golden-erp-orders'
interface OrdersState {
  orders: EcommerceOrder[];
  addOrder: (items: OrderItem[]) => EcommerceOrder;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  cancelOrder: (orderId: string, reason?: string) => void;
  getOrderById: (orderId: string) => EcommerceOrder | undefined;
  reorder: (orderId: string) => OrderItem[];
}
```

---

## 6. API Katmanı

### Mevcut Servisler

| Servis | Dosya | Gerçek API Yolu |
|---|---|---|
| Catalog Service | `src/Api/catalogService.ts` | `GET /api/v1/products` |
| Shipping Service | `src/Api/shippingService.ts` | `GET /api/v1/shipments` |
| Mock Data | `src/Api/mockData.ts` | — |

### Axios Client

```typescript
// src/Api/axiosClient.ts
// baseURL: process.env.EXPO_PUBLIC_API_URL
// Request interceptor: Bearer token
// Response interceptor: 401 → logout
```

### Gerçek API Endpoint'leri (Gelecek)

```
Auth:
  POST   /api/v1/auth/login
  POST   /api/v1/auth/forgot-password
  POST   /api/v1/auth/reset-password
  PUT    /api/v1/auth/change-password

Catalog:
  GET    /api/v1/categories
  GET    /api/v1/products?page=1&pageSize=20&categoryId=&search=
  GET    /api/v1/products/:id
  GET    /api/v1/products/:id/price-breakdown
  GET    /api/v1/variants

Orders:
  GET    /api/v1/orders
  POST   /api/v1/orders
  GET    /api/v1/orders/:id
  PUT    /api/v1/orders/:id/status
  DELETE /api/v1/orders/:id/cancel

Shipments:
  GET    /api/v1/shipments
  GET    /api/v1/shipments/:orderId
  POST   /api/v1/shipments/:orderId/refresh

Profile:
  GET    /api/v1/profile
  PUT    /api/v1/profile
  GET    /api/v1/notifications/settings
  PUT    /api/v1/notifications/settings

Gold Prices (Socket.IO):
  Event: 'gold:price:update' → { has: number, k22: number, usd: number }
```

---

## 7. Navigation Yapısı

```
Root Stack (_layout.tsx)
├── index (Splash/Onboarding kontrol)
├── onboarding
├── (auth)/login
├── (auth)/forgot-password
├── (auth)/reset-password
├── (tabs)/                      ← Tab Navigator
│   ├── dashboard
│   ├── catalog
│   ├── cart
│   ├── favorites
│   └── profile
├── catalog/[id]                 ← Ürün detay
├── orders                       ← Sipariş listesi
├── orders/[id]                  ← Sipariş detay (native header)
├── shipping                     ← Sevkiyat listesi
├── shipping/[id]                ← Sevkiyat detay (native header)
├── notifications                ← Bildirim listesi
├── notifications/[id]           ← Bildirim detay
├── notifications/settings       ← Bildirim ayarları
├── profile/edit                 ← Profil düzenleme
├── profile/change-password      ← Şifre değiştir
├── cariler                      ← Cari yönetimi
├── transactions                 ← İşlem geçmişi
└── dashboard-details            ← ERP istatistikler
```

---

## 8. Bileşen Kütüphanesi

### Paylaşılan Bileşenler

| Bileşen | Dosya | Kullanım |
|---|---|---|
| `ScreenHeader` | `src/Shared/Header.tsx` | Tüm ekran başlıkları |
| `CustomInput` | `src/Components/Ui/Input.tsx` | Form inputları |
| `Button` | `src/Components/Ui/Button.tsx` | primary / danger / outline |
| `Skeleton` | `src/Components/Ui/Skeleton.tsx` | Yükleme placeholder |
| `ErrorState` | `src/Components/Ui/ErrorState.tsx` | Hata durumu |
| `ProductCard` | `src/Components/Cards/ProductCard.tsx` | Katalog ve favoriler |
| `ProductOfWeekSlider` | `src/Components/Cards/ProductOfWeekSlider.tsx` | Dashboard slider |
| `VariantSelectModal` | `src/Components/Modals/VariantSelectModal.tsx` | Bottom sheet modal |
| `PriceDetailModal` | `src/Components/Modals/PriceDetailModal.tsx` | Bottom sheet modal |

---

## 9. Tema & Tasarım Sistemi

### Renk Paleti

```typescript
// src/Constants/Theme.ts
light: {
  primary: '#C9963B',        // Ana altın renk
  background: '#FAFAFA',
  card: '#FFFFFF',
  text: '#1A1A2E',
  subtext: '#6B7280',
  catalogGold: '#B8860B',
}
dark: {
  primary: '#C9963B',
  background: '#0D0D14',
  card: '#1A1A2E',
  text: '#F5F5F5',
  subtext: '#9CA3AF',
}
```

### Tasarım Prensipleri

- **BorderRadius**: Kartlar `20px`, butonlar `16px`, modaller `28px` (top)
- **Gölgeler**: iOS `shadowColor + shadowOpacity`, Android `elevation`
- **Animasyonlar**: `FadeInDown.springify()` giriş animasyonu
- **Haptic**: `lightImpact()` tüm tıklamalarda, `successNotification()` başarılı işlemlerde
- **SafeArea**: `edges={['top']}` veya `edges={['bottom']}` — asla `['top','bottom']` birlikte tab ekranlarında

---

## 10. Mock → Gerçek API Geçişi

### Adımlar

1. `.env` dosyasını oluştur:
   ```env
   EXPO_PUBLIC_API_URL=https://api.akben.com
   EXPO_PUBLIC_SOCKET_URL=wss://ws.akben.com
   ```

2. `src/Api/axiosClient.ts` — `baseURL` env'den oku (zaten hazır)

3. Her servis dosyasında `TODO` yorumlarını aktif et:
   ```typescript
   // catalogService.ts
   // TODO'yu kaldır:
   // await delay(350);
   // return getMockProducts(...);
   
   // Bunun yerine:
   return axiosClient.get('/api/v1/products', { params: { page, pageSize, categoryId, search } });
   ```

4. `shippingService.ts` — aynı şekilde mock fonksiyonları axiosClient ile değiştir

5. Auth token'ı `axiosClient.ts` interceptor'ına ekle:
   ```typescript
   // Zaten hazır — AsyncStorage'dan token alınıyor
   ```

6. Socket.IO bağlantısı `src/Context/GoldPriceContext.tsx` içinde yönetilmektedir.

### Kargo Harici Servis Entegrasyonu

`shippingService.ts` içindeki `trackingUrl` alanı, harici kargo şirketlerinin takip URL'sini saklar:
```typescript
// Yurtiçi
`https://www.yurticikargo.com/tr/online-islemler/gonderi-sorgula?code=${trackingNo}`

// Aras
`https://kargotakip.araskargo.com.tr/mainpage.aspx?code=${trackingNo}`
```

`Linking.openURL(shipping.trackingUrl)` ile kullanıcı tarayıcıya yönlendirilir.  
İleride `WebView` entegrasyonu ile uygulama içi takip de yapılabilir.

---

## 11. Eksikler & Gelecek Planı

### Kısa Vadeli (Öncelikli)

- [ ] OTP Doğrulama ekranı (`app/(auth)/otp.tsx`)
- [ ] Hesap/Finans modülü genişletmesi (Cari Bakiye Detay, Hareket Detay)
- [ ] Ürün görselleri için gerçek CDN entegrasyonu
- [ ] Push notification servisi (Expo Notifications)
- [ ] Varyant seçiminin sipariş akışına tam entegrasyonu

### Orta Vadeli

- [ ] Gerçek auth API entegrasyonu (JWT + refresh token)
- [ ] Gerçek kargo API entegrasyonu (Yurtiçi, Aras webhook'ları)
- [ ] Ürün arama Algolia/Elasticsearch entegrasyonu
- [ ] Sipariş faturası/PDF indirme
- [ ] Çoklu dil (i18n) desteği

### Uzun Vadeli

- [ ] B2B sipariş onay akışı (yönetici onayı)
- [ ] Toplu sipariş oluşturma (Excel import)
- [ ] Müşteri segmentasyonu ve kişiselleştirilmiş fiyatlar
- [ ] Analytics & raporlama dashboard
- [ ] Tablet/iPad optimizasyonu

---

## Geliştirici Notları

### Yeni Ekran Eklerken

1. `app/` altında ilgili klasöre dosyayı ekle
2. `app/_layout.tsx`'e `<Stack.Screen name="..." options={{ headerShown: false }} />` ekle
3. Profil veya ilgili ekrandan linki bağla

### Store Eklerken

```typescript
// Zustand + AsyncStorage persist template
export const useXxxStore = create<XxxState>()(
  persist(
    (set, get) => ({ /* state ve actions */ }),
    {
      name: 'akben-xxx',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ /* persist edilecek alanlar */ }),
    },
  ),
);
```

### API Servis Template

```typescript
// Hem mock hem API-ready pattern
export const xxxService = {
  async getItems(): Promise<Response> {
    await delay(300); // Kaldır: production'da yok
    // TODO: return axiosClient.get('/api/v1/xxx');
    return { success: true, data: getMockXxx() };
  },
};
```

---

*Son güncelleme: Şubat 2026 — AKBEN Demo v2.0*
