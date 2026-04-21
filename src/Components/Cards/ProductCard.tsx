import React, { memo, useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../Types/catalog';
import { useResponsive } from '../../Hooks/UseResponsive';
import { useTheme } from '../../Context/ThemeContext';
import { lightImpact, successNotification } from '../../Utils/haptics';
import { useFavoritesStore } from '../../store/favorites/favoritesStore';
import { useCartStore } from '../../store/cart/cartStore';
import { QuickAddModal } from '../Modals/QuickAddModal';
import { logger } from '../../Utils/logger';

interface Props {
  product: Product;
  onPress: () => void;
  index?: number;
  /**
   * FadeInDown giriş animasyonu yalnızca ilk ekrana düşen kartlarda çalışsın diye
   * üst bileşen bu flag'i kapatabilir. Scroll ile recycle edilen/gelen kartlarda
   * animasyon tekrar oynamasın istemiyoruz.
   */
  animateEntrance?: boolean;
}

const ENTRANCE_DELAY_STEP = 60;
const ENTRANCE_MAX_STEPS = 8;

/** Stok seviyesine göre chip içeriği üretir. */
function computeStockInfo(
  bakiye: number | undefined,
  kritik: number | undefined,
  colors: { success: string; warning: string; error: string; subtext: string },
) {
  if (bakiye == null || Number.isNaN(bakiye)) {
    return { label: 'Stok belirsiz', color: colors.subtext, icon: 'help-circle-outline' as const, available: true };
  }
  if (bakiye <= 0) {
    return { label: 'Tükendi', color: colors.error, icon: 'close-circle' as const, available: false };
  }
  if (kritik != null && bakiye <= kritik) {
    return { label: 'Az kaldı', color: colors.warning, icon: 'alert-circle' as const, available: true };
  }
  return { label: 'Stokta', color: colors.success, icon: 'checkmark-circle' as const, available: true };
}

/** Geliştirme: stok chip kararını Metro’da görmek için. */
function describeStockDecision(
  bakiye: number | undefined,
  kritik: number | undefined,
): string {
  if (bakiye == null || Number.isNaN(bakiye)) return 'bakiye yok/NaN → Stok belirsiz';
  if (bakiye <= 0) return 'bakiye <= 0 → Tükendi';
  if (kritik != null && bakiye <= kritik) {
    return `bakiye (${bakiye}) <= kritik (${kritik}) → Az kaldı`;
  }
  return `bakiye (${bakiye}) > kritik (${kritik ?? '—'}) → Stokta`;
}

/** Para formatlama — tr-TR locale ile. */
function formatPrice(value: number | undefined | null): string {
  if (value == null || Number.isNaN(value) || value <= 0) return '—';
  return `${value.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺`;
}

const ProductCardComponent = ({ product, onPress, index = 0, animateEntrance = true }: Props) => {
  const { calculateFontSize } = useResponsive();
  const { colors, isDark } = useTheme();
  const favorited = useFavoritesStore((s) => s.productIds.includes(product.id));
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const addToCart = useCartStore((s) => s.addToCart);
  const inCartQty = useCartStore((s) => s.items.find((i) => i.product.id === product.id)?.quantity ?? 0);

  const [imgErr, setImgErr] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const scale = useSharedValue(1);
  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const favScale = useSharedValue(1);
  const favStyle = useAnimatedStyle(() => ({ transform: [{ scale: favScale.value }] }));

  const addScale = useSharedValue(1);
  const addStyle = useAnimatedStyle(() => ({ transform: [{ scale: addScale.value }] }));

  const GOLD = colors.catalogGold;
  const cat = product.category?.name ?? '';
  const showImg = product.imageUrl && !imgErr;
  const stock = computeStockInfo(product.bakiyeCount, product.kritikStokSeviyesi, colors);
  const priceText = formatPrice(product.satisFiyati);
  const unavailable = !stock.available;

  useEffect(() => {
    logger.info('[ProductCard stok]', {
      id: product.id,
      ad: product.name,
      bakiyeCount: product.bakiyeCount,
      kritikStokSeviyesi: product.kritikStokSeviyesi,
      minStokSeviyesi: product.minStokSeviyesi,
      maxStokSeviyesi: product.maxStokSeviyesi,
      chip: stock.label,
      karar: describeStockDecision(product.bakiyeCount, product.kritikStokSeviyesi),
    });
  }, [
    product.id,
    product.name,
    product.bakiyeCount,
    product.kritikStokSeviyesi,
    product.minStokSeviyesi,
    product.maxStokSeviyesi,
    stock.label,
  ]);

  const handleFavoritePress = useCallback((e: any) => {
    e.stopPropagation();
    lightImpact();
    toggleFavorite(product);
    favScale.value = withSequence(
      withSpring(1.3, { damping: 8, stiffness: 300 }),
      withSpring(1, { damping: 12, stiffness: 200 }),
    );
  }, [favScale, product, toggleFavorite]);

  const handleImageError = useCallback(() => setImgErr(true), []);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
    lightImpact();
  }, [scale]);
  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, [scale]);

  const handleQuickAddPress = useCallback((e: any) => {
    e.stopPropagation();
    if (unavailable) return;
    lightImpact();
    addScale.value = withSequence(
      withSpring(0.85, { damping: 12, stiffness: 400 }),
      withSpring(1, { damping: 12, stiffness: 250 }),
    );
    setQuickAddOpen(true);
  }, [unavailable, addScale]);

  const handleQuickAddConfirm = useCallback(
    (qty: number) => {
      addToCart(product, qty);
      successNotification();
      setQuickAddOpen(false);
    },
    [addToCart, product],
  );

  const handleQuickAddClose = useCallback(() => setQuickAddOpen(false), []);

  const entering = animateEntrance && index < ENTRANCE_MAX_STEPS
    ? FadeInDown.duration(400).delay(index * ENTRANCE_DELAY_STEP).springify()
    : undefined;

  return (
    <>
      <Animated.View entering={entering} style={s.cardOuter}>
        <Pressable
          style={[s.card, {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
            ...Platform.select({
              ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDark ? 0.18 : 0.08, shadowRadius: 12 },
              android: { elevation: 5 },
            }),
          }]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`${product.name}, ${priceText}, ${stock.label}`}
        >
          <Animated.View style={[s.cardScaleInner, scaleStyle]}>
            <View style={[s.imgWrap, { backgroundColor: isDark ? colors.card : '#F7F5F0' }]}>
              {showImg ? (
                <Image
                  source={{ uri: product.imageUrl }}
                  style={s.img}
                  contentFit="cover"
                  onError={handleImageError}
                />
              ) : (
                <View style={s.placeholder}>
                  <View style={[s.placeholderIcon, { backgroundColor: GOLD + '08' }]}>
                    <Ionicons name="diamond-outline" size={32} color={GOLD + '50'} />
                  </View>
                </View>
              )}

              {/* Favori butonu — sol üst */}
              <TouchableOpacity
                onPress={handleFavoritePress}
                style={[s.favBtn, {
                  backgroundColor: favorited ? '#EF4444' : colors.background + (isDark ? 'E6' : 'F0'),
                  ...Platform.select({
                    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: favorited ? 0.3 : 0.15, shadowRadius: 4 },
                    android: { elevation: favorited ? 3 : 2 },
                  }),
                }]}
                activeOpacity={0.8}
                hitSlop={8}
              >
                <Animated.View style={favStyle}>
                  <Ionicons
                    name={favorited ? 'heart' : 'heart-outline'}
                    size={16}
                    color={favorited ? '#FFF' : colors.subtext}
                  />
                </Animated.View>
              </TouchableOpacity>

              {/* Stok chip — sağ üst */}
              <View style={[s.stockChip, {
                backgroundColor: colors.background + (isDark ? 'E6' : 'F0'),
                borderColor: stock.color + '33',
              }]}>
                <Ionicons name={stock.icon} size={11} color={stock.color} />
                <Text style={[s.stockText, { color: stock.color }]} numberOfLines={1}>{stock.label}</Text>
              </View>

              {/* Sepette rozeti — imaj sol alt */}
              {inCartQty > 0 && (
                <View style={[s.cartBadge, { backgroundColor: GOLD }]}>
                  <Ionicons name="bag-check" size={10} color="#FFF" />
                  <Text style={s.cartBadgeText}>{inCartQty}</Text>
                </View>
              )}
            </View>

            <View style={s.content}>
              {cat ? (
                <Text style={[s.catTag, { color: GOLD }]} numberOfLines={1}>{cat}</Text>
              ) : null}
              <Text style={[s.name, { fontSize: calculateFontSize(14), color: colors.text }]} numberOfLines={2}>
                {product.name}
              </Text>

              <View style={s.priceRow}>
                <View style={s.priceWrap}>
                  <Text
                    style={[s.price, { color: colors.text, fontSize: calculateFontSize(15) }]}
                    numberOfLines={1}
                  >
                    {priceText}
                  </Text>
                  {product.unit?.symbol ? (
                    <Text style={[s.priceUnit, { color: colors.subtext }]} numberOfLines={1}>
                      /{product.unit.symbol}
                    </Text>
                  ) : null}
                </View>

                <Animated.View style={addStyle}>
                  <TouchableOpacity
                    onPress={handleQuickAddPress}
                    disabled={unavailable}
                    activeOpacity={0.85}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={unavailable ? 'Stokta yok' : 'Sepete ekle'}
                    style={[s.addBtn, {
                      backgroundColor: unavailable ? colors.input : GOLD,
                      opacity: unavailable ? 0.55 : 1,
                      ...Platform.select({
                        ios: { shadowColor: GOLD, shadowOffset: { width: 0, height: 3 }, shadowOpacity: unavailable ? 0 : 0.28, shadowRadius: 6 },
                        android: { elevation: unavailable ? 0 : 3 },
                      }),
                    }]}
                  >
                    <Ionicons
                      name={inCartQty > 0 ? 'bag-add' : 'add'}
                      size={18}
                      color={unavailable ? colors.subtext : '#FFF'}
                    />
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </View>
          </Animated.View>
        </Pressable>
      </Animated.View>

      <QuickAddModal
        visible={quickAddOpen}
        product={product}
        currentCartQty={inCartQty}
        maxQty={product.bakiyeCount && product.bakiyeCount > 0 ? product.bakiyeCount : 99}
        onConfirm={handleQuickAddConfirm}
        onClose={handleQuickAddClose}
      />
    </>
  );
};

/**
 * Katalog listesi 2 kolonlu grid ve her socket tick'i + favori toggle'ında
 * üst ağacın re-render ettirdiği 76+ kart var. Bu yüzden kartı memo'luyoruz.
 *
 * Custom equality: sadece ID, görsel, isim, kategori, fiyat, stok ve index farklıysa
 * yeniden render et. `onPress` parent tarafında useCallback ile stabil; yine de
 * referans farkı render'ı tetiklemesin diye karşılaştırmıyoruz.
 */
export const ProductCard = memo(ProductCardComponent, (prev, next) => {
  if (prev.index !== next.index) return false;
  if (prev.animateEntrance !== next.animateEntrance) return false;
  const a = prev.product;
  const b = next.product;
  return (
    a.id === b.id &&
    a.imageUrl === b.imageUrl &&
    a.name === b.name &&
    a.category?.name === b.category?.name &&
    a.satisFiyati === b.satisFiyati &&
    a.bakiyeCount === b.bakiyeCount &&
    a.kritikStokSeviyesi === b.kritikStokSeviyesi &&
    a.unit?.symbol === b.unit?.symbol
  );
});

const s = StyleSheet.create({
  cardOuter: {
    flex: 1,
    maxWidth: '48%',
    marginBottom: 12,
  },
  card: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
  },
  cardScaleInner: { flex: 1 },
  imgWrap: { aspectRatio: 1, position: 'relative' },
  img: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderIcon: {
    width: 56, height: 56, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  favBtn: {
    position: 'absolute', top: 10, left: 10,
    width: 32, height: 32, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },
  stockChip: {
    position: 'absolute', top: 10, right: 10,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    zIndex: 10,
  },
  stockText: {
    fontSize: 10, fontWeight: '700', letterSpacing: 0.2,
  },
  cartBadge: {
    position: 'absolute', bottom: 10, left: 10,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 10,
    zIndex: 10,
  },
  cartBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  content: { padding: 12, paddingTop: 12 },
  catTag: {
    fontSize: 10, fontWeight: '600',
    letterSpacing: 1.2, textTransform: 'uppercase',
    marginBottom: 4, opacity: 0.8,
  },
  name: {
    fontWeight: '500',
    letterSpacing: -0.2,
    lineHeight: 20,
    marginBottom: 10,
    minHeight: 40,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  priceWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  price: { fontWeight: '800', letterSpacing: -0.4 },
  priceUnit: { fontSize: 11, fontWeight: '600' },
  addBtn: {
    width: 34, height: 34, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
});
