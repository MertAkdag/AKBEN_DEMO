import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Spacing } from '../../src/Constants/Spacing';
import { ScreenHeader } from '../../src/Shared/Header';
import { ProductCard } from '../../src/Components/Cards/ProductCard';
import { useTheme } from '../../src/Context/ThemeContext';
import { useFavoritesStore } from '../../src/store/favorites/favoritesStore';
import { Product } from '../../src/Types/catalog';
import { lightImpact } from '../../src/Utils/haptics';

const TAB_BAR_HEIGHT = 100;

export default function FavoritesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { products: favoriteProducts } = useFavoritesStore();

  const onProductPress = useCallback((product: Product) => {
    lightImpact();
    router.push(`/catalog/${product.id}`);
  }, [router]);

  const renderProduct = useCallback(
    ({ item, index }: { item: Product; index: number }) => (
      <ProductCard product={item} onPress={() => onProductPress(item)} index={index} />
    ),
    [onProductPress]
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.content}>
        <ScreenHeader title="Favoriler" subtitle={favoriteProducts.length > 0 ? `${favoriteProducts.length} ürün` : 'Beğendiğin ürünler'} />

        {favoriteProducts.length === 0 ? (
          <Animated.View entering={FadeInDown.duration(500).springify()} style={styles.emptyWrap}>
            <View
              style={[
                styles.emptyIconWrap,
                {
                  backgroundColor: colors.primary + '12',
                  borderColor: colors.primary + '25',
                },
              ]}
            >
              <Ionicons name="heart-outline" size={48} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Henüz favori ürün yok
            </Text>
            <Text style={[styles.emptySub, { color: colors.subtext }]}>
              Katalogdan beğendiğin ürünleri favorilere ekleyebilirsin.
            </Text>
            <TouchableOpacity
              onPress={() => {
                lightImpact();
                router.push('/(tabs)/catalog');
              }}
              style={[styles.ctaBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaText}>Kataloğa Git</Text>
              <Ionicons name="diamond-outline" size={18} color="#FFF" />
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <FlatList
            data={favoriteProducts}
            keyExtractor={(item) => item.id}
            renderItem={renderProduct}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="heart-outline" size={40} color={colors.subtext} />
                <Text style={[styles.emptyText, { color: colors.subtext }]}>Henüz favori ürün yok</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: TAB_BAR_HEIGHT,
  },
  listContent: { paddingBottom: 12 },
  row: { justifyContent: 'space-between' },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
  },
  emptyIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
});
