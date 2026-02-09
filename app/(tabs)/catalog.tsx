import React, { useState, useCallback } from 'react';
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
import { useCatalogProducts, useCategories } from '../../src/Hooks/useCatalog';
import { Product } from '../../src/Types/catalog';
import { useResponsive } from '../../src/Hooks/UseResponsive';
import { useTheme } from '../../src/Context/ThemeContext';

const TAB_BAR_HEIGHT = 100;

export default function CatalogScreen() {
  const router = useRouter();
  const { calculateFontSize } = useResponsive();
  const { colors } = useTheme();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: categories } = useCategories();
  const { data: productsData, isLoading: productsLoading, refetch, isRefetching } = useCatalogProducts(selectedCategoryId, searchQuery);
  const products = productsData?.data ?? [];

  const onProductPress = useCallback((product: Product) => { router.push(`/catalog/${product.id}`); }, [router]);
  const renderProduct = useCallback(
    ({ item, index }: { item: Product; index: number }) => <ProductCard product={item} onPress={() => onProductPress(item)} index={index} />,
    [onProductPress]
  );

  const ListHeader = (
    <>
      <ScreenHeader title="Katalog" subtitle="Seçkin koleksiyon" />

      {/* Kategoriler */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.chipsScroll}
        style={s.chipsWrap}
      >
        <TouchableOpacity
          style={[s.chip, { backgroundColor: colors.card, borderColor: colors.border },
            !selectedCategoryId && { backgroundColor: colors.primary + '22', borderColor: colors.primary }]}
          onPress={() => setSelectedCategoryId(undefined)}
        >
          <Text style={[s.chipText, { fontSize: calculateFontSize(13), color: colors.subtext },
            !selectedCategoryId && { color: colors.primary }]}>
            Tümü
          </Text>
        </TouchableOpacity>
        {categories?.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[s.chip, { backgroundColor: colors.card, borderColor: colors.border },
              selectedCategoryId === cat.id && { backgroundColor: colors.primary + '22', borderColor: colors.primary }]}
            onPress={() => setSelectedCategoryId(cat.id)}
          >
            <Text style={[s.chipText, { fontSize: calculateFontSize(13), color: colors.subtext },
              selectedCategoryId === cat.id && { color: colors.primary }]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Arama */}
      <SearchInput value={searchQuery} onChangeText={setSearchQuery} placeholder="Ürün ara..." />
    </>
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
              <Text style={[s.emptyText, { color: colors.subtext }]}>
                {searchQuery || selectedCategoryId ? 'Bu kriterlere uygun ürün yok' : 'Henüz ürün eklenmemiş'}
              </Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !productsLoading}
            onRefresh={() => refetch()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
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

  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { marginTop: 12, fontSize: 15 },
});
