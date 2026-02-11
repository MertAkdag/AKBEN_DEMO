# HaremAltın Socket.IO API Dökümantasyonu

Bu dökümantasyon, HaremAltın Socket.IO API'sini kullanarak gerçek zamanlı fiyat değişikliklerini dinlemek için gerekli bilgileri içerir.

## Socket.IO Bağlantı Bilgileri

- **URL**: `https://socket.haremaltin.com:443`
- **Protokol**: Socket.IO (WebSocket/Polling)
- **Port**: 443

## Event: price_changed

`price_changed` eventi, fiyat değişikliklerini gerçek zamanlı olarak bildirir. Bu eventi dinleyerek anlık fiyat güncellemelerini alabilirsiniz.

### Event Formatı

Event adı: `price_changed`

Socket.IO'da eventler doğrudan event adıyla dinlenir. Event payload'u genellikle şu formatta olacaktır:
```json
{
  "symbol": "string",
  "price": "number",
  "timestamp": "number"
}
```

*Not: Gerçek payload formatı API'den gelen verilere göre değişiklik gösterebilir.*

## Kullanım Örnekleri

### 1. HTML/JavaScript (Tarayıcı)

Tarayıcı tabanlı uygulamalar için `index.html` dosyasına bakın. Socket.IO CDN üzerinden otomatik yüklenir, ekstra kurulum gerekmez.

### 2. Node.js

Node.js uygulamaları için `example.js` dosyasına bakın.

## Kurulum

### Node.js için

```bash
npm install
```

Bu komut `socket.io-client` paketini yükleyecektir.

## Test

Test dosyasını çalıştırmak için:

```bash
# Node.js
node test.js
```

## Önemli Notlar

- Socket.IO bağlantısı güvenli (HTTPS/WSS) protokolü kullanır
- Socket.IO otomatik yeniden bağlanma özelliğine sahiptir
- Bağlantı kesildiğinde Socket.IO otomatik olarak yeniden bağlanmaya çalışır
- Rate limiting ve hata yönetimi uygulamanızda mutlaka bulunmalıdır
- Production ortamında hata loglama ve monitoring eklenmelidir
- Socket.IO hem WebSocket hem de polling transport'larını destekler

## Lisans

Bu örnek kodlar eğitim amaçlıdır.

