/**
 * Has altın anlık fiyatı.
 * Önce Harem Altın, olmazsa Kapalı Çarşı API yedek.
 */

const HAREM_URL = 'https://canlipiyasalar.haremaltin.com';
const KAPALI_CARSI_URL = 'https://kapalicarsi.apiluna.org/';

/** Harem 403 / Kapalı Çarşı network failed olduğunda gösterilecek son bilinen fiyat (TL/gr) */
const FALLBACK_GRAM_PRICE = 6850;

const GOLD_DEBUG = true; // false yaparak logları kapat

export type GoldPriceResult = { price: number; isFallback: boolean };

function log(...args: unknown[]) {
  if (GOLD_DEBUG) console.log('[Gold]', ...args);
}

/** Türk sayı formatını parse eder: 6.852,95 veya 6.852,950 -> 6852.95 */
function parseTurkishNumber(str: string): number {
  const s = str.replace(/\s/g, '').trim();
  const commaIndex = s.indexOf(',');
  if (commaIndex === -1) {
    const intPart = s.replace(/\./g, '');
    return parseInt(intPart, 10) || NaN;
  }
  const intPart = s.slice(0, commaIndex).replace(/\./g, '');
  const decPart = s.slice(commaIndex + 1);
  const whole = parseInt(intPart, 10);
  const dec = parseInt(decPart, 10) / Math.pow(10, decPart.length);
  return whole + dec;
}

/** Harem sayfası HTML'inden has altın satış fiyatını çıkarır */
function parseHaremHtml(html: string): number | null {
  // 1) HASALTIN6.852,950 veya HAS ALTIN 6.852,95 (sayfa başında sık görülüyor)
  let m = html.match(/HAS\s*ALTIN\s*(\d[\d.,]+)/i);
  if (m) {
    const n = parseTurkishNumber(m[1]);
    if (Number.isFinite(n)) {
      log('parseHaremHtml: regex 1 (HASALTIN+sayı) eşleşti:', m[1], '->', n);
      return n;
    }
  }
  // 2) Tablo: HAS ALTIN ... |alış|satış|
  m = html.match(/HAS\s*ALTIN[\s\S]*?\|(\d[\d.,]+)\|(\d[\d.,]+)/i);
  if (m) {
    const n = parseTurkishNumber(m[2]);
    if (Number.isFinite(n)) {
      log('parseHaremHtml: regex 2 (tablo) eşleşti, satış:', m[2], '->', n);
      return n;
    }
  }
  // 3) Herhangi bir yerde HAS ve ALTIN sonrası iki sayı (alış, satış)
  m = html.match(/HAS[\s\S]{0,100}?ALTIN[\s\S]{0,400}?(\d{1,3}(?:\.\d{3})*,\d{2,3})[\s\S]{0,100}?(\d{1,3}(?:\.\d{3})*,\d{2,3})/i);
  if (m) {
    const n = parseTurkishNumber(m[2]);
    if (Number.isFinite(n)) {
      log('parseHaremHtml: regex 3 eşleşti, satış:', m[2], '->', n);
      return n;
    }
  }
  log('parseHaremHtml: hiçbir regex eşleşmedi. html uzunluğu:', html.length, 'ilk 500 karakter:', html.slice(0, 500));
  return null;
}

/** Kapalı Çarşı API'den gram altın satış (TL) */
async function fetchKapaliCarsi(): Promise<number | null> {
  try {
    log('Kapalı Çarşı: istek atılıyor...');
    const res = await fetch(KAPALI_CARSI_URL);
    log('Kapalı Çarşı: status', res.status, 'ok=', res.ok);
    if (!res.ok) {
      log('Kapalı Çarşı: res.ok false, body önizleme:', (await res.text()).slice(0, 200));
      return null;
    }
    const data: { code: string; satis: string }[] = await res.json();
    const altin = data?.find((x) => x.code === 'ALTIN');
    if (!altin?.satis) {
      log('Kapalı Çarşı: ALTIN bulunamadı, codes:', data?.map((d) => d.code).slice(0, 5));
      return null;
    }
    const num = parseFloat(altin.satis.replace(',', '.'));
    if (Number.isFinite(num)) {
      log('Kapalı Çarşı: fiyat', altin.satis, '->', num);
      return num;
    }
    return null;
  } catch (e) {
    log('Kapalı Çarşı: hata', e);
    return null;
  }
}

function fetchWithTimeout(url: string, opts: RequestInit, ms: number): Promise<Response> {
  return Promise.race([
    fetch(url, opts),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms)
    ),
  ]);
}

export const goldPriceService = {
  /**
   * Has altın satış fiyatı (TL/gr).
   * Önce Harem, olmazsa Kapalı Çarşı; ikisi de başarısızsa FALLBACK_GRAM_PRICE (isFallback: true).
   */
  async getGramGoldSellPrice(): Promise<GoldPriceResult> {
    log('getGramGoldSellPrice başladı');

    // 1) Harem Altın (8 sn timeout)
    try {
      log('Harem: istek atılıyor...', HAREM_URL);
      const res = await fetchWithTimeout(
        HAREM_URL,
        {
          method: 'GET',
          headers: {
            Accept: 'text/html,application/xhtml+xml',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; App) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0 Mobile Safari/537.36',
          },
        },
        8000
      );
      log('Harem: status', res.status, 'ok=', res.ok);
      if (res.ok) {
        const html = await res.text();
        log('Harem: html uzunluğu', html.length);
        const price = parseHaremHtml(html);
        if (price != null) {
          log('Harem: fiyat döndü', price);
          return { price, isFallback: false };
        }
        log('Harem: parse sonucu null');
      } else {
        const bodyPreview = await res.text();
        log('Harem: res.ok false, body önizleme:', bodyPreview.slice(0, 300));
      }
    } catch (e) {
      log('Harem: hata veya timeout', e);
    }

    // 2) Yedek: Kapalı Çarşı API
    log('Yedek: Kapalı Çarşı deneniyor...');
    const kapali = await fetchKapaliCarsi();
    if (kapali != null) {
      log('Sonuç: Kapalı Çarşı fiyat=', kapali);
      return { price: kapali, isFallback: false };
    }

    // 3) İkisi de başarısız: son bilinen fiyat (ağ/403 nedeniyle canlı veri yok)
    log('Sonuç: her iki kaynak başarısız, fallback fiyat kullanılıyor:', FALLBACK_GRAM_PRICE);
    return { price: FALLBACK_GRAM_PRICE, isFallback: true };
  },
};
