import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { catalogService } from '../Api/catalogService';
import {
  categoryTreeSignature,
  getProductKategoriIdsForChip,
} from '../Constants/categoryProductKategoriMap';
import type { Category } from '../Types/catalog';

export const catalogKeys = {
  all: ['catalog'] as const,
  categories: () => [...catalogKeys.all, 'categories'] as const,
  products: (filters: {
    categoryId?: number;
    search?: string;
    page?: number;
    clientMulti?: boolean;
    treeSig?: string;
  }) => [...catalogKeys.all, 'products', filters] as const,
  product: (id: string) => [...catalogKeys.all, 'product', id] as const,
  featured: () => [...catalogKeys.all, 'featured'] as const,
  kategoriPresence: () => [...catalogKeys.all, 'kategori-presence'] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: catalogKeys.categories(),
    queryFn: () => catalogService.getCategories(),
    staleTime: 1000 * 60 * 5,
    select: (data) => data.data,
  });
}

export function useCatalogProducts(
  categoryId?: number,
  search = '',
  categories?: Category[],
) {
  const kidList = categoryId != null ? getProductKategoriIdsForChip(categoryId, categories) : null;
  const clientMulti = kidList != null && kidList.length > 1;
  const treeSig = categoryTreeSignature(categories);

  return useInfiniteQuery({
    queryKey: catalogKeys.products({ categoryId, search, clientMulti, treeSig }),
    queryFn: ({ pageParam }) => {
      const page = pageParam as number;
      if (categoryId == null) {
        return catalogService.getProducts(page, 20, undefined, search || undefined);
      }
      const ids = getProductKategoriIdsForChip(categoryId, categories)!;
      if (clientMulti) {
        return catalogService.getProductsClientFilteredByKategoriIds(ids, search, page, 20);
      }
      return catalogService.getProducts(page, 20, String(ids[0]), search || undefined);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pg = lastPage.meta?.pagination;
      if (!pg?.hasNextPage || !pg.nextPage) return undefined;
      return pg.nextPage;
    },
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

/** Tümü modundaki tüm sayfalar: hangi kategoriId’lerde ürün var (chip / API uyumu) */
export function useCatalogKategoriPresence() {
  return useQuery({
    queryKey: catalogKeys.kategoriPresence(),
    queryFn: () => catalogService.getProductKategoriPresenceSummary(),
    staleTime: 1000 * 60 * 5,
  });
}
