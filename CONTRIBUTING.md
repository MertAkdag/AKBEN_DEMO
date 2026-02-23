## Katkı Rehberi

Golden ERP / AKBEN_DEMO projesine katkı vermek için aşağıdaki adımları takip edebilirsiniz.

### 1. Geliştirme Ortamını Hazırlama

- Depoyu klonlayın.
- Bağımlılıkları yükleyin:

```bash
npm install
```

- Uygulamayı başlatın:

```bash
npm start
```

### 2. Branch ve Commit Kuralları

- Ana geliştirme dalı: `main`
- Yeni iş için:
  - `feature/...`, `fix/...` gibi açıklayıcı branch isimleri kullanın.
- Commit mesajları:
  - Kısa ve açıklayıcı olsun (örn. `feat: cart checkout use case`).

### 3. Kod Kuralları

- `RULES.md` içindeki mimari ve kod standartlarına uyun.
- Yeni iş mantığını domain/use-case katmanında tasarlayın.
- UI tarafında:
  - Mümkün olduğunca mevcut reusable bileşenleri (`src/Components`) ve hook’ları (`src/features`) kullanın.

### 4. Test ve Lint

- Değişiklik göndermeden önce:

```bash
npm run lint
npm test
```

- Git pre-commit hook’u otomatik olarak bu komutları çalıştıracaktır, fakat localde manuel çalıştırmak hızlı geri bildirim sağlar.

### 5. Pull Request Açma

- PR açıklamasında:
  - Ne yaptığınızı kısaca özetleyin.
  - Gerekliyse ekran görüntüsü veya GIF ekleyin.
  - İlgili issue numaralarını belirtin.
- PR’da beklenenler:
  - Lint ve testlerin yeşil olması
  - Mümkünse küçük, odaklı değişiklikler

### 6. Kod İnceleme Beklentileri

- Reviewer, `RULES.md` altındaki checklist’i referans alarak kodu değerlendirir.
- Gelen yorumlara göre gerekli düzenlemeleri yapın ve aynı branch’e commit atın.

