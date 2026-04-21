import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TouchableOpacity,
  RefreshControl,
  Platform,
  FlatList,
  Dimensions,
  Share,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withSpring } from 'react-native-reanimated';
import ImageView from 'react-native-image-viewing';

import { useProductDetail } from '../../src/Hooks/useCatalog';
import { useResponsive } from '../../src/Hooks/UseResponsive';
import { useTheme } from '../../src/Context/ThemeContext';
import { useCart } from '../../src/Context/CartContext';
import { useFavoritesStore } from '../../src/store/favorites/favoritesStore';
import { Skeleton } from '../../src/Components/Ui/Skeleton';
import { ErrorState } from '../../src/Components/Ui/ErrorState';
import { lightImpact } from '../../src/Utils/haptics';
import { VariantSelectModal } from '../../src/Components/Modals/VariantSelectModal';
import { PriceDetailModal } from '../../src/Components/Modals/PriceDetailModal';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PADDING_HORIZONTAL = 20;
const IMAGE_BOX_WIDTH = SCREEN_WIDTH - PADDING_HORIZONTAL * 2;

const getShadowStyle = (isDark: boolean, shadowColor = '#000', elevation = 4) =>
  Platform.select({
    ios: {
      shadowColor,
      shadowOffset: { width: 0, height: elevation },
      shadowOpacity: isDark ? 0.2 : 0.08,
      shadowRadius: elevation * 2,
    },
    android: { elevation },
  });

/** Tarih → "3 gün önce" gibi okunabilir metin */
function formatRelativeDate(iso?: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Az önce';
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} gün önce`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ay önce`;
  const years = Math.floor(months / 12);
  return `${years} yıl önce`;
}

/** Stok seviyesine göre chip bilgisi */
function getStockInfo(
  bakiye: number | undefined,
  kritik: number | undefined,
  colors: { success: string; warning: string; error: string },
) {
  if (bakiye == null || Number.isNaN(bakiye)) return null;
  if (bakiye <= 0) {
    return { label: 'Stokta yok', color: colors.error, icon: 'close-circle' as const };
  }
  if (kritik != null && bakiye <= kritik) {
    return {
      label: `Az kaldı (${bakiye})`,
      color: colors.warning,
      icon: 'alert-circle' as const,
    };
  }
  return { label: `Stokta (${bakiye})`, color: colors.success, icon: 'checkmark-circle' as const };
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { calculateFontSize } = useResponsive();
  const { colors, isDark } = useTheme();

  const { data: product, isLoading, isError, refetch, isRefetching } = useProductDetail(id ?? null);
  const { addToCart, isInCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavoritesStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [workmanshipOpen, setWorkmanshipOpen] = useState(false);

  const favorited = product ? isFavorite(product.id) : false;
  const alreadyInCart = product ? isInCart(product.id) : false;
  const GOLD = colors.catalogGold;

  /** Görselleri tek shape'e indir: { url: string }[] */
  const productImages = useMemo(() => {
    if (!product) return [] as { url: string }[];
    if (product.images?.length) {
      return product.images
        .filter((img) => !!img?.url)
        .map((img) => ({ url: img.url }));
    }
    if (product.imageUrl) return [{ url: product.imageUrl }];
    return [];
  }, [product]);

  const stockInfo = useMemo(
    () =>
      product
        ? getStockInfo(product.bakiyeCount, product.kritikStokSeviyesi, colors)
        : null,
    [product, colors],
  );
  const outOfStock = stockInfo?.label === 'Stokta yok';
  const maxQty = product?.bakiyeCount ?? 99;
  const addedRelative = product ? formatRelativeDate(product.createdAt) : null;

  const handleBack = useCallback(() => {
    lightImpact();
    router.back();
  }, [router]);

  const handleScroll = useCallback(
    (event: any) => {
      const slideSize = event.nativeEvent.layoutMeasurement.width;
      const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
      if (index !== activeImageIndex) setActiveImageIndex(index);
    },
    [activeImageIndex],
  );

  const cartScale = useSharedValue(1);
  const cartAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cartScale.value }],
  }));

  const handleAddToCart = useCallback(
    (qty = quantity) => {
      if (!product) return;
      lightImpact();
      addToCart(product, qty);
      setJustAdded(true);
      cartScale.value = withSequence(
        withSpring(0.93, { damping: 15, stiffness: 400 }),
        withSpring(1, { damping: 12, stiffness: 300 }),
      );
      setTimeout(() => setJustAdded(false), 2000);
    },
    [product, addToCart, cartScale, quantity],
  );

  const handleModalAddToCart = useCallback(
    (qty: number) => {
      handleAddToCart(qty);
      setShowPriceModal(false);
    },
    [handleAddToCart],
  );

  const handleFavorite = useCallback(() => {
    if (!product) return;
    lightImpact();
    toggleFavorite(product);
  }, [product, toggleFavorite]);

  const handleShare = useCallback(async () => {
    if (!product) return;
    lightImpact();
    try {
      await Share.share({
        title: product.name,
        message: `${product.name}${product.urunKodu ? ` (${product.urunKodu})` : ''}\n${product.description ?? ''}`.trim(),
      });
    } catch {
      /* kullanıcı iptali veya platform hatası sessiz geçilir */
    }
  }, [product]);

  const decQty = useCallback(() => {
    lightImpact();
    setQuantity((q) => Math.max(1, q - 1));
  }, []);
  const incQty = useCallback(() => {
    lightImpact();
    setQuantity((q) => Math.min(maxQty, q + 1));
  }, [maxQty]);

  const toggleWorkmanship = useCallback(() => {
    lightImpact();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setWorkmanshipOpen((v) => !v);
  }, []);

  const renderNav = () => (
    <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background }}>
      <View style={[s.nav, { borderBottomColor: colors.divider }]}>
        <Pressable onPress={handleBack} style={s.navBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text
          style={[s.navTitle, { fontSize: calculateFontSize(17), color: colors.text }]}
          numberOfLines={1}
        >
          {product?.name ?? 'Ürün'}
        </Text>
        {product ? (
          <View style={s.navActions}>
            <Pressable onPress={handleShare} style={s.navBtn} hitSlop={8}>
              <Ionicons name="share-outline" size={22} color={colors.text} />
            </Pressable>
            <Pressable onPress={handleFavorite} style={s.navBtn} hitSlop={8}>
              <Ionicons
                name={favorited ? 'heart' : 'heart-outline'}
                size={22}
                color={favorited ? '#EF4444' : colors.text}
              />
            </Pressable>
          </View>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>
    </SafeAreaView>
  );

  if (isLoading) {
    return (
      <View style={[s.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        {renderNav()}
        <View style={{ padding: PADDING_HORIZONTAL }}>
          <Skeleton width="100%" height={IMAGE_BOX_WIDTH} style={{ borderRadius: 24, marginBottom: 20 }} />
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
        {renderNav()}
        <ErrorState message="Ürün bulunamadı" onRetry={() => refetch()} />
      </View>
    );
  }

  const hasWeight = product.agirlikGr != null && product.agirlikGr > 0;
  const hasStoneWeight = product.tasAgirlikGr != null && product.tasAgirlikGr > 0;
  const hasMilyem = product.milyemKatsayisi != null && product.milyemKatsayisi > 0;
  const hasWorkmanship =
    (product.iscilikAdet != null && product.iscilikAdet > 0) ||
    (product.iscilikMilyem != null && product.iscilikMilyem > 0) ||
    !!product.iscilikTipi;

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      {renderNav()}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor={GOLD}
            colors={[GOLD]}
          />
        }
      >
        {/* FOTOĞRAF ALANI + ROZETLER */}
        <View style={s.imgWrap}>
          <View
            style={[
              s.imgBox,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                ...getShadowStyle(isDark, '#000', 4),
              },
            ]}
          >
            {productImages.length > 0 ? (
              <>
                <FlatList
                  data={productImages}
                  keyExtractor={(_, index) => index.toString()}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                  renderItem={({ item, index }) => (
                    <Pressable
                      onPress={() => {
                        lightImpact();
                        setActiveImageIndex(index);
                        setIsViewerVisible(true);
                      }}
                      style={{ width: IMAGE_BOX_WIDTH, height: IMAGE_BOX_WIDTH }}
                    >
                      <Image source={{ uri: item.url }} style={s.img} contentFit="contain" />
                    </Pressable>
                  )}
                />

                {productImages.length > 1 && (
                  <View style={s.paginationContainer}>
                    {productImages.map((_, i) => (
                      <View
                        key={i}
                        style={[
                          s.dot,
                          activeImageIndex === i
                            ? [s.dotActive, { backgroundColor: GOLD }]
                            : { backgroundColor: colors.divider },
                        ]}
                      />
                    ))}
                  </View>
                )}
              </>
            ) : (
              <View style={s.placeholder}>
                <View style={[s.placeholderCircle, { backgroundColor: GOLD + '0A' }]}>
                  <Ionicons name="diamond-outline" size={48} color={GOLD + '60'} />
                </View>
              </View>
            )}
          </View>

          {/* Sol üst rozet sütunu */}
          <View style={s.badgeColumn} pointerEvents="none">
            {product.yeni && (
              <View style={[s.badge, { backgroundColor: colors.success }]}>
                <Ionicons name="sparkles" size={10} color="#fff" />
                <Text style={s.badgeText}>Yeni</Text>
              </View>
            )}
            {product.indirimli && (
              <View style={[s.badge, { backgroundColor: colors.error }]}>
                <Ionicons name="pricetag" size={10} color="#fff" />
                <Text style={s.badgeText}>İndirim</Text>
              </View>
            )}
            {product.katalogdaGoster && (
              <View style={[s.badge, { backgroundColor: GOLD }]}>
                <Ionicons name="star" size={10} color="#fff" />
                <Text style={s.badgeText}>Öne çıkan</Text>
              </View>
            )}
          </View>
        </View>

        {/* ÜST META: SKU + Stok 
        <View style={s.metaRow}>
          {!!product.urunKodu && (
            <View style={[s.skuChip, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Ionicons name="barcode-outline" size={12} color={colors.subtext} />
              <Text style={[s.skuText, { color: colors.subtext }]}>{product.urunKodu}</Text>
            </View>
          )}
          {stockInfo && (
            <View style={[s.stockChip, { backgroundColor: stockInfo.color + '18', borderColor: stockInfo.color + '40' }]}>
              <Ionicons name={stockInfo.icon} size={13} color={stockInfo.color} />
              <Text style={[s.stockText, { color: stockInfo.color }]}>{stockInfo.label}</Text>
            </View>
          )}
        </View>
*/}
        {/* Info card */}
        <View
          style={[
            s.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              ...getShadowStyle(isDark, '#000', 3),
            },
          ]}
        >
          {product.category && (
            <InfoItem label="Kategori" colors={colors}>
              <View style={[s.pill, { backgroundColor: colors.divider }]}>
                <Text style={[s.pillText, { color: colors.text }]}>{product.category.name}</Text>
              </View>
            </InfoItem>
          )}

          {product.variant && (
            <InfoItem label="Ayar / Malzeme" colors={colors}>
              <TouchableOpacity
                onPress={() => {
                  lightImpact();
                  setShowVariantModal(true);
                }}
                activeOpacity={0.75}
              >
                <View style={[s.pill, s.pillGold, { backgroundColor: GOLD + '14', borderColor: GOLD + '20' }]}>
                  <Text style={[s.pillGoldText, { color: GOLD }]}>{product.variant.name}</Text>
                  <Ionicons name="chevron-down" size={12} color={GOLD} />
                </View>
              </TouchableOpacity>
            </InfoItem>
          )}

          {product.brand && (
            <InfoItem label="Marka" colors={colors}>
              <Text style={[s.infoVal, { color: colors.text }]}>{product.brand.name}</Text>
            </InfoItem>
          )}

          {/* AĞIRLIK PANELİ */}
          {(hasWeight || hasStoneWeight || hasMilyem) && (
            <View style={[s.specGrid, { borderTopColor: colors.divider }]}>
              {hasWeight && (
                <SpecCell
                  icon="scale-outline"
                  label="Toplam Ağırlık"
                  value={`${product.agirlikGr.toLocaleString('tr-TR')} gr`}
                  colors={colors}
                />
              )}
              {hasStoneWeight && (
                <SpecCell
                  icon="diamond-outline"
                  label="Taş Ağırlığı"
                  value={`${product.tasAgirlikGr.toLocaleString('tr-TR')} gr`}
                  colors={colors}
                />
              )}
              {hasMilyem && (
                <SpecCell
                  icon="analytics-outline"
                  label="Milyem"
                  value={product.milyemKatsayisi.toLocaleString('tr-TR', {
                    maximumFractionDigits: 4,
                  })}
                  colors={colors}
                />
              )}
            </View>
          )}

          {/* İŞÇİLİK ACCORDION */}
          {hasWorkmanship && (
            <View style={[s.accordionWrap, { borderTopColor: colors.divider }]}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={toggleWorkmanship}
                style={s.accordionHead}
              >
                <View style={s.accordionTitleWrap}>
                  <Ionicons name="construct-outline" size={16} color={GOLD} />
                  <Text style={[s.accordionTitle, { color: colors.text }]}>İşçilik Detayı</Text>
                </View>
                <Ionicons
                  name={workmanshipOpen ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.subtext}
                />
              </TouchableOpacity>
              {workmanshipOpen && (
                <View style={s.accordionBody}>
                  {!!product.iscilikTipi && (
                    <KeyValRow label="Tip" value={product.iscilikTipi} colors={colors} />
                  )}
                  {product.iscilikMilyem != null && product.iscilikMilyem > 0 && (
                    <KeyValRow
                      label="Milyem"
                      value={product.iscilikMilyem.toLocaleString('tr-TR', { maximumFractionDigits: 4 })}
                      colors={colors}
                    />
                  )}
                  {product.iscilikAdet != null && product.iscilikAdet > 0 && (
                    <KeyValRow
                      label="Adet"
                      value={`${product.iscilikAdet.toLocaleString('tr-TR')} ₺`}
                      colors={colors}
                    />
                  )}
                </View>
              )}
            </View>
          )}

          {product.description && (
            <View style={[s.descWrap, { borderTopColor: colors.divider }]}>
              <Text style={[s.descLabel, { color: colors.subtext }]}>Açıklama</Text>
              <Text style={[s.descText, { color: colors.text }]}>{product.description}</Text>
            </View>
          )}

          {!!addedRelative && (
            <Text style={[s.addedAt, { color: colors.subtext }]}>Eklendi: {addedRelative}</Text>
          )}
        </View>
      </ScrollView>

      {/* Tam ekran görüntüleyici */}
      <ImageView
        images={productImages.map((img) => ({ uri: img.url }))}
        imageIndex={activeImageIndex}
        visible={isViewerVisible}
        onRequestClose={() => setIsViewerVisible(false)}
        swipeToCloseEnabled
        doubleTapToZoomEnabled
      />

      {product.variant && (
        <VariantSelectModal
          visible={showVariantModal}
          variants={[product.variant]}
          selectedVariant={product.variant}
          product={product}
          onSelect={() => {}}
          onClose={() => setShowVariantModal(false)}
          colors={colors}
          isDark={isDark}
        />
      )}
      <PriceDetailModal
        visible={showPriceModal}
        product={product}
        onClose={() => setShowPriceModal(false)}
        onAddToCart={handleModalAddToCart}
        alreadyInCart={alreadyInCart}
        colors={colors}
        isDark={isDark}
      />

      {/* ALT BAR: Fiyat detay + Qty stepper + Sepete ekle */}
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: colors.background }}>
        <View style={[s.bottomBar, { borderTopColor: colors.divider }]}>
          <TouchableOpacity
            onPress={() => {
              lightImpact();
              setShowPriceModal(true);
            }}
            style={[s.priceDetailBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            activeOpacity={0.7}
          >
            <Ionicons name="bar-chart-outline" size={20} color={GOLD} />
          </TouchableOpacity>

          {/* Adet seçici */}
          <View style={[s.qtyWrap, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Pressable
              onPress={decQty}
              disabled={quantity <= 1}
              style={[s.qtyBtn, quantity <= 1 && { opacity: 0.4 }]}
              hitSlop={6}
            >
              <Ionicons name="remove" size={18} color={colors.text} />
            </Pressable>
            <Text style={[s.qtyText, { color: colors.text }]}>{quantity}</Text>
            <Pressable
              onPress={incQty}
              disabled={quantity >= maxQty || outOfStock}
              style={[s.qtyBtn, (quantity >= maxQty || outOfStock) && { opacity: 0.4 }]}
              hitSlop={6}
            >
              <Ionicons name="add" size={18} color={colors.text} />
            </Pressable>
          </View>

          <Animated.View style={[{ flex: 1 }, cartAnimStyle]}>
            <Pressable
              onPress={() => handleAddToCart()}
              disabled={outOfStock}
              style={({ pressed }) => [
                s.addToCartBtn,
                {
                  backgroundColor: outOfStock
                    ? colors.divider
                    : justAdded
                      ? colors.success
                      : GOLD,
                  opacity: pressed ? 0.85 : outOfStock ? 0.7 : 1,
                  ...getShadowStyle(
                    false,
                    outOfStock ? '#000' : justAdded ? colors.success : GOLD,
                    outOfStock ? 0 : 4,
                  ),
                },
              ]}
            >
              <Ionicons
                name={
                  outOfStock
                    ? 'ban-outline'
                    : justAdded
                      ? 'checkmark-circle'
                      : alreadyInCart
                        ? 'cart'
                        : 'cart-outline'
                }
                size={20}
                color={outOfStock ? colors.subtext : colors.background}
              />
              <Text
                style={[
                  s.addToCartText,
                  { color: outOfStock ? colors.subtext : colors.background },
                ]}
              >
                {outOfStock
                  ? 'Stokta Yok'
                  : justAdded
                    ? 'Eklendi!'
                    : alreadyInCart
                      ? 'Tekrar Ekle'
                      : 'Sepete Ekle'}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function InfoItem({
  label,
  children,
  colors,
}: {
  label: string;
  children: React.ReactNode;
  colors: any;
}) {
  return (
    <View style={s.infoItem}>
      <Text style={[s.infoLabel, { color: colors.subtext }]}>{label}</Text>
      {children}
    </View>
  );
}

function SpecCell({
  icon,
  label,
  value,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  colors: any;
}) {
  return (
    <View style={s.specCell}>
      <View style={[s.specIconWrap, { backgroundColor: colors.divider }]}>
        <Ionicons name={icon} size={16} color={colors.text} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.specLabel, { color: colors.subtext }]}>{label}</Text>
        <Text style={[s.specValue, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  );
}

function KeyValRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: any;
}) {
  return (
    <View style={s.kvRow}>
      <Text style={[s.kvLabel, { color: colors.subtext }]}>{label}</Text>
      <Text style={[s.kvValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },

  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  navBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  navActions: { flexDirection: 'row' },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 17,
  },

  scroll: { padding: PADDING_HORIZONTAL, paddingBottom: 24 },

  imgWrap: { position: 'relative', marginBottom: 16 },
  imgBox: {
    width: IMAGE_BOX_WIDTH,
    height: IMAGE_BOX_WIDTH,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
  },
  img: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  paginationContainer: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotActive: { width: 16 },

  badgeColumn: {
    position: 'absolute',
    top: 14,
    left: 14,
    gap: 6,
    alignItems: 'flex-start',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  skuChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  skuText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  stockChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  stockText: { fontSize: 12, fontWeight: '700' },

  card: {
    borderRadius: 22,
    padding: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  infoItem: { marginBottom: 16 },
  infoLabel: { fontSize: 12, fontWeight: '500', marginBottom: 6 },
  infoVal: { fontSize: 15, fontWeight: '600' },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  pillText: { fontSize: 13, fontWeight: '600' },
  pillGold: { borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  pillGoldText: { fontSize: 13, fontWeight: '700' },

  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 16,
    marginTop: 4,
    borderTopWidth: 1,
    marginHorizontal: -4,
  },
  specCell: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  specIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specLabel: { fontSize: 11, fontWeight: '500', marginBottom: 2 },
  specValue: { fontSize: 14, fontWeight: '700' },

  accordionWrap: {
    marginTop: 4,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  accordionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  accordionTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  accordionTitle: { fontSize: 14, fontWeight: '700' },
  accordionBody: { marginTop: 10, gap: 8 },
  kvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kvLabel: { fontSize: 13, fontWeight: '500' },
  kvValue: { fontSize: 14, fontWeight: '600' },

  descWrap: {
    marginTop: 4,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  descLabel: { fontSize: 12, fontWeight: '500', marginBottom: 8 },
  descText: { fontSize: 15, lineHeight: 23 },

  addedAt: { fontSize: 11, fontWeight: '500', marginTop: 14, textAlign: 'right' },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 22,
    borderTopWidth: 1,
  },
  priceDetailBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  qtyWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 4,
    borderRadius: 16,
    borderWidth: 1,
  },
  qtyBtn: {
    width: 32,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    minWidth: 22,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 56,
    borderRadius: 16,
  },
  addToCartText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
