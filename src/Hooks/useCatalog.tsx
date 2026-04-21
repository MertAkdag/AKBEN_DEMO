import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { catalogService } from '../Api/catalogService';

export const catalogKeys = {
  all: ['catalog'] as const,
  categories: () => [...catalogKeys.all, 'categories'] as const,
  subCategories: (parentId?: number) => [...catalogKeys.all, 'subCategories', parentId ?? null] as const,
  brands: () => [...catalogKeys.all, 'brands'] as const,
  products: (filters: { categoryId?: number; search?: string }) =>
    [...catalogKeys.all, 'products', filters] as const,
  product: (id: string) => [...catalogKeys.all, 'product', id] as const,
  featured: () => [...catalogKeys.all, 'featured'] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: catalogKeys.categories(),
    queryFn: () => catalogService.getCategories(),
    staleTime: 1000 * 60 * 5,
    select: (data) => data.data,
  });
}

/**
 * Alt kategorileri getirir. Backend `categoryId` parametresi ile verilen
 * üst kategorinin direkt alt kategorilerini döner.
 */
export function useSubCategories(parentId?: number) {
  return useQuery({
    queryKey: catalogKeys.subCategories(parentId),
    queryFn: () => catalogService.getCategories(parentId),
    enabled: parentId != null,
    staleTime: 1000 * 60 * 5,
    select: (data) => data.data,
  });
}

export function useBrands() {
  return useQuery({
    queryKey: catalogKeys.brands(),
    queryFn: () => catalogService.getBrands(),
    staleTime: 1000 * 60 * 10,
    select: (data) => data.data,
  });
}

export function useCatalogProducts(categoryId?: number, search = '') {
  return useInfiniteQuery({
    queryKey: catalogKeys.products({ categoryId, search }),
    queryFn: ({ pageParam }) =>
      catalogService.getProducts(
        pageParam as number,
        20,
        categoryId != null ? String(categoryId) : undefined,
        search || undefined,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.meta?.pagination?.nextPage ?? undefined,
    staleTime: 1000 * 60 * 2,
  });
}

export function useProductDetail(id: string | null) {
  return useQuery({
    queryKey: catalogKeys.product(id ?? ''),
    queryFn: () => catalogService.getProductById(id!),
    enabled: !!id,
    staleTime: 1000 * 60,
    select: (data) => data.data,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: catalogKeys.featured(),
    queryFn: () => catalogService.getFeaturedProducts(),
    staleTime: 1000 * 60 * 2,
    select: (data) => data.data,
  });
}
