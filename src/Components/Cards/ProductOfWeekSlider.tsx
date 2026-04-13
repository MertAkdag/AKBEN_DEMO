import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../Types/catalog';
import { useTheme } from '../../Context/ThemeContext';
import { lightImpact } from '../../Utils/haptics';

const { width: SW } = Dimensions.get('window');
const CARD_WIDTH = SW - 40;
const CARD_GAP = 12;
const IMG_SIZE = 140;
const MAX_WEEK_PRODUCTS = 5;

interface ProductOfWeekSliderProps {
  products: Product[];
  isLoading?: boolean;
}

/* ─── Tek ürün kartı ─── */
function ProductCard({ product, index, colors, isDark, onPress }: {
  product: Product;
  index: number;
  colors: any;
  isDark: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const GOLD = colors.catalogGold;
  const cat = product.category?.name ?? '';
  const variant = product.variant?.name ?? '';
  const desc = product.description ?? '';

  return (
    <Animated.View entering={FadeInDown.duration(450).delay(index * 80).springify()}>
      <Pressable
        style={[
          s.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: isDark ? 0.22 : 0.08,
                shadowRadius: 14,
              },
              android: { elevation: 6 },
            }),
          },
        ]}
        onPressIn={() => { scale.value = withSpring(0.98, { damping: 18, stiffness: 400 }); lightImpact(); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 18, stiffness: 400 }); }}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${product.name} - İncele`}
      >
        <Animated.View style={[s.cardScaleInner, scaleStyle]}>
      {/* Sol: görsel */}
      <View style={[s.imgBox, { backgroundColor: isDark ? '#252525' : '#F0EDEA' }]}>
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={s.img}
            contentFit="cover"
          />
        ) : (
          <View style={s.placeholder}>
            <Ionicons name="diamond-outline" size={40} color={GOLD + '40'} />
          </View>
        )}
      </View>

      {/* Sağ: bilgiler */}
      <View style={s.info}>
        {/* Haftanın ürünü badge */}
        <View style={[s.badge, { backgroundColor: GOLD + '14' }]}>
          <Ionicons name="sparkles" size={11} color={GOLD} />
          <Text style={[s.badgeText, { color: GOLD }]}>Haftanın Ürünü</Text>
        </View>

        {/* Kategori + Varyant */}
        {(cat || variant) ? (
          <Text style={[s.catVariant, { color: colors.subtext }]} numberOfLines={1}>
            {[cat, variant].filter(Boolean).join(' · ')}
          </Text>
        ) : null}

        {/* Ürün adı */}
        <Text style={[s.name, { color: colors.text }]} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Kısa açıklama */}
        {desc ? (
          <Text style={[s.desc, { color: colors.subtext }]} numberOfLines={2}>
            {desc}
          </Text>
        ) : null}

        {/* Alt kısım: sadece ok */}
        <View style={s.bottom}>
          <View style={[s.arrow, { backgroundColor: GOLD + '14' }]}>
            <Ionicons name="arrow-forward" size={16} color={GOLD} />
          </View>
        </View>
      </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

/* ─── Slider ana bileşen ─── */
export function ProductOfWeekSlider({ products, isLoading }: ProductOfWeekSliderProps) {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const [page, setPage] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const limitedProducts = useMemo(
    () => (products?.length ? products.slice(0, MAX_WEEK_PRODUCTS) : []),
    [products],
  );

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.x;
    const newPage = Math.round(offset / (CARD_WIDTH + CARD_GAP));
    if (newPage !== page) {
      setPage(newPage);
      lightImpact();
    }
  }, [page]);

  const startAutoScroll = useCallback(() => {
    if (limitedProducts.length <= 1) return;
    autoScrollRef.current = setInterval(() => {
      setPage((prev) => {
        const next = (prev + 1) % limitedProducts.length;
        flatRef.current?.scrollToOffset({
          offset: next * (CARD_WIDTH + CARD_GAP),
          animated: true,
        });
        return next;
      });
    }, 4500);
  }, [limitedProducts.length]);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoScroll();
    return stopAutoScroll;
  }, [startAutoScroll, stopAutoScroll]);

  const handlePress = useCallback((id: string) => {
    lightImpact();
    router.push(`/catalog/${id}`);
  }, [router]);

  if (isLoading || !limitedProducts.length) return null;

  return (
    <Animated.View entering={FadeInDown.duration(500).delay(120).springify()} style={s.wrapper}>
      {/* Başlık */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={[s.headerIcon, { backgroundColor: colors.catalogGold + '18' }]}>
            <Ionicons name="trophy" size={18} color={colors.catalogGold} />
          </View>
          <Text style={[s.headerTitle, { color: colors.text }]}>Haftanın Ürünü</Text>
        </View>
        <Text style={[s.headerSub, { color: colors.subtext }]}>
          Özel kampanya
        </Text>
      </View>

      {/* Slider */}
      <FlatList
        ref={flatRef}
        data={limitedProducts}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_GAP}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={s.listContent}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={stopAutoScroll}
        onScrollEndDrag={() => startAutoScroll()}
        renderItem={({ item, index }) => (
          <ProductCard
            product={item}
            index={index}
            colors={colors}
            isDark={isDark}
            onPress={() => handlePress(item.id)}
          />
        )}
      />

      {/* Sayfa göstergeleri */}
      <View style={s.dotsRow}>
        {limitedProducts.map((_, i) => (
          <View
            key={i}
            style={[
              s.dot,
              {
                backgroundColor: i === page ? colors.catalogGold : colors.subtext + '30',
                width: i === page ? 20 : 6,
              },
            ]}
          />
        ))}
      </View>
    </Animated.View>
  );
}

/* ═══ Styles ═══ */
const s = StyleSheet.create({
  wrapper: { marginBottom: 24 },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIcon: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  headerSub: { fontSize: 12, fontWeight: '500' },

  /* List */
  listContent: { gap: CARD_GAP, paddingRight: 20 },

  /* Card – yatay düzen */
  card: {
    width: CARD_WIDTH,
    height: IMG_SIZE,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
  },
  cardScaleInner: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    height: '100%',
  },

  /* Sol: görsel kutusu */
  imgBox: {
    width: IMG_SIZE,
    height: '100%',
    overflow: 'hidden',
  },
  img: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Sağ: bilgi alanı */
  info: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
    gap: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 2,
  },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  catVariant: { fontSize: 11, fontWeight: '600', letterSpacing: 0.2 },
  name: { fontSize: 16, fontWeight: '800', lineHeight: 21, letterSpacing: -0.2 },
  desc: { fontSize: 12, fontWeight: '400', lineHeight: 16, opacity: 0.75 },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  price: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  arrow: {
    width: 30, height: 30, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },

  /* Dots */
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  dot: { height: 6, borderRadius: 3 },
});
