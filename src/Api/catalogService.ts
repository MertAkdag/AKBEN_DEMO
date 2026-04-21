import type {
  CatalogProductsResponse,
  ProductDetailResponse,
  CategoriesResponse,
  BrandsResponse,
  UnitsResponse,
  Category,
} from '../Types/catalog';
import {
  normalizeProduct,
  normalizeCategory,
  normalizeBrand,
  normalizeUnit,
} from '../Types/catalog';
import { axiosClient, type ApiResponse } from './axiosClient';
import { API_SERVICES } from '../Constants/env';
import { logger } from '../Utils/logger';

const SVC = API_SERVICES.CATALOG;

export const catalogService = {
  /**
   * Kategorileri listele
   * GET /catalog/categories
   */
  async getCategories(categoryId?: number): Promise<CategoriesResponse> {
    const params: Record<string, any> = {};
    if (categoryId != null) params.categoryId = categoryId;

    const response = await axiosClient.get<ApiResponse<any[]>>(
      `/${SVC}/categories`,
      { params },
    );

    const normalized = response.data.data.map(normalizeCategory);

    logger.info('[Catalog] getCategories', {
      count: normalized.length,
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
   * GET /catalog/products?kategoriId=...&search=...
   * Backend, parent kategori verildiğinde alt kategorilerin ürünlerini de döndürür.
   */
  async getProducts(
    page = 1,
    limit = 20,
    kategoriId?: string,
    search?: string,
  ): Promise<CatalogProductsResponse> {
    const params: Record<string, any> = { page, limit, pageSize: limit };
    if (kategoriId) params.kategoriId = kategoriId;
    if (search) params.search = search;

    const response = await axiosClient.get<ApiResponse<any[]>>(
      `/${SVC}/products`,
      { params },
    );

    return {
      success: true,
      data: response.data.data.map(normalizeProduct),
      meta: response.data.metadata?.pagination
        ? { pagination: response.data.metadata.pagination }
        : undefined,
    };
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
  async getFeaturedProducts(): Promise<CatalogProductsResponse> {
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
