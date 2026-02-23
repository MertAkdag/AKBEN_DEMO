import { GOLD_PRICE_API_KEY } from '../Constants/env';
import { logger } from '../Utils/logger';

/**
 * Canlı finans verileri: Has Altın, USD, EUR
 *
 * Kaynaklar:
 *   • Altın  → Harem Altın (RapidAPI) birincil, Truncgil yedek
 *   • Döviz  → Truncgil Finans API
 *   • Fallback → sabit değerler
 */

/* ─── Endpoint'ler ─── */
const HAREM_URL =
  'https://harem-altin-live-gold-price-data.p.rapidapi.com/harem_altin/prices/23b4c2fb31a242d1eebc0df9b9b65e5e';
const HAREM_HEADERS: Record<string, string> = {
  'x-rapidapi-key': GOLD_PRICE_API_KEY,
  'x-rapidapi-host': 'harem-altin-live-gold-price-data.p.rapidapi.com',
};
const TRUNCGIL_URL = 'https://finans.truncgil.com/today.json';

const DEBUG = __DEV__;

/* ─── Tipler ─── */
export interface FinanceItem {
  key: string;
  label: string;
  subtitle: string;
  icon: string;
  buy: number;
  sell: number;
  change: string;
  changeNum: number;
  unit: string;
  isFallback: boolean;
}

export type FinanceData = {
  items: FinanceItem[];
  isFallback: boolean;
  source: string;
};

export type GoldPriceResult = { price: number; isFallback: boolean };

/* ════════════════════════════════════════════
   Yardımcılar
   ════════════════════════════════════════════ */
function log(...args: unknown[]) {
  if (DEBUG) logger.info('[Finance]', ...args);
}

/** Türkçe karakterleri ASCII'ye normalize et */
function normalizeTR(s: string): string {
  return s
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/İ/g, 'i')
    .replace(/[\s_\-/]/g, '');
}

/** "6.985,39" → 6985.39 */
function parseTR(str: string): number {
  const s = str.replace(/\s/g, '').replace(/[₺$€]/g, '');
  if (s.includes(',')) {
    return parseFloat(s.replace(/\./g, '').replace(',', '.'));
  }
  return parseFloat(s);
}

function safeNum(val: any): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return parseTR(val);
  return 0;
}

function fmtChange(num: number): string {
  const sign = num > 0 ? '+' : '';
  return `%${sign}${num.toFixed(2).replace('.', ',')}`;
}

function fetchWithTimeout(url: string, opts?: RequestInit, ms = 8000): Promise<Response> {
  return Promise.race([
    fetch(url, opts),
    new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), ms)),
  ]);
}

/** Dizi içinde key alanına göre Türkçe-duyarlı arama */
function findByKey(list: any[], names: string[]): any | null {
  const norms = names.map(normalizeTR);
  for (const entry of list) {
    const k = normalizeTR(String(entry?.key ?? ''));
    if (norms.includes(k)) return entry;
  }
  return null;
}

/* ─── Fallback ─── */
const FALLBACK_ITEMS: FinanceItem[] = [
  { key: 'gold', label: 'Has Altın', subtitle: 'Gram fiyatı', icon: 'diamond', buy: 0, sell: 0, change: '—', changeNum: 0, unit: '₺', isFallback: true },
  { key: '22ayar', label: '22 Ayar', subtitle: '22 Ayar Bilezik', icon: 'diamond', buy: 0, sell: 0, change: '—', changeNum: 0, unit: '₺', isFallback: true },
  { key: 'usd', label: 'Dolar', subtitle: 'USD / TRY', icon: 'logo-usd', buy: 0, sell: 0, change: '—', changeNum: 0, unit: '₺', isFallback: true },
  { key: 'eur', label: 'Euro', subtitle: 'EUR / TRY', icon: 'logo-euro', buy: 0, sell: 0, change: '—', changeNum: 0, unit: '₺', isFallback: true },
];

/* ════════════════════════════════════════════
   Harem Altın – RapidAPI (sadece altın)
   ────────────────────────────────────────────
   Response: 27 kayıtlık dizi
   { key, buy, sell, percent, arrow, last_update }
   Key'ler: "Has Altın", "GRAM ALTIN", "ONS", …
   ════════════════════════════════════════════ */
async function fetchHaremGold(): Promise<{ gold: FinanceItem; ayar22: FinanceItem | null } | null> {
  if (!GOLD_PRICE_API_KEY) {
    log('Harem: RapidAPI anahtarı tanımlı değil, bu kaynak devre dışı.');
    return null;
  }

  try {
    log('Harem: istek atılıyor…');
    const res = await fetchWithTimeout(
      HAREM_URL,
      { method: 'GET', headers: HAREM_HEADERS },
      10000,
    );
    if (!res.ok) { log('Harem: status', res.status); return null; }

    const raw = await res.json();
    const list: any[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
        ? raw.data
        : typeof raw === 'object'
          ? Object.values(raw)
          : [];

    if (!list.length) { log('Harem: boş liste'); return null; }

    const entry = findByKey(list, ['Has Altın', 'Has Altin', 'HASALTIN', 'HAS ALTIN']);
    if (!entry) {
      log('Harem: Has Altın bulunamadı. Keys:', list.map((e: any) => e?.key).join(', '));
      return null;
    }

    const pct = parseFloat(String(entry.percent ?? '0').replace(',', '.')) || 0;
    const changeNum = entry.arrow === 'down' ? -Math.abs(pct) : pct;

    const goldItem: FinanceItem = {
      key: 'gold',
      label: 'Has Altın',
      subtitle: 'Gram fiyatı',
      icon: 'diamond',
      buy: safeNum(entry.buy),
      sell: safeNum(entry.sell),
      change: fmtChange(changeNum),
      changeNum,
      unit: '₺',
      isFallback: false,
    };

    log('Harem ✓ Has Altın satış =', goldItem.sell, 'değişim =', goldItem.change);

    /* 22 Ayar */
    const ayar22 = findByKey(list, ['22 Ayar', '22 AYAR', '22Ayar', '22 Ayar Bilezik']);
    let ayar22Item: FinanceItem | null = null;
    if (ayar22) {
      const pct22 = parseFloat(String(ayar22.percent ?? '0').replace(',', '.')) || 0;
      const changeNum22 = ayar22.arrow === 'down' ? -Math.abs(pct22) : pct22;
      ayar22Item = {
        key: '22ayar',
        label: '22 Ayar',
        subtitle: '22 Ayar Bilezik',
        icon: 'diamond',
        buy: safeNum(ayar22.buy),
        sell: safeNum(ayar22.sell),
        change: fmtChange(changeNum22),
        changeNum: changeNum22,
        unit: '₺',
        isFallback: false,
      };
      log('Harem ✓ 22 Ayar satış =', ayar22Item.sell);
    }

    return { gold: goldItem, ayar22: ayar22Item };
  } catch (e) {
    log('Harem: hata', e);
    return null;
  }
}

/* ════════════════════════════════════════════
   Truncgil – Altın + Döviz (yedek / tamamlayıcı)
   ════════════════════════════════════════════ */
interface TruncgilResult {
  gold: FinanceItem;
  usd: FinanceItem;
  eur: FinanceItem;
}

async function fetchTruncgil(): Promise<TruncgilResult | null> {
  try {
    log('Truncgil: istek atılıyor…');
    const res = await fetchWithTimeout(TRUNCGIL_URL);
    if (!res.ok) { log('Truncgil: status', res.status); return null; }
    const data = await res.json();

    const gold = data?.['gram-has-altin'];
    const usd = data?.['USD'];
    const eur = data?.['EUR'];

    if (!gold?.Satış || !usd?.Satış || !eur?.Satış) {
      log('Truncgil: eksik veri');
      return null;
    }

    const parseChg = (s: string) =>
      parseFloat((s ?? '0').replace('%', '').replace(',', '.')) || 0;

    return {
      gold: {
        key: 'gold', label: 'Has Altın', subtitle: 'Gram fiyatı', icon: 'diamond',
        buy: parseTR(gold.Alış), sell: parseTR(gold.Satış),
        change: gold.Değişim ?? '—', changeNum: parseChg(gold.Değişim),
        unit: '₺', isFallback: false,
      },
      usd: {
        key: 'usd', label: 'Dolar', subtitle: 'USD / TRY', icon: 'logo-usd',
        buy: parseTR(usd.Alış), sell: parseTR(usd.Satış),
        change: usd.Değişim ?? '—', changeNum: parseChg(usd.Değişim),
        unit: '₺', isFallback: false,
      },
      eur: {
        key: 'eur', label: 'Euro', subtitle: 'EUR / TRY', icon: 'logo-euro',
        buy: parseTR(eur.Alış), sell: parseTR(eur.Satış),
        change: eur.Değişim ?? '—', changeNum: parseChg(eur.Değişim),
        unit: '₺', isFallback: false,
      },
    };
  } catch (e) {
    log('Truncgil: hata', e);
    return null;
  }
}

/* ════════════════════════════════════════════
   Public API
   ════════════════════════════════════════════ */
export const goldPriceService = {
  /**
   * Tüm finans verileri.
   * Altın: önce Harem, olmazsa Truncgil
   * Döviz: Truncgil (Harem'de döviz yok)
   */
  async getFinanceData(): Promise<FinanceData> {
    log('getFinanceData başladı');

    // Paralel çağrı: Harem (sadece altın) + Truncgil (altın + döviz)
    const [haremGold, truncgil] = await Promise.all([
      fetchHaremGold(),
      fetchTruncgil(),
    ]);

    const items: FinanceItem[] = [];
    let source = 'fallback';

    // Altın: Harem öncelikli, yoksa Truncgil
    if (haremGold?.gold) {
      items.push(haremGold.gold);
      source = 'harem';
    } else if (truncgil?.gold) {
      items.push(truncgil.gold);
      source = 'truncgil';
    } else {
      items.push(FALLBACK_ITEMS[0]);
    }

    // 22 Ayar: Harem öncelikli
    if (haremGold?.ayar22) {
      items.push(haremGold.ayar22);
    } else {
      items.push(FALLBACK_ITEMS[1]);
    }

    // Döviz: Truncgil
    if (truncgil?.usd) {
      items.push(truncgil.usd);
    } else {
      items.push(FALLBACK_ITEMS[2]);
    }

    if (truncgil?.eur) {
      items.push(truncgil.eur);
    } else {
      items.push(FALLBACK_ITEMS[3]);
    }

    const isFallback = items.every(i => i.isFallback);
    log('Sonuç:', source, '|', items.map(i => `${i.label}=${i.sell || '—'}`).join(', '));

    return { items, isFallback, source };
  },

  async getGramGoldSellPrice(): Promise<GoldPriceResult> {
    const data = await this.getFinanceData();
    const gold = data.items.find(i => i.key === 'gold');
    if (gold && !gold.isFallback) {
      return { price: gold.sell, isFallback: false };
    }
    return { price: 7000, isFallback: true };
  },
};
