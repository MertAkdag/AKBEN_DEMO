/** CATALOG: Materyal bilgisi (22 Ayar, 14 Ayar vb.) */
export interface Materyal {
  id: number;
  materyalAdi: string;
}

/** CATALOG: Kategori (Bilezik, Yüzük, Kolye vb.) */
export interface Category {
  id: number;
  kategoriKodu: string;
  kategoriAdi: string;
  ustKategoriId?: number | null;
  derinlik?: number;
  varsayilanMateryalId?: number | null;
  varsayilanMateryal?: Materyal | null;
  aciklama?: string;
  aktifMi: boolean;
  childCount?: number;
  createdAt: string;
  updatedAt: string;

  /* ── Uyumluluk alanları ── */
  /** kategoriAdi alias */
  name: string;
  slug: string;
  productCount?: number;
}

/** CATALOG: Marka */
export interface Brand {
  id: number;
  markaAdi: string;
  aciklama?: string;
  aktifMi: boolean;
  createdAt: string;
  updatedAt: string;

  /* ── Uyumluluk ── */
  name: string;
}

/** CATALOG: Birim (Adet, Gram) */
export interface Unit {
  id: number;
  birimKodu: string;
  birimAdi: string;
  aciklama?: string;
  aktifMi: boolean;
  createdAt: string;
  updatedAt: string;

  /* ── Uyumluluk ── */
  name: string;
  symbol: string;
}

/** CATALOG: Ürün görsel */
export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  sira?: number;
}

/** CATALOG: Ürün */
export interface Product {
  id: string;
  urunKodu: string;
  urunAdi: string;
  kategoriId: number;
  markaId: number;
  birimId: number;
  kategori?: { id: number; kategoriKodu: string; kategoriAdi: string };
  marka?: { id: number; markaAdi: string };
  birim?: { id: number; birimKodu: string; birimAdi: string };
  agirlikGr: number;
  alisFiyati: number;
  satisFiyati: number;
  kdvOrani: number;
  iscilikMilyem: number;
  iscilikAdet: number;
  iscilikTipi: string;
  milyemKatsayisi: number;
  karMarjOrani: number;
  karMilyem: number;
  tasAgirlikGr: number;
  minStokSeviyesi: number;
  maxStokSeviyesi: number;
  kritikStokSeviyesi: number;
  aciklama?: string;
  aktifMi: boolean;
  materyalId?: number;
  katalogdaGoster: boolean;
  yeni: boolean;
  indirimli: boolean;
  images: ProductImage[];
  bakiyeCount?: number;
  createdAt: string;
  updatedAt: string;

  /* ── Uyumluluk alanları (UI'da kolay kullanım) ── */
  name: string;
  description?: string;
  categoryId: string;
  variantId: string;
  brandId?: string;
  unitId: string;
  pricePerUnit: number;
  imageUrl?: string;
  featured?: boolean;
  /** UI uyumluluk: kategori objesi */
  category?: { id: number; name: string; slug: string };
  /** UI uyumluluk: marka objesi */
  brand?: { id: number; name: string };
  /** UI uyumluluk: birim objesi */
  unit?: { id: number; name: string; symbol: string };
  /** UI uyumluluk: varyant objesi */
  variant?: { id: string; name: string; slug: string };
}

/** CATALOG: Varyant (14K, 18K, 925 gümüş vb.) — şu an API'de yok, ileride eklenebilir */
export interface Variant {
  id: string;
  name: string;
  slug: string;
}

/* ─── Response tipleri ─── */

export interface CatalogProductsResponse {
  success: boolean;
  data: Product[];
  meta?: {
    pagination: {
      total: number;
      limit: number;
      currentPage: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      nextPage: number | null;
      previousPage: number | null;
    };
  };
}

export interface ProductDetailResponse {
  success: boolean;
  data: Product;
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
  meta?: {
    pagination: {
      total: number;
      limit: number;
      currentPage: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      nextPage: number | null;
      previousPage: number | null;
    };
  };
}

export interface BrandsResponse {
  success: boolean;
  data: Brand[];
  meta?: {
    pagination: {
      total: number;
      limit: number;
      currentPage: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      nextPage: number | null;
      previousPage: number | null;
    };
  };
}

export interface UnitsResponse {
  success: boolean;
  data: Unit[];
  meta?: {
    pagination: {
      total: number;
      limit: number;
      currentPage: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      nextPage: number | null;
      previousPage: number | null;
    };
  };
}

export interface VariantsResponse {
  success: boolean;
  data: Variant[];
}

/* ─── Normalize fonksiyonları ─── */

/** API'den gelen ham product verisini normalize et */
export function normalizeProduct(raw: any): Product {
  return {
    ...raw,
    name: raw.urunAdi ?? '',
    description: raw.aciklama,
    categoryId: String(raw.kategoriId ?? ''),
    variantId: '',
    brandId: raw.markaId != null ? String(raw.markaId) : undefined,
    unitId: String(raw.birimId ?? ''),
    pricePerUnit: raw.satisFiyati ?? 0,
    imageUrl: raw.images?.[0]?.url ?? undefined,
    featured: raw.katalogdaGoster ?? false,
    // UI uyumluluk objeleri
    category: raw.kategori
      ? { id: raw.kategori.id, name: raw.kategori.kategoriAdi ?? '', slug: raw.kategori.kategoriKodu?.toLowerCase() ?? '' }
      : undefined,
    brand: raw.marka
      ? { id: raw.marka.id, name: raw.marka.markaAdi ?? '' }
      : undefined,
    unit: raw.birim
      ? { id: raw.birim.id, name: raw.birim.birimAdi ?? '', symbol: raw.birim.birimKodu ?? '' }
      : undefined,
    variant: undefined,
  };
}

/** API'den gelen ham category verisini normalize et */
export function normalizeCategory(raw: any): Category {
  return {
    ...raw,
    name: raw.kategoriAdi ?? '',
    slug: raw.kategoriKodu?.toLowerCase() ?? '',
    productCount: raw.childCount ?? 0,
  };
}

/** API'den gelen ham brand verisini normalize et */
export function normalizeBrand(raw: any): Brand {
  return {
    ...raw,
    name: raw.markaAdi ?? '',
  };
}

/** API'den gelen ham unit verisini normalize et */
export function normalizeUnit(raw: any): Unit {
  return {
    ...raw,
    name: raw.birimAdi ?? '',
    symbol: raw.birimKodu ?? '',
  };
}
