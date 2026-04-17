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
import Animated, { FadeIn } from 'react-native-reanimated';

import { Spacing } from '../../src/Constants/Spacing';
import { ScreenHeader } from '../../src/Shared/Header';
import { SearchInput } from '../../src/Components/Ui/SearchInput';
import { ProductCard } from '../../src/Components/Cards/ProductCard';
import { CatalogSkeletonGrid, CategoryChipSkeleton } from '../../src/Components/Ui/Skeleton';
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
const SKELETON_COUNT = 6;

export default function CatalogScreen() {
  const router = useRouter();
  const { calculateFontSize } = useResponsive();
  const { colors } = useTheme();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: categories, isLoading: categoriesLoading } = useCategories();
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
    isRefetching: presenceRefetching,
  } = useCatalogKategoriPresence();
  const products = useMemo(
    () => productsPages?.pages.flatMap((p) => p.data) ?? [],
    [productsPages]
  );
  const presenceIds = presence?.ids;

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategoryId != null) count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [selectedCategoryId, searchQuery]);

  const onProductPress = useCallback((product: Product) => { router.push(`/catalog/${product.id}`); }, [router]);
  const renderProduct = useCallback(
    ({ item, index }: { item: Product; index: number }) => <ProductCard product={item} onPress={() => onProductPress(item)} index={index} />,
    [onProductPress]
  );

  const emptyPrimary = useMemo(() => {
    if (searchQuery.trim()) return 'Bu aramaya uygun ürün bulunamadı';
    if (selectedCategoryId == null) return 'Henüz ürün eklenmemiş';
    return 'Bu kategoride ürün bulunamadı';
  }, [searchQuery, selectedCategoryId]);

  const emptyDetail = useMemo(() => {
    if (searchQuery.trim() || selectedCategoryId == null || productsLoading) return null;
    if (!chipHasProductsInPresence(selectedCategoryId, presenceIds ?? [], categories)) {
      return 'Bu kategori için henüz ürün tanımlanmamış. Farklı bir kategori deneyebilirsiniz.';
    }
    return 'Filtreyi veya arama metnini değiştirerek tekrar deneyebilirsiniz.';
  }, [searchQuery, selectedCategoryId, productsLoading, presenceIds, categories]);

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
          {categoriesLoading ? (
            <>
              {Array.from({ length: 5 }).map((_, i) => (
                <CategoryChipSkeleton key={i} />
              ))}
            </>
          ) : (
            <>
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
            </>
          )}
        </ScrollView>

        <SearchInput value={searchQuery} onChangeText={setSearchQuery} placeholder="Ürün ara..." activeFilterCount={activeFilterCount} />
      </>
    ),
    [colors, categories, categoriesLoading, selectedCategoryId, searchQuery, calculateFontSize, presenceIds, activeFilterCount]
  );

  const ListFooter = useMemo(() => {
    if (!isFetchingNextPage) return null;
    return <CatalogSkeletonGrid count={4} />;
  }, [isFetchingNextPage]);

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['top']}>
      <FlatList
        data={productsLoading ? [] : products}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={s.row}
        contentContainerStyle={s.listContent}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        showsVerticalScrollIndicator={false}
        windowSize={7}
        maxToRenderPerBatch={12}
        initialNumToRender={10}
        removeClippedSubviews
        ListEmptyComponent={
          productsLoading ? (
            <CatalogSkeletonGrid count={SKELETON_COUNT} />
          ) : (
            <Animated.View entering={FadeIn.duration(300)} style={s.empty}>
              <View style={[s.emptyIconWrap, { backgroundColor: colors.primary + '10' }]}>
                <Ionicons name={searchQuery.trim() ? 'search-outline' : 'cube-outline'} size={36} color={colors.primary} />
              </View>
              <Text style={[s.emptyText, { color: colors.text }]}>{emptyPrimary}</Text>
              {emptyDetail ? (
                <Text style={[s.emptyDetail, { color: colors.subtext }]}>{emptyDetail}</Text>
              ) : null}
            </Animated.View>
          )
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
        onEndReachedThreshold={2.5}
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

  empty: { alignItems: 'center', paddingVertical: 56, paddingHorizontal: 24 },
  emptyIconWrap: {
    width: 72, height: 72, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 6 },
  emptyDetail: { fontSize: 13, lineHeight: 19, textAlign: 'center', opacity: 0.7 },

});
