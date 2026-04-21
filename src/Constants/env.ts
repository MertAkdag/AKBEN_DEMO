export const GOLD_PRICE_API_KEY = process.env.EXPO_PUBLIC_GOLD_PRICE_API_KEY ?? '';

/** true ise release dahil konsola INFO/WARN yazılır (Metro / Xcode / Logcat) */
export const DEBUG_LOGS =
  process.env.EXPO_PUBLIC_DEBUG_LOGS === '1' ||
  process.env.EXPO_PUBLIC_DEBUG_LOGS === 'true';

/* ─── API Yapılandırması ─── */
export const API_BASE_URL = 'https://api.bkns-software.com/api/v1';

/** Servis prefix'leri — her modül kendi prefix'i altında çalışır */
export const API_SERVICES = {
  IAM: 'iam',
  CRM: 'crm',
  CATALOG: 'catalog',
  INVENTORY: 'inventory',
  LOGISTICS: 'logistics',
  PRODUCTION: 'production',
  SALES: 'sales',
  B2B: 'b2b',
} as const;

