import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../Api/catalogService';

const catalogKeys = {
  all: ['catalog'] as const,
  categories: () => [...catalogKeys.all, 'categories'] as const,
  products: (filters: { categoryId?: number; search?: string; page?: number }) =>
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

export function useCatalogProducts(categoryId?: number, search = '', page = 1) {
  return useQuery({
    queryKey: catalogKeys.products({ categoryId, search, page }),
    queryFn: () => catalogService.getProducts(page, 20, categoryId != null ? String(categoryId) : undefined, search || undefined),
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
