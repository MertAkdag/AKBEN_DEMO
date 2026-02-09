import React, { useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeIn,
  Layout,
  FadeOutLeft,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { Spacing } from '../../src/Constants/Spacing';
import { ScreenHeader } from '../../src/Shared/Header';
import { useTheme } from '../../src/Context/ThemeContext';
import { useCart, CartItem } from '../../src/Context/CartContext';
import { lightImpact } from '../../src/Utils/haptics';
import type { ThemeColors } from '../../src/Constants/Theme';

const TAB_BAR_HEIGHT = 100;
const THUMB_SIZE = 88;
const AnimPressable = Animated.createAnimatedComponent(Pressable);

/* ═══════════════════════════════════════════
   Boş Sepet – Premium Empty State
   ═══════════════════════════════════════════ */
function EmptyCart({ colors, isDark }: { colors: ThemeColors; isDark: boolean }) {
  const router = useRouter();
  return (
    <Animated.View entering={FadeIn.duration(600)} style={es.wrap}>
      {/* Dekoratif halka */}
      <View style={[es.ring3, { borderColor: colors.primary + '06' }]}>
        <View style={[es.ring2, { borderColor: colors.primary + '0C' }]}>
          <View style={[es.ring1, {
            backgroundColor: colors.primary + '08',
            borderColor: colors.primary + '12',
          }]}>
            <Ionicons name="bag-outline" size={44} color={colors.primary + '50'} />
          </View>
        </View>
      </View>

      <Text style={[es.title, { color: colors.text }]}>Sepetiniz boş</Text>
      <Text style={[es.desc, { color: colors.subtext }]}>
        Katalogdaki ürünleri keşfedin ve{'\n'}beğendiklerinizi sepetinize ekleyin.
      </Text>

      <Pressable
        onPress={() => { lightImpact(); router.push('/(tabs)/catalog'); }}
        style={({ pressed }) => [es.cta, {
          backgroundColor: colors.primary,
          transform: [{ scale: pressed ? 0.97 : 1 }],
          ...Platform.select({
            ios: { shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 14 },
            android: { elevation: 8 },
          }),
        }]}
      >
        <Ionicons name="diamond-outline" size={17} color={isDark ? '#111' : '#FFF'} />
        <Text style={[es.ctaText, { color: isDark ? '#111' : '#FFF' }]}>Kataloğu Keşfet</Text>
      </Pressable>
    </Animated.View>
  );
}

const es = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 44,
    paddingBottom: TAB_BAR_HEIGHT + 20,
  },
  ring3: {
    width: 160, height: 160, borderRadius: 80,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 32,
  },
  ring2: {
    width: 130, height: 130, borderRadius: 65,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  ring1: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5, marginBottom: 10 },
  desc: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 32 },
  cta: {
    flexDirection: 'row', alignItems: 'center', gap: 9,
    paddingHorizontal: 28, paddingVertical: 15, borderRadius: 16,
  },
  ctaText: { fontSize: 16, fontWeight: '700' },
});

/* ═══════════════════════════════════════════
   iOS-style Stepper
   ═══════════════════════════════════════════ */
function QuantityStepper({
  quantity,
  onDecrease,
  onIncrease,
  colors,
}: {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  colors: ThemeColors;
}) {
  return (
    <View style={[qs.wrap, {
      backgroundColor: colors.background,
      borderColor: colors.divider,
    }]}>
      <Pressable
        onPress={onDecrease}
        style={({ pressed }) => [qs.btn, pressed && { opacity: 0.5 }]}
        hitSlop={6}
      >
        <Ionicons
          name={quantity <= 1 ? 'trash-outline' : 'remove'}
          size={quantity <= 1 ? 14 : 16}
          color={quantity <= 1 ? colors.error : colors.primary}
        />
      </Pressable>

      <View style={[qs.divider, { backgroundColor: colors.divider }]} />

      <View style={qs.countWrap}>
        <Text style={[qs.count, { color: colors.text }]}>{quantity}</Text>
      </View>

      <View style={[qs.divider, { backgroundColor: colors.divider }]} />

      <Pressable
        onPress={onIncrease}
        style={({ pressed }) => [qs.btn, pressed && { opacity: 0.5 }]}
        hitSlop={6}
      >
        <Ionicons name="add" size={16} color={colors.primary} />
      </Pressable>
    </View>
  );
}

const qs = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  btn: {
    width: 38,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { width: 1, height: '55%' },
  countWrap: {
    minWidth: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  count: { fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },
});

/* ═══════════════════════════════════════════
   Swipe-to-Delete Arka Plan
   ═══════════════════════════════════════════ */
function SwipeDeleteAction({ colors, onPress }: { colors: ThemeColors; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[sd.wrap, { backgroundColor: colors.error }]}>
      <Ionicons name="trash" size={22} color="#FFF" />
      <Text style={sd.label}>Sil</Text>
    </Pressable>
  );
}

const sd = StyleSheet.create({
  wrap: {
    width: 80,
    borderRadius: 24,
    marginLeft: 10,
    marginBottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { color: '#FFF', fontSize: 12, fontWeight: '600', marginTop: 4 },
});

/* ═══════════════════════════════════════════
   Sepet Öğesi – Premium Apple-Style Card
   ═══════════════════════════════════════════ */
function CartItemCard({
  item,
  index,
  colors,
  isDark,
  onRemove,
  onUpdateQty,
}: {
  item: CartItem;
  index: number;
  colors: ThemeColors;
  isDark: boolean;
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, qty: number) => void;
}) {
  const GOLD = colors.catalogGold;
  const product = item.product;
  const cat = product.category?.name ?? '';
  const variant = product.variant?.name ?? '';
  const swipeRef = useRef<Swipeable>(null);

  const scale = useSharedValue(1);
  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleRemove = useCallback(() => {
    lightImpact();
    swipeRef.current?.close();
    setTimeout(() => onRemove(product.id), 150);
  }, [product.id, onRemove]);

  const handleDecrease = useCallback(() => {
    lightImpact();
    if (item.quantity <= 1) {
      onRemove(product.id);
    } else {
      onUpdateQty(product.id, item.quantity - 1);
    }
  }, [product.id, item.quantity, onRemove, onUpdateQty]);

  const handleIncrease = useCallback(() => {
    lightImpact();
    onUpdateQty(product.id, item.quantity + 1);
  }, [product.id, item.quantity, onUpdateQty]);

  return (
    <Animated.View
      entering={FadeInDown.duration(420).delay(index * 70).springify()}
      exiting={FadeOutLeft.duration(280)}
      layout={Layout.springify().damping(16).stiffness(140)}
    >
      <Swipeable
        ref={swipeRef}
        friction={2}
        rightThreshold={40}
        overshootRight={false}
        renderRightActions={() => (
          <SwipeDeleteAction colors={colors} onPress={handleRemove} />
        )}
      >
        <AnimPressable
          style={[s.card, {
            backgroundColor: colors.card,
            borderColor: isDark ? colors.cardBorder : colors.border + '50',
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.22 : 0.06,
                shadowRadius: 12,
              },
              android: { elevation: 3 },
            }),
          }, scaleStyle]}
          onPressIn={() => { scale.value = withSpring(0.98, { damping: 18, stiffness: 300 }); }}
          onPressOut={() => { scale.value = withSpring(1, { damping: 14, stiffness: 240 }); }}
        >
          {/* ── Üst Bölüm: Thumbnail + Bilgi ── */}
          <View style={s.topRow}>
            {/* Thumbnail */}
            <View style={[s.thumb, {
              backgroundColor: isDark ? colors.background : '#F8F8FA',
              borderColor: isDark ? colors.cardBorder : colors.border + '40',
            }]}>
              {product.imageUrl ? (
                <Image
                  source={{ uri: product.imageUrl }}
                  style={s.thumbImg}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View style={s.thumbPlaceholder}>
                  <View style={[s.thumbIconBg, { backgroundColor: GOLD + '0A' }]}>
                    <Ionicons name="diamond" size={26} color={GOLD + '55'} />
                  </View>
                </View>
              )}
            </View>

            {/* Bilgi Alanı */}
            <View style={s.info}>
              {/* Kategori etiketi */}
              {cat ? (
                <Text style={[s.catLabel, { color: GOLD }]} numberOfLines={1}>
                  {cat}
                </Text>
              ) : null}

              {/* Ürün adı */}
              <Text style={[s.name, { color: colors.text }]} numberOfLines={2}>
                {product.name}
              </Text>

              {/* Varyant pill */}
              {variant ? (
                <View style={[s.variantRow]}>
                  <View style={[s.variantDot, { backgroundColor: GOLD }]} />
                  <Text style={[s.variantLabel, { color: colors.subtext }]}>{variant}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* ── Alt Bölüm: Stepper + Kaldır ── */}
          <View style={[s.bottomRow, { borderTopColor: isDark ? colors.divider : colors.border + '25' }]}>
            <QuantityStepper
              quantity={item.quantity}
              onDecrease={handleDecrease}
              onIncrease={handleIncrease}
              colors={colors}
            />

            <Pressable
              onPress={handleRemove}
              style={({ pressed }) => [s.removeBtn, pressed && { opacity: 0.5 }]}
              hitSlop={8}
            >
              <Text style={[s.removeBtnText, { color: colors.subtext }]}>Kaldır</Text>
            </Pressable>
          </View>
        </AnimPressable>
      </Swipeable>
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════
   Sepet Özeti Footer
   ═══════════════════════════════════════════ */
function CartSummary({ totalCount, itemCount, colors, isDark }: {
  totalCount: number; itemCount: number; colors: ThemeColors; isDark: boolean;
}) {
  return (
    <Animated.View
      entering={FadeInDown.duration(500).delay(200).springify()}
      style={[sm.wrap, {
        backgroundColor: colors.card,
        borderColor: isDark ? colors.cardBorder : colors.border + '50',
        ...Platform.select({
          ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.2 : 0.05, shadowRadius: 10 },
          android: { elevation: 3 },
        }),
      }]}
    >
      <View style={sm.row}>
        <Text style={[sm.label, { color: colors.subtext }]}>Ürün çeşidi</Text>
        <Text style={[sm.value, { color: colors.text }]}>{itemCount}</Text>
      </View>
      <View style={[sm.divider, { backgroundColor: isDark ? colors.divider : colors.border + '25' }]} />
      <View style={sm.row}>
        <Text style={[sm.label, { color: colors.subtext }]}>Toplam adet</Text>
        <Text style={[sm.value, { color: colors.primary }]}>{totalCount}</Text>
      </View>
    </Animated.View>
  );
}

const sm = StyleSheet.create({
  wrap: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  label: { fontSize: 14, fontWeight: '500' },
  value: { fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'] },
  divider: { height: 1, marginHorizontal: 20 },
});

/* ═══════════════════════════════════════════
   Ana Ekran
   ═══════════════════════════════════════════ */
export default function CartScreen() {
  const { colors, isDark } = useTheme();
  const { items, totalCount, removeFromCart, updateQuantity, clearCart } = useCart();

  const handleClearCart = useCallback(() => {
    Alert.alert(
      'Sepeti Temizle',
      'Sepetinizdeki tüm ürünler kaldırılacak.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Temizle',
          style: 'destructive',
          onPress: () => { lightImpact(); clearCart(); },
        },
      ],
    );
  }, [clearCart]);

  const renderItem = useCallback(({ item, index }: { item: CartItem; index: number }) => (
    <CartItemCard
      item={item}
      index={index}
      colors={colors}
      isDark={isDark}
      onRemove={removeFromCart}
      onUpdateQty={updateQuantity}
    />
  ), [colors, isDark, removeFromCart, updateQuantity]);

  const ListHeader = useMemo(() => (
    <View style={ls.headerWrap}>
      <ScreenHeader title="Sepetim" subtitle={totalCount > 0 ? `${totalCount} ürün` : undefined} />
      {items.length > 1 && (
        <Animated.View entering={FadeIn.duration(300)}>
          <Pressable
            onPress={handleClearCart}
            style={({ pressed }) => [ls.clearBtn, pressed && { opacity: 0.5 }]}
            hitSlop={8}
          >
            <Text style={[ls.clearText, { color: colors.error }]}>Tümünü temizle</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  ), [totalCount, items.length, colors, handleClearCart]);

  const ListFooter = useMemo(() => {
    if (items.length === 0) return null;
    return (
      <CartSummary
        totalCount={totalCount}
        itemCount={items.length}
        colors={colors}
        isDark={isDark}
      />
    );
  }, [items.length, totalCount, colors, isDark]);

  if (items.length === 0) {
    return (
      <SafeAreaView style={[ls.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={ls.headerPad}>
          <ScreenHeader title="Sepetim" />
        </View>
        <EmptyCart colors={colors} isDark={isDark} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[ls.container, { backgroundColor: colors.background }]} edges={['top']}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id}
        renderItem={renderItem}
        contentContainerStyle={ls.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
      />
    </SafeAreaView>
  );
}

/* ═══════════════════════════════════════════
   Layout & List Stilleri
   ═══════════════════════════════════════════ */
const ls = StyleSheet.create({
  container: { flex: 1 },
  headerPad: { paddingHorizontal: Spacing.screenPadding },
  listContent: { paddingHorizontal: Spacing.screenPadding, paddingBottom: TAB_BAR_HEIGHT },
  headerWrap: { marginBottom: 4 },
  clearBtn: { alignSelf: 'flex-end', paddingVertical: 6, paddingHorizontal: 2, marginBottom: 8 },
  clearText: { fontSize: 14, fontWeight: '600' },
});

/* ═══════════════════════════════════════════
   Card Stilleri – Apple HIG Uyumlu
   ═══════════════════════════════════════════ */
const s = StyleSheet.create({
  /* Kart ana kapsayıcı */
  card: {
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 14,
    overflow: 'hidden',
  },

  /* ── Üst bölüm ── */
  topRow: {
    flexDirection: 'row',
    padding: 14,
    gap: 14,
  },

  /* Thumbnail */
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  thumbImg: { width: '100%', height: '100%' },
  thumbPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Bilgi alanı */
  info: {
    flex: 1,
    paddingTop: 2,
    justifyContent: 'center',
  },
  catLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 4,
    opacity: 0.85,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 21,
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  variantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  variantDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  variantLabel: {
    fontSize: 13,
    fontWeight: '500',
  },

  /* ── Alt bölüm ── */
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  removeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  removeBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
