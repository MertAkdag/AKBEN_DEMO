/**
 * GoldPriceContext – Gerçek zamanlı altın & döviz fiyatları
 *
 * Veri akışı:
 *   1. Socket.IO (birincil)  → HaremAltın canlı fiyat
 *   2. REST API  (yedek)     → Harem RapidAPI + Truncgil
 *   3. Fallback              → Sabit değerler
 *
 * Uygulama genelinde tek bir bağlantı üzerinden tüm ekranlara
 * anlık fiyat verisi sağlar.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  PropsWithChildren,
} from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { haremSocket, SocketStatus } from '../Api/socketService';
import { goldPriceService, FinanceItem } from '../Api/goldPriceService';
import { logger } from '../Utils/logger';

const DEBUG = __DEV__;
function log(...args: unknown[]) {
  if (DEBUG) logger.info('[GoldPrice]', ...args);
}

/* ─── Tipler ─── */
export interface GoldPriceState {
  /** Finans kalemleri (altın, döviz vb.) */
  items: FinanceItem[];
  /** Socket bağlantı durumu */
  socketStatus: SocketStatus;
  /** Veri kaynağı: 'socket' | 'harem' | 'truncgil' | 'fallback' */
  source: string;
  /** Tüm veriler fallback mı? */
  isFallback: boolean;
  /** Son güncelleme zamanı */
  lastUpdate: Date | null;
  /** Yükleniyor mu? */
  isLoading: boolean;
  /** Manuel yenileme fonksiyonu */
  refresh: () => Promise<void>;
  /** Gram altın satış fiyatı (hızlı erişim) */
  gramGoldSellPrice: number;
  /** 22 Ayar satış fiyatı (hızlı erişim) */
  ayar22SellPrice: number;
}

const defaultState: GoldPriceState = {
  items: [],
  socketStatus: 'disconnected',
  source: 'none',
  isFallback: true,
  lastUpdate: null,
  isLoading: true,
  refresh: async () => {},
  gramGoldSellPrice: 0,
  ayar22SellPrice: 0,
};

const GoldPriceContext = createContext<GoldPriceState>(defaultState);

export const useGoldPrice = () => useContext(GoldPriceContext);

/* ─── Yardımcılar ─── */

/** "6.985,39" → 6985.39 */
function parseTR(str: string): number {
  if (typeof str === 'number') return str;
  const s = String(str).replace(/\s/g, '').replace(/[₺$€]/g, '');
  if (s.includes(',')) {
    return parseFloat(s.replace(/\./g, '').replace(',', '.'));
  }
  return parseFloat(s) || 0;
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

/**
 * Socket'ten gelen price_changed verisini FinanceItem[] dizisine dönüştür.
 *
 * HaremAltın Socket.IO gerçek payload formatı:
 * {
 *   meta: { time: number, tarih?: string },
 *   data: {
 *     ALTIN:  { code, alis, satis, tarih, dir: { alis_dir, satis_dir }, dusuk, yuksek, kapanis },
 *     AYAR22: { ... },
 *     USDTRY: { ... },
 *     EURTRY: { ... },
 *     ...46 kalem
 *   }
 * }
 *
 * Önemli: `percent` alanı yok → değişim `kapanis`'ten hesaplanır.
 *         `alis/satis` string veya number olabilir.
 *         Yön bilgisi `dir.satis_dir` = "up" | "down" | ""
 */
function parseSocketData(raw: any): FinanceItem[] {
  if (!raw) return [];

  /* ─── data objesini bul ─── */
  const data: Record<string, any> = raw?.data ?? raw;
  if (typeof data !== 'object' || Array.isArray(data)) return [];

  const items: FinanceItem[] = [];

  /** Tek bir socket kaydını FinanceItem'e çevir */
  function toItem(
    entry: any,
    key: string,
    label: string,
    subtitle: string,
    icon: string,
  ): FinanceItem | null {
    if (!entry) return null;

    const buy = safeNum(entry.alis);
    const sell = safeNum(entry.satis);
    if (sell <= 0 && buy <= 0) return null;

    /* Değişim hesapla: (satış − kapanış) / kapanış × 100 */
    const kapanis = safeNum(entry.kapanis);
    let changeNum = 0;
    if (kapanis > 0 && sell > 0) {
      changeNum = ((sell - kapanis) / kapanis) * 100;
    }

    /* Yön bilgisi (API'den gelen dir ile doğrula) */
    const satisDir = entry?.dir?.satis_dir ?? '';
    if (satisDir === 'down' && changeNum > 0) changeNum = -changeNum;
    if (satisDir === 'up' && changeNum < 0) changeNum = -changeNum;

    return {
      key,
      label,
      subtitle,
      icon,
      buy,
      sell,
      change: fmtChange(changeNum),
      changeNum,
      unit: '₺',
      isFallback: false,
    };
  }

  /* ─── Has Altın (ALTIN) ─── */
  const gold = toItem(data['ALTIN'], 'gold', 'Has Altın', 'Gram fiyatı', 'diamond');
  if (gold) items.push(gold);

  /* ─── 22 Ayar (AYAR22) ─── */
  const ayar22 = toItem(data['AYAR22'], '22ayar', '22 Ayar', '22 Ayar Bilezik', 'diamond');
  if (ayar22) items.push(ayar22);

  /* ─── Dolar (USDTRY) ─── */
  const usd = toItem(data['USDTRY'], 'usd', 'Dolar', 'USD / TRY', 'logo-usd');
  if (usd) items.push(usd);

  /* ─── Euro (EURTRY) ─── */
  const eur = toItem(data['EURTRY'], 'eur', 'Euro', 'EUR / TRY', 'logo-euro');
  if (eur) items.push(eur);

  log(
    'Socket parse:',
    items.length, 'kalem |',
    items.map(i => `${i.label}=${i.sell}`).join(', '),
  );

  return items;
}

/* ─── REST API polling aralığı (ms) ─── */
const REST_POLL_INTERVAL = 60_000; // 60 saniye

/* ════════════════════════════════════════════
   Provider
   ════════════════════════════════════════════ */
export const GoldPriceProvider = ({ children }: PropsWithChildren) => {
  const [items, setItems] = useState<FinanceItem[]>([]);
  const [socketStatus, setSocketStatus] = useState<SocketStatus>('disconnected');
  const [source, setSource] = useState('none');
  const [isFallback, setIsFallback] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const socketHasData = useRef(false);

  /* ─── REST API'den veri çek (yedek) ─── */
  const fetchFromRest = useCallback(async () => {
    try {
      log('REST API\'den veri çekiliyor...');
      const result = await goldPriceService.getFinanceData();
      // Socket'ten veri geldiyse REST'i atlayalım
      if (socketHasData.current) {
        log('Socket verisi mevcut, REST atlandı');
        return;
      }
      setItems(result.items);
      setSource(result.source);
      setIsFallback(result.isFallback);
      setLastUpdate(new Date());
      setIsLoading(false);
      log('REST API verisi yüklendi:', result.source);
    } catch (e) {
      log('REST API hatası:', e);
      setIsLoading(false);
    }
  }, []);

  /* ─── Manuel yenileme ─── */
  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchFromRest();
    // Socket yeniden bağlantı dene
    if (!haremSocket.isConnected()) {
      haremSocket.connect();
    }
  }, [fetchFromRest]);

  /* ─── Socket.IO bağlantısı ve listener'lar ─── */
  useEffect(() => {
    // Socket durumu dinle
    const unsubStatus = haremSocket.onStatusChanged((status) => {
      setSocketStatus(status);
      log('Socket durumu:', status);
    });

    // Fiyat verisi dinle
    const unsubPrice = haremSocket.onPriceChanged((data) => {
      const parsed = parseSocketData(data);
      if (parsed.length > 0) {
        socketHasData.current = true;
        // Partial update: mevcut items'ı güncelle, eksik olanları koru
        setItems(prev => {
          // Eğer önceki veri yoksa direkt set et
          if (prev.length === 0) return parsed;
          // Mevcut items'ın kopyasını al, yeni verileri merge et
          const merged = [...prev];
          for (const newItem of parsed) {
            const idx = merged.findIndex(m => m.key === newItem.key);
            if (idx >= 0) {
              merged[idx] = newItem;
            } else {
              merged.push(newItem);
            }
          }
          return merged;
        });
        setSource('socket');
        setIsFallback(false);
        setLastUpdate(new Date());
        setIsLoading(false);
      } else {
        log('Socket verisi parse edilemedi, raw:', JSON.stringify(data).slice(0, 200));
      }
    });

    // Socket bağlantısı başlat
    haremSocket.connect();

    // İlk yüklemede REST'ten de çek (Socket bağlanana kadar)
    fetchFromRest();

    // REST polling (Socket kesilirse yedek olarak)
    restTimerRef.current = setInterval(() => {
      if (!haremSocket.isConnected()) {
        fetchFromRest();
      }
    }, REST_POLL_INTERVAL);

    return () => {
      unsubStatus();
      unsubPrice();
      haremSocket.disconnect();
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
      }
    };
  }, [fetchFromRest]);

  /* ─── App state yönetimi (arka plan / ön plan) ─── */
  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        log('Uygulama ön plana geldi, bağlantı kontrol ediliyor...');
        if (!haremSocket.isConnected()) {
          haremSocket.connect();
        }
        fetchFromRest(); // Ön plana gelince hemen güncelle
      } else if (nextState === 'background') {
        log('Uygulama arka plana gitti');
        // Arka planda socket'i kapat (pil tasarrufu)
        haremSocket.disconnect();
      }
    };

    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, [fetchFromRest]);

  /* ─── Hızlı erişim fiyatları ─── */
  const gramGoldSellPrice = items.find(i => i.key === 'gold')?.sell ?? 0;
  const ayar22SellPrice = items.find(i => i.key === '22ayar')?.sell ?? 0;

  const value: GoldPriceState = {
    items,
    socketStatus,
    source,
    isFallback,
    lastUpdate,
    isLoading,
    refresh,
    gramGoldSellPrice,
    ayar22SellPrice,
  };

  return (
    <GoldPriceContext.Provider value={value}>
      {children}
    </GoldPriceContext.Provider>
  );
};
