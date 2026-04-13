import type {
  CatalogProductsResponse,
  ProductDetailResponse,
  CategoriesResponse,
  BrandsResponse,
  UnitsResponse,
  Product,
  Category,
  Brand,
  Unit,
} from '../Types/catalog';
import {
  normalizeProduct,
  normalizeCategory,
  normalizeBrand,
  normalizeUnit,
} from '../Types/catalog';
import { axiosClient, type ApiResponse } from './axiosClient';
import {
  API_SERVICES,
  CATALOG_PRODUCT_CATEGORY_QUERY,
  CATALOG_FILTER_DIAGNOSTIC,
} from '../Constants/env';
import { logger } from '../Utils/logger';

const SVC = API_SERVICES.CATALOG;

const CATALOG_FETCH_ALL_LIMIT = 100;
const CATALOG_FETCH_ALL_MAX_PAGES = 30;

const DIAG_SAMPLE_LIMIT = 200;

/** Filtresiz tüm sayfalar — özet histogram ve istemci kategori filtresi için ortak */
async function fetchAllNormalizedCatalogProducts(): Promise<{
  products: Product[];
  reportedTotal: number;
}> {
  const firstResponse = await axiosClient.get<ApiResponse<any[]>>(`/${SVC}/products`, {
    params: { page: 1, limit: CATALOG_FETCH_ALL_LIMIT, pageSize: CATALOG_FETCH_ALL_LIMIT },
  });
  const pagination = firstResponse.data.metadata?.pagination;
  const reportedTotal = pagination?.total ?? firstResponse.data.data.length;
  const totalPages = Math.min(pagination?.totalPages ?? 1, CATALOG_FETCH_ALL_MAX_PAGES);
  let all = firstResponse.data.data.map(normalizeProduct);
  for (let p = 2; p <= totalPages; p++) {
    const res = await axiosClient.get<ApiResponse<any[]>>(`/${SVC}/products`, {
      params: { page: p, limit: CATALOG_FETCH_ALL_LIMIT, pageSize: CATALOG_FETCH_ALL_LIMIT },
    });
    all = all.concat(res.data.data.map(normalizeProduct));
  }
  return { products: all, reportedTotal };
}

type DiagnosticOpts = { forceSample?: boolean; forceProbe?: boolean };

/** Filtre 0 iken veya manuel: veride hedef kategori var mı, hangi query param işe yarıyor */
async function runCategoryFilterDiagnostics(
  expectedCategoryId: string,
  opts?: DiagnosticOpts,
): Promise<void> {
  const mode: typeof CATALOG_FILTER_DIAGNOSTIC =
    opts?.forceProbe ? 'probe' : opts?.forceSample ? 'sample' : CATALOG_FILTER_DIAGNOSTIC;
  if (mode === 'off') return;

  try {
    const sampleRes = await axiosClient.get<ApiResponse<any[]>>(`/${SVC}/products`, {
      params: { page: 1, limit: DIAG_SAMPLE_LIMIT, pageSize: DIAG_SAMPLE_LIMIT },
    });
    const rows = sampleRes.data.data.map(normalizeProduct);
    const pagination = sampleRes.data.metadata?.pagination;
    const totalInApi = pagination?.total ?? rows.length;

    const hist: Record<number, number> = {};
    for (const p of rows) {
      hist[p.kategoriId] = (hist[p.kategoriId] ?? 0) + 1;
    }
    const kid = Number(expectedCategoryId);
    const hedefOrnekte = rows.filter((p) => p.kategoriId === kid).length;
    const kategoriIdListesi = Object.keys(hist)
      .map(Number)
      .sort((a, b) => a - b);

    let yorum: string;
    if (hedefOrnekte > 0) {
      yorum =
        'Örnekte bu kategoriId ile ürün VAR; filtreli istek 0 döndü → büyük olasılıkla query parametresi / backend filtresi hatalı.';
    } else if (totalInApi <= rows.length) {
      yorum =
        'Filtresiz örnekte bu kategoriId yok (tüm liste tarandıysa) → ürünler başka kategori id ile kayıtlı veya kategori boş.';
    } else {
      yorum = `API toplam ürün ${totalInApi} > örnek ${rows.length}; tam liste için sayfalama veya DB kontrolü gerekir.`;
    }

    logger.info('[Catalog] TANI — filtresiz örnek (kategori filtresi 0 sonrası)', {
      mod: mode,
      hedefKategoriId: kid,
      ornektekiUrunSayisi: rows.length,
      apiToplamUrun: totalInApi,
      ornekteHedefIdAdedi: hedefOrnekte,
      ornektekiKategoriIdler: kategoriIdListesi,
      kategoriIdHistogram: hist,
      yorum,
    });

    if (mode !== 'probe' || hedefOrnekte === 0) {
      return;
    }

    const probes: { ad: string; params: Record<string, string | number> }[] = [
      { ad: 'sadece_kategoriId', params: { page: 1, limit: 10, kategoriId: expectedCategoryId } },
      { ad: 'sadece_categoryId', params: { page: 1, limit: 10, categoryId: expectedCategoryId } },
      {
        ad: 'kategoriId_ve_categoryId',
        params: { page: 1, limit: 10, kategoriId: expectedCategoryId, categoryId: expectedCategoryId },
      },
    ];

    for (const probe of probes) {
      const pr = await axiosClient.get<ApiResponse<any[]>>(`/${SVC}/products`, { params: probe.params });
      const tot = pr.data.metadata?.pagination?.total ?? pr.data.data.length;
      logger.info('[Catalog] TANI — parametre denemesi', {
        deneme: probe.ad,
        params: probe.params,
        donenToplam: tot,
        ilkSayfaAdet: pr.data.data.length,
      });
    }
  } catch (e) {
    logger.warn('[Catalog] TANI isteği başarısız', e);
  }
}

export const catalogService = {
  /**
   * Kategorileri listele
   * GET /catalog/categories
   */
  async getCategories(categoryId?: number): Promise<CategoriesResponse> {
    const params: Record<string, any> = {};
    if (categoryId != null) params.categoryId = categoryId;

    logger.info('[Catalog] getCategories isteği', {
      path: `/${SVC}/categories`,
      params,
    });

    const response = await axiosClient.get<ApiResponse<any[]>>(
      `/${SVC}/categories`,
      { params },
    );

    const normalized = response.data.data.map((raw: any, index: number) => {
      if (raw?.id == null && raw?.kategoriId == null) {
        logger.warn('[Catalog] Kategori kaydında id/kategoriId yok', {
          index,
          keys: raw != null ? Object.keys(raw) : [],
          kategoriAdi: raw?.kategoriAdi,
        });
      }
      return normalizeCategory(raw);
    });

    const ustOrnekleri = normalized
      .filter((c) => c.ustKategoriId != null)
      .slice(0, 8)
      .map((c) => ({ id: c.id, ustKategoriId: c.ustKategoriId, ad: c.name }));
    logger.info('[Catalog] getCategories', {
      count: normalized.length,
      ids: normalized.map((c) => c.id),
      ...(ustOrnekleri.length > 0 ? { ustKategoriIdOrnekleri: ustOrnekleri } : { ustKategoriIdNotu: 'API yanıtında ustKategoriId yok; alt kategori ağacı kurulamaz' }),
    });

    return {
      success: true,
      data: normalized,
      meta: response.data.metadata?.pagination
        ? { pagination: response.data.metadata.pagination }
        : undefined,
    };
  },

  /**
   * Kategori detayı
   * GET /catalog/categories/:id
   */
  async getCategoryById(id: number): Promise<{ success: boolean; data: Category }> {
    const response = await axiosClient.get<ApiResponse<any>>(
      `/${SVC}/categories/${id}`,
    );

    return {
      success: true,
      data: normalizeCategory(response.data.data),
    };
  },

  /**
   * Ürünleri listele
   * GET /catalog/products
   */
  async getProducts(
    page = 1,
    limit = 20,
    categoryId?: string,
    search?: string,
  ): Promise<CatalogProductsResponse> {
    const params: Record<string, any> = { page, limit, pageSize: limit };
    if (categoryId) {
      const q = CATALOG_PRODUCT_CATEGORY_QUERY;
      if (q === 'categoryId' || q === 'both') params.categoryId = categoryId;
      if (q === 'kategoriId' || q === 'both') params.kategoriId = categoryId;
    }
    if (search) params.search = search;

    logger.info('[Catalog] getProducts isteği', {
      path: `/${SVC}/products`,
      categoryQueryMode: CATALOG_PRODUCT_CATEGORY_QUERY,
      params,
      categoryFilter: categoryId ?? '(yok)',
      search: search ?? '(yok)',
    });

    const response = await axiosClient.get<ApiResponse<any[]>>(
      `/${SVC}/products`,
      { params },
    );

    const normalized = response.data.data.map(normalizeProduct);
    const pagination = response.data.metadata?.pagination;

    const distinctKategoriIds = [...new Set(normalized.map((p) => p.kategoriId))].sort((a, b) => a - b);
    const expectedKid = categoryId != null ? Number(categoryId) : null;
    const filterCheck =
      expectedKid == null || Number.isNaN(expectedKid)
        ? 'filtre_yok'
        : distinctKategoriIds.length === 0
          ? 'bos_sayfa'
          : distinctKategoriIds.every((kid) => kid === expectedKid)
            ? 'uyumlu'
            : 'uyusmuyor_backend_filtre_uygulamamis_olabilir';

    logger.info('[Catalog] getProducts yanıtı', {
      itemCount: normalized.length,
      pagination,
      distinctKategoriIdsInPage: distinctKategoriIds,
      beklenenKategoriId: expectedKid,
      kategoriFiltreKontrol: filterCheck,
    });

    const filtreBos =
      categoryId != null &&
      (pagination?.total === 0 || (pagination == null && normalized.length === 0));
    if (filtreBos) {
      void runCategoryFilterDiagnostics(categoryId);
    }

    return {
      success: true,
      data: normalized,
      meta: response.data.metadata?.pagination
        ? { pagination: response.data.metadata.pagination }
        : undefined,
    };
  },

  /**
   * Kategori filtresi tanısı (Metro). Env kapalı olsa da çalışır: filtresiz örnek + probe.
   * Örnek: import { catalogService } from '...'; await catalogService.diagnoseCatalogCategoryFilter(36);
   */
  async diagnoseCatalogCategoryFilter(categoryId: number): Promise<void> {
    await runCategoryFilterDiagnostics(String(categoryId), { forceProbe: true });
  },

  /**
   * Filtresiz tüm sayfaları çekip katalogdaki ürünlerin kategoriId dağılımını çıkarır.
   * Kategori chip id’si ile ürün kategoriId’lerini karşılaştırmak için (Tümü verisi).
   */
  async getProductKategoriPresenceSummary(): Promise<{
    ids: number[];
    histogram: Record<number, number>;
    totalProducts: number;
    loadedCount: number;
  }> {
    const { products: all, reportedTotal } = await fetchAllNormalizedCatalogProducts();

    const histogram: Record<number, number> = {};
    for (const p of all) {
      histogram[p.kategoriId] = (histogram[p.kategoriId] ?? 0) + 1;
    }
    const ids = Object.keys(histogram)
      .map(Number)
      .sort((a, b) => a - b);

    logger.info('[Catalog] Tümü — katalogdaki kategoriId özeti', {
      apiToplamUrun: reportedTotal,
      yuklenenSatir: all.length,
      kategoriIds: ids,
      histogram,
    });

    return { ids, histogram, totalProducts: reportedTotal, loadedCount: all.length };
  },

  /**
   * API tek kategoriId ile eşleşmeyen chip’ler: tüm katalogu çekip birden fazla ürün kategoriId’sine göre süzme.
   */
  async getProductsClientFilteredByKategoriIds(
    productKategoriIds: number[],
    search: string | undefined,
    page: number,
    limit: number,
  ): Promise<CatalogProductsResponse> {
    const { products: all } = await fetchAllNormalizedCatalogProducts();
    const idSet = new Set(productKategoriIds);
    let list = all.filter((p) => idSet.has(p.kategoriId));
    const q = search?.trim();
    if (q) {
      const ql = q.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(ql) ||
          (p.description && p.description.toLowerCase().includes(ql)) ||
          (p.urunAdi && p.urunAdi.toLowerCase().includes(ql)),
      );
    }
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / limit) || 1);
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const start = (currentPage - 1) * limit;
    const data = list.slice(start, start + limit);
    const pagination = {
      total,
      limit,
      currentPage,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      nextPage: currentPage < totalPages ? currentPage + 1 : null,
      previousPage: currentPage > 1 ? currentPage - 1 : null,
    };

    logger.info('[Catalog] İstemci kategori filtresi', {
      productKategoriIds,
      eslesenToplam: total,
      sayfa: currentPage,
      arama: q ?? '(yok)',
    });

    return { success: true, data, meta: { pagination } };
  },

  /**
   * Ürün detayı
   * GET /catalog/products/:id
   */
  async getProductById(id: string): Promise<ProductDetailResponse> {
    const response = await axiosClient.get<ApiResponse<any>>(
      `/${SVC}/products/${id}`,
    );

    return {
      success: true,
      data: normalizeProduct(response.data.data),
    };
  },

  /**
   * Öne çıkan ürünler (katalogdaGoster=true)
   * GET /catalog/products?katalogdaGoster=true
   */
  async getFeaturedProducts(): Promise<{ success: boolean; data: Product[] }> {
    const response = await axiosClient.get<ApiResponse<any[]>>(
      `/${SVC}/products`,
      { params: { katalogdaGoster: true, limit: 20 } },
    );

    return {
      success: true,
      data: response.data.data.map(normalizeProduct),
    };
  },

  /**
   * Markaları listele
   * GET /catalog/brands
   */
  async getBrands(): Promise<BrandsResponse> {
    const response = await axiosClient.get<ApiResponse<any[]>>(
      `/${SVC}/brands`,
    );

    return {
      success: true,
      data: response.data.data.map(normalizeBrand),
      meta: response.data.metadata?.pagination
        ? { pagination: response.data.metadata.pagination }
        : undefined,
    };
  },

  /**
   * Birimleri listele
   * GET /catalog/units
   */
  async getUnits(): Promise<UnitsResponse> {
    const response = await axiosClient.get<ApiResponse<any[]>>(
      `/${SVC}/units`,
    );

    return {
      success: true,
      data: response.data.data.map(normalizeUnit),
      meta: response.data.metadata?.pagination
        ? { pagination: response.data.metadata.pagination }
        : undefined,
    };
  },
};
