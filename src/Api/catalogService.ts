import type {
  CatalogProductsResponse,
  ProductDetailResponse,
  CategoriesResponse,
  VariantsResponse,
  Product,
} from '../Types/catalog';
import {
  getMockProducts,
  getMockProductById,
  getMockCategories,
  getMockFeaturedProducts,
} from './mockData';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const catalogService = {
  async getCategories(): Promise<CategoriesResponse> {
    await delay(200);
    return { success: true, data: getMockCategories() };
  },

  async getProducts(
    page = 1,
    pageSize = 20,
    categoryId?: string,
    search?: string
  ): Promise<CatalogProductsResponse> {
    await delay(350);
    return getMockProducts(page, pageSize, categoryId, search);
  },

  async getProductById(id: string): Promise<ProductDetailResponse> {
    await delay(250);
    const result = getMockProductById(id);
    if (!result) throw new Error('Ürün bulunamadı');
    return result;
  },

  async getFeaturedProducts(): Promise<{ success: boolean; data: Product[] }> {
    await delay(250);
    return { success: true, data: getMockFeaturedProducts() };
  },
};
