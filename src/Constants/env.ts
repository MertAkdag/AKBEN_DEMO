export const GOLD_PRICE_API_KEY = process.env.EXPO_PUBLIC_GOLD_PRICE_API_KEY ?? '';

/** true ise release dahil konsola INFO/WARN yazılır (Metro / Xcode / Logcat) */
export const DEBUG_LOGS =
  process.env.EXPO_PUBLIC_DEBUG_LOGS === '1' ||
  process.env.EXPO_PUBLIC_DEBUG_LOGS === 'true';

/* ─── API Yapılandırması ─── */
export const API_BASE_URL = 'https://api.bkns-software.com/api/v1';

/**
 * GET /catalog/products kategori query anahtarı.
 * İkisi birden gönderilince bazı backend'ler AND ile farklı kolonlara bağlayıp 0 sonuç döndürebilir.
 * Gerekirse .env: EXPO_PUBLIC_CATALOG_CATEGORY_QUERY=categoryId | both
 */
export type CatalogProductCategoryQueryKey = 'kategoriId' | 'categoryId' | 'both';

const categoryQueryRaw = (process.env.EXPO_PUBLIC_CATALOG_CATEGORY_QUERY ?? 'kategoriId').toLowerCase();

export const CATALOG_PRODUCT_CATEGORY_QUERY: CatalogProductCategoryQueryKey =
  categoryQueryRaw === 'categoryid' || categoryQueryRaw === 'category_id'
    ? 'categoryId'
    : categoryQueryRaw === 'both' || categoryQueryRaw === 'her_ikisi'
      ? 'both'
      : 'kategoriId';

/**
 * Kategori filtresi tanısı (Metro log).
 * - sample | 1 | true: Filtre 0 döndüyse ek istekle filtresiz örnekte kategoriId dağılımı + hedef id var mı
 * - probe: Yukarısı + hedef örnekte varsa kategoriId / categoryId / both denemeleri (hangi param çalışıyor)
 * .env: EXPO_PUBLIC_CATALOG_FILTER_DIAGNOSTIC=sample | probe
 */
export type CatalogFilterDiagnosticMode = 'off' | 'sample' | 'probe';

const diagRaw = (process.env.EXPO_PUBLIC_CATALOG_FILTER_DIAGNOSTIC ?? 'off').toLowerCase();

export const CATALOG_FILTER_DIAGNOSTIC: CatalogFilterDiagnosticMode =
  diagRaw === 'probe'
    ? 'probe'
    : diagRaw === 'sample' || diagRaw === '1' || diagRaw === 'true'
      ? 'sample'
      : 'off';

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

