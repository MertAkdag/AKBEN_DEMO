import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
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
  useSubCategories,
  useBrands,
} from '../../src/Hooks/useCatalog';
import { Product } from '../../src/Types/catalog';
import { useResponsive } from '../../src/Hooks/UseResponsive';
import { useTheme } from '../../src/Context/ThemeContext';
import { logger } from '../../src/Utils/logger';
import { lightImpact } from '../../src/Utils/haptics';
import {
  SortFilterSheet,
  type SortKey,
  type CatalogFilters,
  type SortFilterSheetSection,
  EMPTY_FILTERS,
} from '../../src/Components/Modals/SortFilterSheet';
import { SubCategorySheet } from '../../src/Components/Modals/SubCategorySheet';

const TAB_BAR_HEIGHT = 100;
const SKELETON_COUNT = 6;

export default function CatalogScreen() {
  const router = useRouter();
  const { calculateFontSize } = useResponsive();
  const { colors } = useTheme();

  /* ─── Kategori state'i: iki katman ─── */
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState<number | undefined>(undefined);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  /* ─── Sırala & Filtrele state'i ─── */
  const [sortKey, setSortKey] = useState<SortKey>('default');
  const [filters, setFilters] = useState<CatalogFilters>(EMPTY_FILTERS);

  /* ─── Modal görünürlükleri ─── */
  const [sortFilterOpen, setSortFilterOpen] = useState(false);
  const [sortFilterInitialSection, setSortFilterInitialSection] =
    useState<SortFilterSheetSection>('sort');
  const [subCategoryOpen, setSubCategoryOpen] = useState(false);

  /* ─── API'ye giden kategori: alt varsa alt, yoksa ana ─── */
  const selectedCategoryId = selectedSubCategoryId ?? selectedMainCategoryId;

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: subCategoriesRaw, isLoading: subCategoriesLoading } = useSubCategories(selectedMainCategoryId);
  const { data: brands, isLoading: brandsLoading } = useBrands();

  /* ─── Ana kategoriler (ustKategoriId === null) ─── */
  const mainCategories = useMemo(() => {
    if (!categories) return [];
    const filtered = categories.filter((c) => c.ustKategoriId == null);
    // API null parent filtrelemesi yapmıyorsa boş dönmesin — fallback
    return filtered.length > 0 ? filtered : categories;
  }, [categories]);

  /* ─── Alt kategoriler — sadece seçili ana kategoriye aitse ve sonuç varsa göster ─── */
  const subCategories = useMemo(() => subCategoriesRaw ?? [], [subCategoriesRaw]);
  const showSubCategoryRow = selectedMainCategoryId != null && subCategories.length > 0;

  const selectedMainCategory = useMemo(
    () => mainCategories.find((c) => c.id === selectedMainCategoryId),
    [mainCategories, selectedMainCategoryId],
  );

  const {
    data: productsPages,
    isLoading: productsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useCatalogProducts(selectedCategoryId, searchQuery);

  /* ─── Ürünleri düzleştir + sort/filter uygula ─── */
  const products = useMemo(() => {
    const all = productsPages?.pages.flatMap((p) => p.data) ?? [];

    const filtered = all.filter((p) => {
      if (filters.brandIds.length > 0 && !filters.brandIds.includes(p.markaId)) return false;
      if (filters.onlyNew && !p.yeni) return false;
      if (filters.onlyDiscounted && !p.indirimli) return false;
      if (filters.onlyInStock && !((p.bakiyeCount ?? 0) > 0)) return false;
      return true;
    });

    if (sortKey === 'default') return filtered;

    const sorted = [...filtered];
    switch (sortKey) {
      case 'priceAsc':
        sorted.sort((a, b) => (a.satisFiyati ?? 0) - (b.satisFiyati ?? 0));
        break;
      case 'priceDesc':
        sorted.sort((a, b) => (b.satisFiyati ?? 0) - (a.satisFiyati ?? 0));
        break;
      case 'nameAsc':
        sorted.sort((a, b) =>
          (a.name || a.urunAdi || '').localeCompare(b.name || b.urunAdi || '', 'tr'),
        );
        break;
      case 'newest':
        sorted.sort((a, b) => {
          const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bt - at;
        });
        break;
    }
    return sorted;
  }, [productsPages, filters, sortKey]);

  /* ─── Aktif filtre sayısı (rozet için) ─── */
  const activeFilterBadge = useMemo(() => {
    let count = 0;
    if (sortKey !== 'default') count++;
    count += filters.brandIds.length;
    if (filters.onlyNew) count++;
    if (filters.onlyDiscounted) count++;
    if (filters.onlyInStock) count++;
    return count;
  }, [sortKey, filters]);

  const activeSearchBadge = useMemo(() => {
    let count = 0;
    if (selectedMainCategoryId != null) count++;
    if (selectedSubCategoryId != null) count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [selectedMainCategoryId, selectedSubCategoryId, searchQuery]);

  /* ─── Etkileşimler ─── */
  const onProductPress = useCallback(
    (product: Product) => router.push(`/catalog/${product.id}`),
    [router],
  );

  const firstPageSize = productsPages?.pages[0]?.data.length ?? 0;
  const renderProduct = useCallback(
    ({ item, index }: { item: Product; index: number }) => (
      <ProductCard
        product={item}
        onPress={() => onProductPress(item)}
        index={index}
        animateEntrance={index < firstPageSize}
      />
    ),
    [onProductPress, firstPageSize],
  );

  const handleSelectMainCategory = useCallback((id?: number) => {
    lightImpact();
    logger.info('[Catalog UI] Ana kategori seçildi', { id });
    setSelectedMainCategoryId(id);
    setSelectedSubCategoryId(undefined);
  }, []);

  const handleSelectSubCategory = useCallback((id?: number) => {
    lightImpact();
    logger.info('[Catalog UI] Alt kategori seçildi', { id });
    setSelectedSubCategoryId(id);
  }, []);

  const openSortFilterSheet = useCallback((section: SortFilterSheetSection) => {
    lightImpact();
    setSortFilterInitialSection(section);
    setSortFilterOpen(true);
  }, []);

  const handleApplySortFilter = useCallback((newSort: SortKey, newFilters: CatalogFilters) => {
    setSortKey(newSort);
    setFilters(newFilters);
    setSortFilterOpen(false);
    logger.info('[Catalog UI] Sort & Filter uygulandı', { sort: newSort, filters: newFilters });
  }, []);

  const handleResetSortFilter = useCallback(() => {
    setSortKey('default');
    setFilters(EMPTY_FILTERS);
  }, []);

  const handleOpenSubCategorySheet = useCallback(() => {
    lightImpact();
    setSubCategoryOpen(true);
  }, []);

  const emptyPrimary = useMemo(() => {
    if (searchQuery.trim()) return 'Bu aramaya uygun ürün bulunamadı';
    if (activeFilterBadge > 0) return 'Filtrelere uygun ürün bulunamadı';
    if (selectedCategoryId == null) return 'Henüz ürün eklenmemiş';
    return 'Bu kategoride ürün bulunamadı';
  }, [searchQuery, selectedCategoryId, activeFilterBadge]);

  const emptyDetail = useMemo(() => {
    if (productsLoading) return null;
    if (searchQuery.trim() || activeFilterBadge > 0 || selectedCategoryId != null) {
      return 'Filtreyi veya arama metnini değiştirerek tekrar deneyebilirsin.';
    }
    return null;
  }, [searchQuery, selectedCategoryId, productsLoading, activeFilterBadge]);

  const onRefreshCatalog = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  /* ─── Header bileşeni ─── */
  const ListHeader = useMemo(
    () => (
      <>
        <ScreenHeader title="Katalog" subtitle={ selectedMainCategory?.name ?? 'Tümü' } />


        {/* Ana kategori chip satırı */}
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
                style={[
                  s.chip,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  selectedMainCategoryId == null && {
                    backgroundColor: colors.primary + '22',
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => handleSelectMainCategory(undefined)}
              >
                <Text
                  style={[
                    s.chipText,
                    { fontSize: calculateFontSize(13), color: colors.subtext },
                    selectedMainCategoryId == null && { color: colors.primary },
                  ]}
                >
                  Tümü
                </Text>
              </TouchableOpacity>
              {mainCategories.map((cat) => {
                const selected = selectedMainCategoryId === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      s.chip,
                      { backgroundColor: colors.card, borderColor: colors.border },
                      selected && {
                        backgroundColor: colors.primary + '22',
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={() => handleSelectMainCategory(cat.id)}
                  >
                    <Text
                      style={[
                        s.chipText,
                        { fontSize: calculateFontSize(13), color: colors.subtext },
                        selected && { color: colors.primary },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </>
          )}
        </ScrollView>

        {/* Alt kategori satırı — sadece aktif ana kategoride çocuk varsa */}
        {showSubCategoryRow ? (
          <Animated.View entering={FadeIn.duration(220)}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.chipsScroll}
              style={s.subChipsWrap}
            >
              <TouchableOpacity
                style={[
                  s.subChip,
                  { backgroundColor: colors.input, borderColor: colors.cardBorder },
                  selectedSubCategoryId == null && {
                    backgroundColor: colors.primary + '15',
                    borderColor: colors.primary + '66',
                  },
                ]}
                onPress={() => handleSelectSubCategory(undefined)}
              >
                <Text
                  style={[
                    s.subChipText,
                    { color: colors.subtext },
                    selectedSubCategoryId == null && { color: colors.primary, fontWeight: '700' },
                  ]}
                >
                  Tümü
                </Text>
              </TouchableOpacity>

              {subCategories.slice(0, 8).map((cat) => {
                const selected = selectedSubCategoryId === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      s.subChip,
                      { backgroundColor: colors.input, borderColor: colors.cardBorder },
                      selected && {
                        backgroundColor: colors.primary + '15',
                        borderColor: colors.primary + '66',
                      },
                    ]}
                    onPress={() => handleSelectSubCategory(cat.id)}
                  >
                    <Text
                      style={[
                        s.subChipText,
                        { color: colors.subtext },
                        selected && { color: colors.primary, fontWeight: '700' },
                      ]}
                      numberOfLines={1}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {/* Tümünü Gör → bottom sheet */}
              <TouchableOpacity
                style={[s.subChip, s.subChipMore, { backgroundColor: colors.card, borderColor: colors.primary + '55' }]}
                onPress={handleOpenSubCategorySheet}
              >
                <Ionicons name="grid-outline" size={13} color={colors.primary} />
                <Text style={[s.subChipText, { color: colors.primary, fontWeight: '700' }]}>
                  {subCategories.length > 8 ? `Tümünü Gör (${subCategories.length})` : 'Tümünü Gör'}
                </Text>
                <Ionicons name="chevron-forward" size={13} color={colors.primary} />
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        ) : null}

        {/* Sırala & Filtrele aksiyon satırı */}
        <View style={s.actionsRow}>
          <ActionButton
            icon="swap-vertical"
            label={sortKey === 'default' ? 'Sırala' : SORT_LABEL[sortKey]}
            active={sortKey !== 'default'}
            colors={colors}
            onPress={() => openSortFilterSheet('sort')}
          />
          <ActionButton
            icon="options-outline"
            label="Filtrele"
            active={activeFilterBadge - (sortKey !== 'default' ? 1 : 0) > 0}
            badge={activeFilterBadge - (sortKey !== 'default' ? 1 : 0)}
            colors={colors}
            onPress={() => openSortFilterSheet('filter')}
          />

          {activeFilterBadge > 0 ? (
            <TouchableOpacity
              onPress={handleResetSortFilter}
              activeOpacity={0.8}
              style={[s.resetBtn, { borderColor: colors.cardBorder }]}
            >
              <Ionicons name="close" size={14} color={colors.subtext} />
              <Text style={[s.resetText, { color: colors.subtext }]}>Temizle</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flex: 1 }} />
          )}

          <Text style={[s.countText, { color: colors.subtext }]}>
            {productsLoading ? '' : `${products.length} ürün`}
          </Text>
        </View>

        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Ürün ara..."
          activeFilterCount={activeSearchBadge}
        />
      </>
    ),
    [
      colors,
      mainCategories,
      categoriesLoading,
      selectedMainCategoryId,
      selectedSubCategoryId,
      subCategories,
      showSubCategoryRow,
      searchQuery,
      calculateFontSize,
      activeSearchBadge,
      sortKey,
      activeFilterBadge,
      products.length,
      productsLoading,
      handleSelectMainCategory,
      handleSelectSubCategory,
      openSortFilterSheet,
      handleOpenSubCategorySheet,
      handleResetSortFilter,
    ],
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
                <Ionicons
                  name={searchQuery.trim() ? 'search-outline' : 'cube-outline'}
                  size={36}
                  color={colors.primary}
                />
              </View>
              <Text style={[s.emptyText, { color: colors.text }]}>{emptyPrimary}</Text>
              {emptyDetail ? (
                <Text style={[s.emptyDetail, { color: colors.subtext }]}>{emptyDetail}</Text>
              ) : null}
              {activeFilterBadge > 0 ? (
                <TouchableOpacity
                  onPress={handleResetSortFilter}
                  activeOpacity={0.85}
                  style={[s.emptyCta, { backgroundColor: colors.primary }]}
                >
                  <Text style={s.emptyCtaText}>Filtreleri Temizle</Text>
                </TouchableOpacity>
              ) : null}
            </Animated.View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !productsLoading}
            onRefresh={onRefreshCatalog}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={2.5}
      />

      {/* Sırala & Filtrele bottom sheet */}
      <SortFilterSheet
        visible={sortFilterOpen}
        onClose={() => setSortFilterOpen(false)}
        initialSection={sortFilterInitialSection}
        brands={brands ?? []}
        brandsLoading={brandsLoading}
        sortKey={sortKey}
        filters={filters}
        onApply={handleApplySortFilter}
        onReset={handleResetSortFilter}
      />

      {/* Alt kategori bottom sheet */}
      <SubCategorySheet
        visible={subCategoryOpen}
        onClose={() => setSubCategoryOpen(false)}
        mainCategoryName={selectedMainCategory?.name}
        subCategories={subCategories}
        subCategoriesLoading={subCategoriesLoading}
        selectedSubCategoryId={selectedSubCategoryId}
        onSelect={handleSelectSubCategory}
      />
    </SafeAreaView>
  );
}

/* ─── Sıralama butonunda gösterilecek etiket ─── */
const SORT_LABEL: Record<SortKey, string> = {
  default: 'Sırala',
  priceAsc: 'Fiyat ↑',
  priceDesc: 'Fiyat ↓',
  nameAsc: 'A → Z',
  newest: 'Yeni',
};

/* ─── Aksiyon butonu ─── */
interface ActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  badge?: number;
  onPress: () => void;
  colors: any;
}
function ActionButton({ icon, label, active, badge, onPress, colors }: ActionButtonProps) {
  const GOLD = colors.catalogGold;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        s.actionBtn,
        {
          backgroundColor: active ? GOLD + '15' : colors.card,
          borderColor: active ? GOLD : colors.cardBorder,
          ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
            android: { elevation: 1 },
          }),
        },
      ]}
    >
      <Ionicons name={icon} size={15} color={active ? GOLD : colors.text} />
      <Text style={[s.actionText, { color: active ? GOLD : colors.text }]} numberOfLines={1}>
        {label}
      </Text>
      {badge && badge > 0 ? (
        <View style={[s.actionBadge, { backgroundColor: GOLD }]}>
          <Text style={s.actionBadgeText}>{badge}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.screenPadding, paddingBottom: TAB_BAR_HEIGHT },
  row: { justifyContent: 'space-between' },

  chipsWrap: { marginBottom: 10 },
  chipsScroll: { gap: 8, paddingRight: 4 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipText: { fontWeight: '600' },

  subChipsWrap: { marginBottom: 12 },
  subChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  subChipMore: {
    paddingHorizontal: 12,
  },
  subChipText: { fontSize: 12, fontWeight: '600' },

  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionText: { fontSize: 13, fontWeight: '700', letterSpacing: -0.2 },
  actionBadge: {
    minWidth: 18, height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: 2,
  },
  actionBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },

  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
  },
  resetText: { fontSize: 11, fontWeight: '700' },

  countText: {
    marginLeft: 'auto',
    fontSize: 11,
    fontWeight: '600',
  },

  empty: { alignItems: 'center', paddingVertical: 56, paddingHorizontal: 24 },
  emptyIconWrap: {
    width: 72, height: 72, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 6 },
  emptyDetail: { fontSize: 13, lineHeight: 19, textAlign: 'center', opacity: 0.7 },
  emptyCta: {
    marginTop: 16,
    paddingHorizontal: 20,
    height: 42,
    borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyCtaText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
});
