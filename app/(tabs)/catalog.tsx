import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

import { Colors } from '../../src/Constants/Colors';
import { Spacing } from '../../src/Constants/Spacing';
import { SearchInput } from '../../src/Components/Ui/SearchInput';
import { ProductCard } from '../../src/Components/Cards/ProductCard';
import { useCatalogProducts, useCategories } from '../../src/Hooks/useCatalog';
import { Product } from '../../src/Types/catalog';
import { useResponsive } from '../../src/Hooks/UseResponsive';

const CATALOG_GOLD = Colors.catalogGold;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CatalogScreen() {
  const router = useRouter();
  const { calculateFontSize } = useResponsive();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: productsData, isLoading: productsLoading, refetch, isRefetching } = useCatalogProducts(
    selectedCategoryId,
    searchQuery
  );
  const products = productsData?.data ?? [];

  const onProductPress = useCallback(
    (product: Product) => {
      router.push(`/catalog/${product.id}`);
    },
    [router]
  );

  const renderProduct = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard product={item} onPress={() => onProductPress(item)} />
    ),
    [onProductPress]
  );

  const ListHeader = (
    <>
      {/* Hero */}
      <View style={styles.hero}>
        <Svg style={StyleSheet.absoluteFill} width={SCREEN_WIDTH} height={160}>
          <Defs>
            <LinearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={Colors.background} />
              <Stop offset="0.7" stopColor={Colors.card} />
              <Stop offset="1" stopColor={CATALOG_GOLD + '18'} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width={SCREEN_WIDTH} height={160} fill="url(#heroGrad)" />
        </Svg>
        <View style={styles.heroContent}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="diamond" size={28} color={CATALOG_GOLD} />
          </View>
          <Text style={[styles.heroTitle, { fontSize: calculateFontSize(28) }]}>Katalog</Text>
          <Text style={[styles.heroSubtitle, { fontSize: calculateFontSize(14) }]}>
            Seçkin koleksiyon
          </Text>
          <View style={styles.heroLine} />
        </View>
      </View>

      {/* Kategoriler */}
      <View style={styles.categoriesWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          <TouchableOpacity
            style={[styles.chip, !selectedCategoryId && styles.chipActive]}
            onPress={() => setSelectedCategoryId(undefined)}
          >
            <Text
              style={[
                styles.chipText,
                { fontSize: calculateFontSize(13) },
                !selectedCategoryId && styles.chipTextActive,
              ]}
            >
              Tümü
            </Text>
          </TouchableOpacity>
          {categories?.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, selectedCategoryId === cat.id && styles.chipActive]}
              onPress={() => setSelectedCategoryId(cat.id)}
            >
              <Text
                style={[
                  styles.chipText,
                  { fontSize: calculateFontSize(13) },
                  selectedCategoryId === cat.id && styles.chipTextActive,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Arama */}
      <View style={styles.searchWrap}>
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Ürün ara..."
        />
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          !productsLoading ? (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={48} color={Colors.subtext} />
              <Text style={[styles.emptyText, { fontSize: calculateFontSize(15) }]}>
                {searchQuery || selectedCategoryId
                  ? 'Bu kriterlere uygun ürün yok'
                  : 'Henüz ürün eklenmemiş'}
              </Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !productsLoading}
            onRefresh={() => refetch()}
            tintColor={CATALOG_GOLD}
            colors={[CATALOG_GOLD]}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  hero: {
    height: 160,
    marginBottom: Spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.lg,
    justifyContent: 'center',
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: CATALOG_GOLD + '25',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  heroTitle: {
    color: Colors.text,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    color: Colors.catalogGoldLight,
    marginTop: 4,
    fontWeight: '500',
  },
  heroLine: {
    width: 48,
    height: 3,
    borderRadius: 2,
    backgroundColor: CATALOG_GOLD,
    marginTop: 14,
  },
  categoriesWrap: {
    marginBottom: Spacing.md,
  },
  categoriesScroll: {
    paddingHorizontal: Spacing.screenPadding,
    gap: 10,
    paddingRight: 24,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 10,
  },
  chipActive: {
    backgroundColor: CATALOG_GOLD + '22',
    borderColor: CATALOG_GOLD,
  },
  chipText: {
    color: Colors.subtext,
    fontWeight: '600',
  },
  chipTextActive: {
    color: CATALOG_GOLD,
  },
  searchWrap: {
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.lg,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
  },
  listContent: {
    paddingBottom: 100,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: Colors.subtext,
    marginTop: 12,
  },
});
