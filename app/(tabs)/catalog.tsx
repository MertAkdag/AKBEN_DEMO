import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Spacing } from '../../src/Constants/Spacing';
import { ScreenHeader } from '../../src/Shared/Header';
import { SearchInput } from '../../src/Components/Ui/SearchInput';
import { ProductCard } from '../../src/Components/Cards/ProductCard';
import {
  useCatalogProducts,
  useCategories,
  useCatalogKategoriPresence,
} from '../../src/Hooks/useCatalog';
import { Product } from '../../src/Types/catalog';
import { useResponsive } from '../../src/Hooks/UseResponsive';
import { useTheme } from '../../src/Context/ThemeContext';
import { logger } from '../../src/Utils/logger';
import { chipHasProductsInPresence } from '../../src/Constants/categoryProductKategoriMap';

const TAB_BAR_HEIGHT = 100;

export default function CatalogScreen() {
  const router = useRouter();
  const { calculateFontSize } = useResponsive();
  const { colors } = useTheme();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: categories } = useCategories();
  const {
    data: productsPages,
    isLoading: productsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useCatalogProducts(selectedCategoryId, searchQuery, categories);
  const {
    data: presence,
    refetch: refetchPresence,
    isFetching: presenceFetching,
    isRefetching: presenceRefetching,
  } = useCatalogKategoriPresence();
  const products = useMemo(
    () => productsPages?.pages.flatMap((p) => p.data) ?? [],
    [productsPages]
  );
  const presenceIds = presence?.ids;

  const onProductPress = useCallback((product: Product) => { router.push(`/catalog/${product.id}`); }, [router]);
  const renderProduct = useCallback(
    ({ item, index }: { item: Product; index: number }) => <ProductCard product={item} onPress={() => onProductPress(item)} index={index} />,
    [onProductPress]
  );

  const emptyPrimary = useMemo(() => {
    if (searchQuery.trim()) return 'Bu aramaya uygun ürün yok';
    if (selectedCategoryId == null) return 'Henüz ürün eklenmemiş';
    return 'Bu kriterlere uygun ürün yok';
  }, [searchQuery, selectedCategoryId]);

  const emptyDetail = useMemo(() => {
    if (searchQuery.trim() || selectedCategoryId == null || productsLoading) return null;
    if (presenceIds == null) {
      return presenceFetching ? 'Katalogdaki kategori eşlemesi yükleniyor…' : null;
    }
    const name = categories?.find((c) => c.id === selectedCategoryId)?.name;
    const label = name ? `${selectedCategoryId} · ${name}` : String(selectedCategoryId);
    if (!chipHasProductsInPresence(selectedCategoryId, presenceIds, categories)) {
      return `Bu kategori kartı (${label}) için tanımlı ürün kategoriId’leri bu katalogda yok. Şu numaralarda ürün var: ${presenceIds.join(', ')}.`;
    }
    return `Eşleme veya arama sonucu boş. Filtreyi veya arama metnini kontrol edin.`;
  }, [
    searchQuery,
    selectedCategoryId,
    productsLoading,
    presenceIds,
    presenceFetching,
    categories,
  ]);

  const onRefreshCatalog = useCallback(async () => {
    await Promise.all([refetch(), refetchPresence()]);
  }, [refetch, refetchPresence]);

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const ListHeader = useMemo(
    () => (
      <>
        <ScreenHeader title="Katalog" subtitle="Seçkin koleksiyon" />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chipsScroll}
          style={s.chipsWrap}
        >
          <TouchableOpacity
            style={[s.chip, { backgroundColor: colors.card, borderColor: colors.border },
            !selectedCategoryId && { backgroundColor: colors.primary + '22', borderColor: colors.primary }]}
            onPress={() => {
              logger.info('[Catalog UI] Kategori filtresi: Tümü');
              setSelectedCategoryId(undefined);
            }}
          >
            <Text style={[s.chipText, { fontSize: calculateFontSize(13), color: colors.subtext },
            !selectedCategoryId && { color: colors.primary }]}>
              Tümü
            </Text>
          </TouchableOpacity>
          {categories?.map((cat) => {
            const chipMuted =
              presenceIds != null &&
              !chipHasProductsInPresence(cat.id, presenceIds, categories) &&
              selectedCategoryId !== cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  s.chip,
                  { backgroundColor: colors.card, borderColor: colors.border, opacity: chipMuted ? 0.52 : 1 },
                  selectedCategoryId === cat.id && { backgroundColor: colors.primary + '22', borderColor: colors.primary, opacity: 1 },
                ]}
                onPress={() => {
                  logger.info('[Catalog UI] Kategori chip', { id: cat.id, ad: cat.name });
                  setSelectedCategoryId(cat.id);
                }}
              >
                <Text style={[s.chipText, { fontSize: calculateFontSize(13), color: colors.subtext },
                selectedCategoryId === cat.id && { color: colors.primary }]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <SearchInput value={searchQuery} onChangeText={setSearchQuery} placeholder="Ürün ara..." activeFilterCount={2} />
      </>
    ),
    [
      colors,
      categories,
      selectedCategoryId,
      searchQuery,
      calculateFontSize,
      presenceIds,
    ]
  );

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['top']}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={s.row}
        contentContainerStyle={s.listContent}
        ListHeaderComponent={ListHeader}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !productsLoading ? (
            <View style={s.empty}>
              <Ionicons name="search-outline" size={40} color={colors.subtext} />
              <Text style={[s.emptyText, { color: colors.subtext }]}>{emptyPrimary}</Text>
              {emptyDetail ? (
                <Text style={[s.emptyDetail, { color: colors.subtext }]}>{emptyDetail}</Text>
              ) : null}
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={(isRefetching && !productsLoading) || presenceRefetching}
            onRefresh={onRefreshCatalog}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.35}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.screenPadding, paddingBottom: TAB_BAR_HEIGHT },
  row: { justifyContent: 'space-between' },

  chipsWrap: { marginBottom: 14 },
  chipsScroll: { gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipText: { fontWeight: '600' },

  empty: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 20 },
  emptyText: { marginTop: 12, fontSize: 15, textAlign: 'center' },
  emptyDetail: { marginTop: 10, fontSize: 13, lineHeight: 19, textAlign: 'center' },
});
