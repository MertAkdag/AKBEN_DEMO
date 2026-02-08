/** CATALOG: Kategori (Bilezik, Yüzük, Kolye vb.) */
export interface Category {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
}

/** CATALOG: Varyant (14K, 18K, 925 gümüş vb.) */
export interface Variant {
  id: string;
  name: string;
  slug: string;
}

/** CATALOG: Marka */
export interface Brand {
  id: string;
  name: string;
}

/** CATALOG: Birim (Adet, Gram) */
export interface Unit {
  id: string;
  name: string;
  symbol: string;
}

/** CATALOG: Ürün */
export interface Product {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  category?: Category;
  variantId: string;
  variant?: Variant;
  brandId?: string;
  brand?: Brand;
  unitId: string;
  unit?: Unit;
  /** Birim fiyat (₺/adet veya ₺/gr) */
  pricePerUnit: number;
  /** Görsel URL – mock’ta boş, placeholder kullanılır */
  imageUrl?: string;
  /** Öne çıkan ürün (hero / öne çıkanlar) */
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogProductsResponse {
  success: boolean;
  data: Product[];
  meta?: {
    pagination: {
      totalCount: number;
      currentPage: number;
      pageSize: number;
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
}

export interface VariantsResponse {
  success: boolean;
  data: Variant[];
}
