import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../src/Constants/Colors';
import { Spacing } from '../../src/Constants/Spacing';
import { useProductDetail } from '../../src/Hooks/useCatalog';
import { useResponsive } from '../../src/Hooks/UseResponsive';
import { Skeleton } from '../../src/Components/Ui/Skeleton';
import { ErrorState } from '../../src/Components/Ui/ErrorState';
import { Button } from '../../src/Components/Ui/Button';

const CATALOG_GOLD = Colors.catalogGold;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { calculateFontSize } = useResponsive();

  const { data: product, isLoading, isError, refetch, isRefetching } = useProductDetail(id ?? null);
  const [imageError, setImageError] = useState(false);

  const handleBack = useCallback(() => router.back(), [router]);
  const showImage = product?.imageUrl && !imageError;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={28} color={Colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontSize: calculateFontSize(18) }]}>Ürün</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.skeletonImage} />
        <View style={styles.skeletonContent}>
          <Skeleton width="70%" height={24} style={{ marginBottom: 12 }} />
          <Skeleton width="40%" height={18} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={60} />
        </View>
      </View>
    );
  }

  if (isError || !product) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={28} color={Colors.text} />
          </TouchableOpacity>
        </View>
        <ErrorState message="Ürün bulunamadı" onRetry={() => refetch()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn} accessibilityLabel="Geri">
          <Ionicons name="chevron-back" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: calculateFontSize(18) }]} numberOfLines={1}>
          {product.name}
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor={CATALOG_GOLD}
            colors={[CATALOG_GOLD]}
          />
        }
      >
        {/* Ürün görsel alanı - AKBEN görselleri */}
        <View style={styles.imageSection}>
          <View style={styles.imagePlaceholder}>
            {showImage ? (
              <Image
                source={{ uri: product.imageUrl }}
                style={styles.productImage}
                contentFit="contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <Ionicons name="diamond-outline" size={64} color={CATALOG_GOLD + '99'} />
            )}
          </View>
          {product.featured ? (
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={14} color={Colors.background} />
              <Text style={styles.featuredText}>Öne çıkan</Text>
            </View>
          ) : null}
        </View>

        {/* Bilgi kartı */}
        <View style={styles.card}>
          {product.category ? (
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { fontSize: calculateFontSize(12) }]}>Kategori</Text>
              <View style={styles.variantPill}>
                <Text style={[styles.variantText, { fontSize: calculateFontSize(13) }]}>
                  {product.category.name}
                </Text>
              </View>
            </View>
          ) : null}

          {product.variant ? (
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { fontSize: calculateFontSize(12) }]}>Ayar / Malzeme</Text>
              <View style={[styles.variantPill, styles.variantPillGold]}>
                <Text style={[styles.variantTextGold, { fontSize: calculateFontSize(13) }]}>
                  {product.variant.name}
                </Text>
              </View>
            </View>
          ) : null}

          {product.brand ? (
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { fontSize: calculateFontSize(12) }]}>Marka</Text>
              <Text style={[styles.metaValue, { fontSize: calculateFontSize(15) }]}>
                {product.brand.name}
              </Text>
            </View>
          ) : null}

          {product.description ? (
            <View style={styles.descSection}>
              <Text style={[styles.descLabel, { fontSize: calculateFontSize(12) }]}>Açıklama</Text>
              <Text style={[styles.desc, { fontSize: calculateFontSize(15) }]}>
                {product.description}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.ctaWrap}>
          <Button title="Sipariş / Teklif" variant="primary" onPress={() => {}} style={styles.cta} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 56,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: Colors.text,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageSection: {
    marginTop: 24,
    marginHorizontal: Spacing.screenPadding,
    position: 'relative',
  },
  imagePlaceholder: {
    aspectRatio: 1,
    backgroundColor: Colors.card,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  featuredBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CATALOG_GOLD,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  featuredText: {
    color: Colors.background,
    fontWeight: '700',
    fontSize: 12,
  },
  card: {
    marginHorizontal: Spacing.screenPadding,
    marginTop: 24,
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metaRow: {
    marginBottom: 14,
  },
  metaLabel: {
    color: Colors.subtext,
    marginBottom: 6,
  },
  metaValue: {
    color: Colors.text,
    fontWeight: '600',
  },
  variantPill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  variantPillGold: {
    backgroundColor: CATALOG_GOLD + '22',
  },
  variantText: {
    color: Colors.text,
    fontWeight: '600',
  },
  variantTextGold: {
    color: CATALOG_GOLD,
    fontWeight: '700',
  },
  descSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  descLabel: {
    color: Colors.subtext,
    marginBottom: 8,
  },
  desc: {
    color: Colors.text,
    lineHeight: 22,
  },
  ctaWrap: {
    marginTop: 28,
    marginHorizontal: Spacing.screenPadding,
  },
  cta: {
    backgroundColor: CATALOG_GOLD,
  },
  skeletonImage: {
    marginHorizontal: Spacing.screenPadding,
    marginTop: 24,
    aspectRatio: 1,
    borderRadius: 24,
    backgroundColor: Colors.card,
  },
  skeletonContent: {
    marginHorizontal: Spacing.screenPadding,
    marginTop: 24,
    padding: 20,
  },
});
