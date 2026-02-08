import { useQuery } from '@tanstack/react-query';
import { cariService } from '../Api/cariService';
import type { CariFilterOption } from '../Types/cari';

export const cariKeys = {
  all: ['cariler'] as const,
  lists: () => [...cariKeys.all, 'list'] as const,
  detail: (id: string) => [...cariKeys.all, 'detail', id] as const,
};

export function useCarilerList() {
  return useQuery({
    queryKey: cariKeys.lists(),
    queryFn: () => cariService.getCariler(),
    staleTime: 1000 * 60 * 2,
    select: (data) => data.data,
  });
}

export function useFilteredCariler(filter: CariFilterOption, searchQuery: string = '') {
  const { data: cariler, ...rest } = useCarilerList();

  const filtered = cariler?.filter((cari) => {
    const matchBalance =
      filter === 'All' ||
      (filter === 'Alacakli' && cari.balance > 0) ||
      (filter === 'Borclu' && cari.balance < 0);

    const searchLower = searchQuery.toLowerCase();
    const matchSearch =
      searchQuery === '' ||
      cari.name.toLowerCase().includes(searchLower) ||
      cari.phone.includes(searchQuery) ||
      (cari.email?.toLowerCase().includes(searchLower) ?? false);

    return matchBalance && matchSearch;
  });

  return {
    cariler: filtered ?? [],
    ...rest,
  };
}

export function useCariDetail(id: string | null) {
  return useQuery({
    queryKey: cariKeys.detail(id ?? ''),
    queryFn: () => cariService.getCariById(id!),
    enabled: !!id,
    staleTime: 1000 * 60,
    select: (data) => data.data,
  });
}
