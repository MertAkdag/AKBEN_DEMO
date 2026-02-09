import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { Spacing } from '../../src/Constants/Spacing';
import { useProductDetail } from '../../src/Hooks/useCatalog';
import { useResponsive } from '../../src/Hooks/UseResponsive';
import { useTheme } from '../../src/Context/ThemeContext';
import { Skeleton } from '../../src/Components/Ui/Skeleton';
import { ErrorState } from '../../src/Components/Ui/ErrorState';
import { lightImpact } from '../../src/Utils/haptics';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { calculateFontSize } = useResponsive();
  const { colors, isDark } = useTheme();

  const { data: product, isLoading, isError, refetch, isRefetching } = useProductDetail(id ?? null);
  const [imageError, setImageError] = useState(false);

  const handleBack = useCallback(() => { lightImpact(); router.back(); }, [router]);
  const showImage = product?.imageUrl && !imageError;
  const GOLD = colors.catalogGold;

  const Nav = () => (
    <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background }}>
      <View style={[s.nav, { borderBottomColor: colors.divider }]}>
        <Pressable onPress={handleBack} style={s.navBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[s.navTitle, { fontSize: calculateFontSize(17), color: colors.text }]} numberOfLines={1}>
          {product?.name ?? 'Ürün'}
        </Text>
        <View style={s.navBtn} />
      </View>
    </SafeAreaView>
  );

  if (isLoading) {
    return (
      <View style={[s.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Nav />
        <View style={{ padding: 20 }}>
          <Skeleton width="100%" height={280} style={{ borderRadius: 24, marginBottom: 20 }} />
          <Skeleton width="60%" height={22} style={{ marginBottom: 12 }} />
          <Skeleton width="40%" height={16} style={{ marginBottom: 20 }} />
          <Skeleton width="100%" height={100} style={{ borderRadius: 20 }} />
        </View>
      </View>
    );
  }

  if (isError || !product) {
    return (
      <View style={[s.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Nav />
        <ErrorState message="Ürün bulunamadı" onRetry={() => refetch()} />
      </View>
    );
  }

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <Nav />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={GOLD} colors={[GOLD]} />
        }
      >
        {/* Image */}
        <View style={s.imgWrap}>
          <View style={[s.imgBox, {
            backgroundColor: colors.card, borderColor: colors.cardBorder,
            ...Platform.select({
              ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDark ? 0.2 : 0.08, shadowRadius: 14 },
              android: { elevation: 6 },
            }),
          }]}>
            {showImage ? (
              <Image
                source={{ uri: product.imageUrl }}
                style={s.img}
                contentFit="contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <View style={s.placeholder}>
                <View style={[s.placeholderCircle, { backgroundColor: GOLD + '0A' }]}>
                  <Ionicons name="diamond-outline" size={48} color={GOLD + '60'} />
                </View>
              </View>
            )}
          </View>
          {product.featured && (
            <View style={[s.featBadge, {
              backgroundColor: GOLD,
              ...Platform.select({
                ios: { shadowColor: GOLD, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 8 },
                android: { elevation: 4 },
              }),
            }]}>
              <Ionicons name="star" size={12} color={colors.background} />
              <Text style={[s.featText, { color: colors.background }]}>Öne çıkan</Text>
            </View>
          )}
        </View>

        {/* Info card */}
        <View style={[s.card, {
          backgroundColor: colors.card, borderColor: colors.cardBorder,
          ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: isDark ? 0.15 : 0.06, shadowRadius: 10 },
            android: { elevation: 4 },
          }),
        }]}>
          {product.category && (
            <InfoItem label="Kategori" colors={colors}>
              <View style={[s.pill, { backgroundColor: colors.divider }]}>
                <Text style={[s.pillText, { color: colors.text }]}>{product.category.name}</Text>
              </View>
            </InfoItem>
          )}

          {product.variant && (
            <InfoItem label="Ayar / Malzeme" colors={colors}>
              <View style={[s.pill, s.pillGold, { backgroundColor: GOLD + '14', borderColor: GOLD + '20' }]}>
                <Text style={[s.pillGoldText, { color: GOLD }]}>{product.variant.name}</Text>
              </View>
            </InfoItem>
          )}

          {product.brand && (
            <InfoItem label="Marka" colors={colors}>
              <Text style={[s.infoVal, { color: colors.text }]}>{product.brand.name}</Text>
            </InfoItem>
          )}

          {product.description && (
            <View style={[s.descWrap, { borderTopColor: colors.divider }]}>
              <Text style={[s.descLabel, { color: colors.subtext }]}>Açıklama</Text>
              <Text style={[s.descText, { color: colors.text }]}>{product.description}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function InfoItem({ label, children, colors }: { label: string; children: React.ReactNode; colors: any }) {
  return (
    <View style={s.infoItem}>
      <Text style={[s.infoLabel, { color: colors.subtext }]}>{label}</Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },

  nav: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: 1,
  },
  navBtn: {
    width: 44, height: 44,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 14,
  },
  navTitle: {
    flex: 1, textAlign: 'center',
    fontWeight: '600', fontSize: 17,
  },

  scroll: { padding: 20, paddingBottom: 60 },

  imgWrap: { position: 'relative', marginBottom: 20 },
  imgBox: {
    aspectRatio: 1,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
  },
  img: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderCircle: {
    width: 80, height: 80, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  featBadge: {
    position: 'absolute', top: 14, right: 14,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12,
  },
  featText: { fontWeight: '700', fontSize: 11 },

  card: {
    borderRadius: 22, padding: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  infoItem: { marginBottom: 16 },
  infoLabel: { fontSize: 12, fontWeight: '500', marginBottom: 6 },
  infoVal: { fontSize: 15, fontWeight: '600' },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
  },
  pillText: { fontSize: 13, fontWeight: '600' },
  pillGold: { borderWidth: 1 },
  pillGoldText: { fontSize: 13, fontWeight: '700' },

  descWrap: {
    marginTop: 4, paddingTop: 16,
    borderTopWidth: 1,
  },
  descLabel: { fontSize: 12, fontWeight: '500', marginBottom: 8 },
  descText: { fontSize: 15, lineHeight: 23 },
});
