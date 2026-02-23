## AKBEN_DEMO – Golden ERP Kuyumculuk Paneli

Bu proje, Expo + React Native + expo-router kullanılarak geliştirilmiş, **kuyumculuk sektörüne özel B2B ERP demo uygulamasıdır**. Dashboard, canlı altın/döviz fiyatları, katalog, cari, iş emri, makine ve sepet modüllerini içerir.

### Teknoloji Yığını

- **Mobil/Web**: Expo, React Native, expo-router
- **State Management**: Zustand (`authStore`, `cartStore`), React Context (`Theme`, `GoldPrice`)
- **Veri Erişimi**: Axios, domain/use-case + repository katmanları (`src/domain`, `src/infrastructure`)
- **Testler**: Jest + ts-jest (domain/use-case unit testleri)

### Projeyi Çalıştırma

- Bağımlılıklar:

```bash
npm install
```

- Geliştirme sunucusu:

```bash
npm start
```

### Test ve Kalite Kontrolleri

- Lint:

```bash
npm run lint
```

- Unit testler:

```bash
npm test
```

Git commit öncesinde **pre-commit hook** otomatik olarak `lint` ve `test` komutlarını çalıştırır.

### Ortam Değişkenleri

- Canlı altın fiyatı için RapidAPI anahtarı:

```bash
EXPO_PUBLIC_GOLD_PRICE_API_KEY=YOUR_RAPIDAPI_KEY
```

Bu değişken ayarlı değilse Harem Altın kaynağı devre dışı kalır ve sistem Truncgil / fallback verilerine döner.

### Mimari Notlar

- Domain katmanı `src/domain` altında toplanmıştır (`entities`, `repositories`, `use-cases`).
- API ve servis implementasyonları `src/Api` ve `src/infrastructure` altında konumlandırılmıştır.
- UI tarafı `app` (router ekranları) ve `src/Components` / `src/features` klasörlerine ayrılmıştır.

Detaylı geliştirici kuralları için `RULES.md`, katkı süreci için `CONTRIBUTING.md` dosyalarına bakabilirsiniz.

