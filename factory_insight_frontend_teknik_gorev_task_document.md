# Factory Insight — Frontend Teknik Görev

**Proje:** Factory Insight — Üretim Tesisi Mobil Gösterge Paneli

**Amaç:** Üretim tesisinin operasyon verilerini gösteren, Expo Router ve file-based routing kullanan, TypeScript ile yazılmış React Native (Expo) uygulaması geliştirmek.

---

## 1. Özet
Kısa süre içinde (3–5 iş günü önerilir) teslim edilecek bu görev, frontend odaklıdır. Arka uç için hazır API endpoint’leri sağlanacaktır; görevde tüm veriler gerçek backend’den çekilmelidir. Uygulama, Expo Router’ın segment/layout/modal/slot yapısını etkin kullanmalıdır.

---

## 2. Zorunlu Teknolojiler ve Araçlar
- Expo + Expo Router (file-based routing zorunlu)
- React Native
- TypeScript (zorunlu)
- State management: (Zustand / Redux / Jotai / Context — serbest)
- UI: Tercih edilen component library veya custom UI
- Grafik kütüphanesi: Victory Native veya eşdeğeri (grafik bileşeni zorunlu)
- API çağrıları: Axios veya fetch (React Query kullanımı önerilir)

---

## 3. Navigasyon Yapısı (Zorunlu)
```
/(tabs)/dashboard
/(tabs)/machines
/(tabs)/orders
/(tabs)/profile

/machines/[id]/history
(modals) segmentleri: iş emri detayları, makine log detayı
```
- Bottom Tab Bar zorunlu
- Nested stack ve modal/slot/layout yapıları Expo Router ile kurulmalı

---

## 4. Ekranlar ve Davranışlar
### 4.1 Login
- Email + password
- Başarılı login → Tab bar’a yönlendirme
- Auth state yönetimi (token saklama, auto-refresh optional)

### 4.2 Dashboard
- Kartlar halinde istatistikler: günlük üretim, aktif makine sayısı, duruşta olan makine sayısı, günlük iş emri sayısı
- Haftalık üretim grafiği (chart zorunlu)
- Skeleton loader, error ve empty state gösterimleri

### 4.3 Machines
- Makine listesi: isim, durum (renkli badge), çalışma süresi, arıza sayısı
- Machine Detail: makine bilgileri, 24 saatlik performans grafiği, son arızalar, "View History"
- History ekranı: tüm geçmiş loglar, tarih filtresi, log detayını modal/sheet olarak açma

### 4.4 Orders
- İş emri listesi: başlık, atanan kişi, deadline, durum (pending / in-progress / completed)
- İş emri detay: Bottom Sheet / Modal içinde açıklama, bağlı makine, durum güncelleme (PATCH)

### 4.5 Profile
- Kullanıcı bilgileri, logout
- Tema switch (light/dark)

---

## 5. Teknik Gereksinimler (Detaylı)
- **Expo Router:** app/ klasöründe segment ve layout mantığı doğru uygulanmalı (app/(tabs)/… gibi)
- **TypeScript:** API response tipleri, component prop tipleri, navigation param tipleri tanımlanmalı
- **State yönetimi:** Auth state, tema state; veri cache (React Query önerilir)
- **API entegrasyonu:** Tüm veri gerçek backend’den çekilecek; global error handling
- **UI/UX:** Tutarlı tasarım, responsive, skeleton loader, pull-to-refresh, pagination/infinite scroll
- **Accessibility:** Temel erişilebilirlik kurallarına dikkat

---

## 6. Kabul Kriterleri (Acceptance Criteria)
- Tüm ana ekranlar çalışır durumda olmalı (Dashboard, Machines, Orders, Profile)
- Navigation (tabs + nested routes + modals) eksiksiz çalışmalı
- Grafik bileşeni Dashboard ve Machine Detail ekranlarında görünür olmalı
- Auth flow: login / logout çalışıyor, auth state korunuyor
- API ile veri alışverişi yapılıyor; hata/boş durumları gösteriliyor
- README ve kurulum adımları repo içinde bulunuyor

---

## 7. Teslim Edilecekler
1. GitHub repository linki (tam commit geçmişi)  
2. README içinde: kurulum, çalıştırma, kullanılan teknolojiler, proje yapısı, API entegrasyon notları, kısa ekran açıklamaları  
3. Minimum çalışır uygulama: tüm ana ekranların implementasyonu ve modal/sheet gösterimleri  
4. (Opsiyonel) Offline mode için AsyncStorage implementasyonu, animasyonlar, çoklu dil desteği varsa belirtilmeli

---

## 8. Değerlendirme Kriterleri
- Expo Router ve file-based routing’in doğru kullanımı
- Kod kalitesi: component ayrımı, tip güvenliği, temiz dosya yapısı
- UI/UX: tutarlılık, loading/empty/error durumları, grafiklerin anlaşılırlığı
- API entegrasyonu ve hata yönetimi
- Ek özelliklerin (offline, animasyon, i18n) eklenmesi artı puan

---

## 9. Zaman Çizelgesi (Öneri)
- Gün 0: Repo oluşturma, boilerplate (Expo + Router + TS)  
- Gün 1: Auth + Navigation (tabs, layouts, modal segmentleri)  
- Gün 2: Dashboard + Charts + Machines list ve detay  
- Gün 3: Orders list + Order detail sheet + Profile + tema  
- Gün 4: Hata yönetimi, loading states, pagination, polish  
- Gün 5: Dokümantasyon, cleanup, PR hazırlığı

---

## 10. API Entegrasyon Notları
- API endpoint’leri ayrı bir dokümanda sağlanacaktır. (README’de endpoint listesi, örnek request/response tipleri ve auth token kullanımı belirtilmeli)
- Tüm POST/PATCH/DELETE işlemler uygun HTTP verb’leri ve status code’ları ile yapılmalı
- Global error handling & retry stratejisi tanımlanmalı (örn. React Query kullanılıyorsa queryRetry ayarları)

---

## 11. Proje Yapısı (Öneri)
```
/app
  /(tabs)
    dashboard
      index.tsx
      layout.tsx
    machines
      index.tsx
      [id]
        index.tsx
        history
          index.tsx
    orders
      index.tsx
    profile
      index.tsx
  (modals)
    orderDetail.tsx
    logDetail.tsx

/src
  /api
  /components
  /hooks
  /stores
  /screens
  /theme
  /types
  /utils

README.md
tsconfig.json
package.json
```

---

## 12. İletişim & Notlar
- Task sahibi: [FİRMA ADI] — lütfen logo, renk paleti ve varsa Figma linkini paylaşın, PDF çıktısına ekleyeyim.
- Teslimde GitHub PR linki paylaşılacak.

---

## 13. Opsiyonel: PDF veya Resmi Görev Dokümanı
Bu dokümanı kurumsal bir tasarımla PDF'e çevirebilirim veya firma adına resmi bir task dokümanı (başlık sayfası, logo, renk paleti, imza alanı) oluşturabilirim. Lütfen hangi formatı istediğinizi ve eklemek istediğiniz logo/renk/son tarih gibi bilgileri paylaşın.

---

> Hazır. İsterseniz ben şimdi GitHub için kullanabileceğiniz bir `README.md` ve örnek `app/` klasör yapısı içeren minimal kod şablonunu da oluşturayım.

