## Golden ERP – Geliştirici Kuralları (Özet)

Bu proje, Golden ERP mimari dokümanındaki prensipleri uygular. Aşağıdaki kurallar **zorunlu** kabul edilir:

### 1. Mimari ve Katmanlar

- **Clean Architecture**: Business logic, frameworklerden ve UI'dan izole olmalıdır.
- **Domain katmanı** (`src/domain`):
  - `entities`: İş modelleri (`User`, `CartItem`, `DashboardSummary` vb.)
  - `repositories`: Arayüzler (`IAuthRepository`, `IDashboardRepository` vb.)
  - `use-cases`: Uygulama senaryoları (`LoginUseCase`, `CheckoutUseCase` vb.)
- **Infrastructure katmanı** (`src/infrastructure`):
  - API repository implementasyonları, queue & price service gibi servisler.
- **UI katmanı**:
  - `app/`**: expo-router ekranları
  - `src/features/**`: feature bazlı hook ve yardımcılar
  - `src/Components/**`: yeniden kullanılabilir UI bileşenleri

Yeni iş kuralı eklerken önce **use-case** tasarla, sonra UI tarafında ilgili hook/component ile bağla.

### 2. API ve State Yönetimi

- **Component içinde direkt API çağrısı yasak**:
  - Ekran bileşenlerinde `axiosClient`, `fetch` vb. doğrudan kullanılmamalı.
  - API çağrıları sadece:
    - Repository implementasyonlarında (`src/infrastructure/api/repositories/`**)
    - veya halihazırda var olan servis şablonlarında (`src/Api/**`) yapılmalıdır.
- **Use-case ve hook zinciri**:
  - UI → feature hook (`useAuth`, `useCart`, `useDashboardSummary`) → use-case → repository → API

### 3. TypeScript Kuralları

- `**any` yasak**:
  - Tip bilinmiyorsa `unknown` kullan ve type guard ile daralt.
  - Domain tipleri `src/domain/entities` veya `src/Types` altında tanımlanmalı.
- Fonksiyonların **dönüş tipi her zaman açık** yazılmalı:
  - Örnek: `async function foo(): Promise<Result> { ... }`

### 4. Güvenlik ve Config

- **Hassas veriler AsyncStorage’a yazılmaz**:
  - Token, şifre vb. kritik veriler için `expo-secure-store` kullanılmalı.
- **API key yönetimi**:
  - RapidAPI anahtarı gibi değerler kod içinde **hard-code edilmeyecek**, sadece env üzerinden kullanılacak:
    - `EXPO_PUBLIC_GOLD_PRICE_API_KEY` → `src/Constants/env.ts` üzerinden okunur.

### 5. Logging ve Hata Yönetimi

- `**console.log` production’da yasak**:
  - Bunun yerine `src/Utils/logger.ts` içindeki `logger` kullanılır.
  - `logger.info` sadece development’ta, `logger.error` her ortamda log yazar.
- **Error swallow yasak**:
  - `catch (e) {}` gibi boş bloklardan kaçın.
  - Hata ya log’lanmalı ya da kullanıcıya anlamlı bir mesaj gösterilmelidir.

### 6. Validasyon (Zod)

- Dış API’lerden gelen veri **Zod** ile doğrulanmalıdır:
  - Örnek: `dashboardService.getSummary` → `dashboardSummarySchema.parse(...)`.
- Yeni servis eklerken:
  - Response şeması için `zod` şeması tanımla.
  - `parse` ile runtime validation uygula, parse hatasını düzgün yönet.

### 7. Test Kuralları

- Her yeni **kritik use-case** için en az bir unit test eklenmelidir.
  - Örnek: fiyat hesaplama, sepet, auth.
- Testler Jest + ts-jest ile `__tests__/domain/`** altında tutulur.
- Test isimleri açıklayıcı olmalı (`should ...` ile başlayan senaryolar).

### 8. Kod Review Checklist (Kısa)

- Mimari:
  - Domain/use-case/repository ayrımı korunmuş mu?
  - UI içinde doğrudan API çağrısı var mı?
- Tip güvenliği:
  - `any` kullanılmış mı?
  - Dönüş tipleri açık mı?
- Hata Yönetimi:
  - Boş `catch` blokları var mı?
  - Hatalar log’lanıyor veya kullanıcıya gösteriliyor mu?
- Logging:
  - `console.log` yerine `logger` kullanılmış mı?
- Test:
  - Yeni veya değişen kritik iş mantığı için test eklendi mi?

