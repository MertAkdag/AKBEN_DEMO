import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Platform,
  FlatList,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  Easing,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { catalogService } from '../../src/Api/catalogService';
import { ProductOfWeekSlider } from '../../src/Components/Cards/ProductOfWeekSlider';
import type { Product } from '../../src/Types/catalog';
import { useGoldPrice } from '../../src/Context/GoldPriceContext';
import { useTheme } from '../../src/Context/ThemeContext';
import { useFavoritesStore } from '../../src/store/favorites/favoritesStore';
import { lightImpact } from '../../src/Utils/haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ThemeColors } from '../../src/Constants/Theme';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/features/auth/useAuth';

/* ─── Layout ─── */
const SW = Dimensions.get('window').width;
const PAD = 16;
const TAB_H = 100;
const BANNER_W = SW - PAD * 2;
const BANNER_H = 172;
const CARD_HALF = (SW - PAD * 2 - 10) / 2;

/* ─── Promosyon Banner Verisi ─── */
const BANNERS = [
  {
    key: 'b1',
    badge: '🔥 Kampanya',
    title: 'Düğün Sezonuna\nÖzel Koleksiyon',
    subtitle: '22 Ayar Altın Set',
    accent: '#C9963B',
    bg: '#1A1108',
    deco1: '#C9963B22',
    deco2: '#C9963B10',
  },
  {
    key: 'b2',
    badge: '✨ Yeni Sezon',
    title: 'Minimal Tasarım\nYüzük Serisi',
    subtitle: '22 Ayar Altın',
    accent: '#7C6CF5',
    bg: '#0F0D1F',
    deco1: '#7C6CF540',
    deco2: '#7C6CF515',
  },
  {
    key: 'b3',
    badge: '💎 Öne Çıkan',
    title: 'Solitaire Kolye\nKoleksiyonu',
    subtitle: '22 Ayar Altın',
    accent: '#2DD4BF',
    bg: '#071715',
    deco1: '#2DD4BF30',
    deco2: '#2DD4BF12',
  },
];


/* ─── Promosyon Banner ─── */
function PromoBanner({ item }: { item: typeof BANNERS[number] }) {
  return (
    <View style={[styles.banner, { backgroundColor: item.bg }]}>
      <View style={[styles.bannerCircle1, { backgroundColor: item.deco1 }]} />
      <View style={[styles.bannerCircle2, { backgroundColor: item.deco2 }]} />
      <View style={[styles.bannerIconWrap, { backgroundColor: item.accent + '20', borderColor: item.accent + '40' }]}>
        <Ionicons name="diamond" size={32} color={item.accent} />
      </View>
      <View style={styles.bannerTop}>
        <View style={[styles.bannerBadge, { backgroundColor: item.accent + '25', borderColor: item.accent + '50' }]}>
          <Text style={[styles.bannerBadgeText, { color: item.accent }]}>{item.badge}</Text>
        </View>
      </View>
      <View style={styles.bannerBottom}>
        <Text style={[styles.bannerTitle, { color: '#FFFFFF' }]}>{item.title}</Text>
        <Text style={[styles.bannerSubtitle, { color: item.accent }]}>{item.subtitle}</Text>
        <View style={[styles.bannerBtn, { backgroundColor: item.accent }]}>
          <Text style={styles.bannerBtnText}>İncele</Text>
          <Ionicons name="arrow-forward" size={12} color="#FFF" />
        </View>
      </View>
    </View>
  );
}

/* ─── Pulse dot animasyonu ─── */
function PulseDot({ color }: { color: string }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.9, { duration: 1100, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
    opacity.value = withRepeat(
      withTiming(0, { duration: 1100, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.pulseWrap}>
      <Animated.View style={[styles.pulseRing, { borderColor: color }, ringStyle]} />
      <View style={[styles.pulseDot, { backgroundColor: color }]} />
    </View>
  );
}

/* ─── Tek fiyat kartı ─── */
function PriceCard({
  label,
  sublabel,
  sell,
  buy,
  change,
  changeNum,
  color,
  colors,
  isDark,
  wide = false,
  decimals = 0,
  leadingIcon,
}: {
  label: string; sublabel: string; sell: number; buy: number;
  change: string; changeNum: number; color: string;
  colors: ThemeColors; isDark: boolean; wide?: boolean;
  decimals?: number;
  leadingIcon?: keyof typeof Ionicons.glyphMap;
}) {
  const isUp = changeNum > 0;
  const isDown = changeNum < 0;
  const changeColor = isUp ? '#10B981' : isDown ? '#EF4444' : colors.subtext;
  const changeIcon: keyof typeof Ionicons.glyphMap = isUp ? 'trending-up' : isDown ? 'trending-down' : 'remove-outline';

  return (
    <View
      style={[
        styles.priceCard,
        wide && styles.priceCardWide,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          ...Platform.select({
            ios: { shadowColor: color, shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDark ? 0.15 : 0.07, shadowRadius: 10 },
            android: { elevation: 4 },
          }),
        },
      ]}
    >
      {/* Arka plan renk aksanı */}
      <View style={[styles.priceCardAccent, { backgroundColor: color + (isDark ? '14' : '08') }]} />

      {/* Üst: label + ikon */}
      <View style={styles.priceCardTop}>
        <View style={styles.priceCardLeft}>
          {leadingIcon ? (
            <View style={[styles.priceCardIcon, { backgroundColor: color + (isDark ? '22' : '14') }]}>
              <Ionicons name={leadingIcon} size={14} color={color} />
            </View>
          ) : null}
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.priceCardLabel, { color: colors.text }]} numberOfLines={1}>{label}</Text>
            <View style={styles.priceCardBottomRow}>
              <Text style={[styles.priceCardSublabel, { color: colors.subtext }]} numberOfLines={1}>{sublabel}</Text>
              {change !== '—' && (
                <View style={[styles.changePill, { backgroundColor: changeColor + '14' }]}>
                  <Ionicons name={changeIcon} size={10} color={changeColor} />
                  <Text style={[styles.changeText, { color: changeColor }]} numberOfLines={1}>{change}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Ana fiyat */}
      <Text style={[styles.priceCardPrice, { color: colors.text }]}>
        {sell > 0
          ? sell.toLocaleString('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
          : '—'}
        <Text style={[styles.priceCardCurrency, { color: color }]}> ₺</Text>
      </Text>

      {/* Renkli alt çizgi */}
      <View style={[styles.priceCardBar, { backgroundColor: color }]} />
    </View>
  );
}

/* ─── Canlı Piyasa Bölümü ─── */
function LivePricesSection({ colors, isDark }: { colors: ThemeColors; isDark: boolean }) {
  const goldPrice = useGoldPrice();
  const isSocket = goldPrice.source === 'socket';
  const liveColor = goldPrice.isFallback ? '#F59E0B' : isSocket ? '#10B981' : '#22C55E';
  const liveLabel = goldPrice.isFallback ? 'Çevrimdışı' : isSocket ? 'Anlık' : 'Canlı';

  const gram    = goldPrice.items.find((i) => i.key === 'gold');
  const ayar22  = goldPrice.items.find((i) => i.key === '22ayar');
  const ayar18  = goldPrice.items.find((i) => i.key === '18ayar');
  const usd     = goldPrice.items.find((i) => i.key === 'usd');

  return (
    <Animated.View entering={FadeInUp.duration(500).delay(140)} style={styles.pricesSection}>
      {/* Bölüm başlığı */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Piyasa Fiyatları</Text>
        <View style={[styles.liveBadge, { backgroundColor: liveColor + '14', borderColor: liveColor + '30' }]}>
          <PulseDot color={liveColor} />
          <Text style={[styles.liveBadgeText, { color: liveColor }]}>{liveLabel}</Text>
        </View>
      </View>

      {/* Has Altın — tam genişlik */}
      <PriceCard
        wide
        label="Has Altın"
        sublabel="Gram / TL"
        sell={gram?.sell ?? 0}
        buy={gram?.buy ?? 0}
        change={gram?.change ?? '—'}
        changeNum={gram?.changeNum ?? 0}
        color="#C9963B"
        colors={colors}
        isDark={isDark}
        leadingIcon="diamond-outline"
      />

      {/* 22 Ayar + USD/TRY — yan yana */}
      <View style={styles.priceRow}>
        <PriceCard
          label="22 Ayar"
          sublabel="Gram / TL"
          sell={ayar22?.sell ?? 0}
          buy={ayar22?.buy ?? 0}
          change={ayar22?.change ?? '—'}
          changeNum={ayar22?.changeNum ?? 0}
          color="#E2A84B"
          colors={colors}
          isDark={isDark}
          leadingIcon="sparkles-outline"
        />
        {usd && usd.sell > 0 ? (
          <PriceCard
            label="USD/TRY"
            sublabel="Dolar Kuru"
            sell={usd.sell}
            buy={usd.buy}
            change={usd.change}
            changeNum={usd.changeNum}
            color="#38BDF8"
            colors={colors}
            isDark={isDark}
            decimals={2}
            leadingIcon="logo-usd"
          />
        ) : null}
      </View>

    </Animated.View>
  );
}

/* ─── Kategori verisi ─── */
const CAT_ITEMS = [
  { key: 'yuzuk',   label: 'Yüzük',   color: '#C9963B', bg: '#FEF3E2' },
  { key: 'kolye',   label: 'Kolye',   color: '#7C6CF5', bg: '#F3F1FF' },
  { key: 'bilezik', label: 'Bilezik', color: '#10B981', bg: '#ECFDF5' },
  { key: 'kupe',    label: 'Küpe',    color: '#F59E0B', bg: '#FFFBEB' },
  { key: 'set',     label: 'Set',     color: '#EF4444', bg: '#FEF2F2' },
  { key: 'tasli',   label: 'Taşlı',  color: '#38BDF8', bg: '#F0F9FF' },
] as { key: string; label: string; color: string; bg: string }[];

/* ─── Tek kategori chipi (harf monogram) ─── */
function CatChip({ item, colors, isDark, onPress }: {
  item: typeof CAT_ITEMS[number];
  colors: ThemeColors;
  isDark: boolean;
  onPress: () => void;
}) {
  const initial = item.label.charAt(0);
  const wrapBg = isDark ? item.color + '22' : item.bg;
  const letterColor = item.color;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.82} style={styles.catChip}>
      <View style={[styles.catLetterWrap, { backgroundColor: wrapBg, borderColor: item.color + (isDark ? '35' : '28') }]}>
        <Text style={[styles.catLetter, { color: letterColor }]}>{initial}</Text>
      </View>
      <Text style={[styles.catLabel, { color: colors.text }]}>{item.label}</Text>
    </TouchableOpacity>
  );
}

/* ─── Ürün fırsat kartı (katalog ürünü) ─── */
function ProductDealCard({ product, colors, isDark, onPress }: {
  product: Product;
  colors: ThemeColors;
  isDark: boolean;
  onPress: () => void;
}) {
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const thumbBg = isDark ? colors.primary + '18' : colors.primary + '08';
  const sub = product.variant?.name ?? product.category?.name ?? '';
  const favorited = isFavorite(product.id);

  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    lightImpact();
    toggleFavorite(product);
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={[styles.dealCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
    >
      <View style={[styles.dealThumb, { backgroundColor: thumbBg }]}>
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        ) : (
          <Ionicons name="diamond-outline" size={28} color={colors.primary + '99'} />
        )}
        {/* Favori butonu */}
        <TouchableOpacity
          onPress={handleFavoritePress}
          style={[styles.dealFavBtn, {
            backgroundColor: favorited ? '#EF4444' : colors.background + (isDark ? 'E6' : 'F0'),
            ...Platform.select({
              ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: favorited ? 0.3 : 0.15, shadowRadius: 4 },
              android: { elevation: favorited ? 3 : 2 },
            }),
          }]}
          activeOpacity={0.8}
        >
          <Ionicons
            name={favorited ? 'heart' : 'heart-outline'}
            size={14}
            color={favorited ? '#FFF' : colors.subtext}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.dealContent}>
        <Text style={[styles.dealName, { color: colors.text }]} numberOfLines={2}>{product.name}</Text>
        {sub ? <Text style={[styles.dealSub, { color: colors.subtext }]} numberOfLines={1}>{sub}</Text> : null}
        <Text style={[styles.dealSalePrice, { color: colors.primary }]}>
          {product.pricePerUnit > 0 ? `${product.pricePerUnit.toLocaleString('tr-TR')}₺` : '—'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/* ─── Keşfet bölümü ─── */
function CollectionsSection({ colors, isDark, router, dealProducts, dealLoading }: {
  colors: ThemeColors;
  isDark: boolean;
  router: ReturnType<typeof useRouter>;
  dealProducts: Product[];
  dealLoading: boolean;
}) {
  return (
    <View style={styles.collSection}>
      {/* Kategoriler */}
     

    </View>
  );
}

export default function DashboardScreen() {
  const { colors, isDark } = useTheme();
  const goldPrice = useGoldPrice();
  const router = useRouter();
  const { user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [bannerPage, setBannerPage] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const bannerRef = useRef<FlatList>(null);

  useEffect(() => {
    catalogService
      .getFeaturedProducts()
      .then((res) => setFeaturedProducts(res.data))
      .finally(() => setFeaturedLoading(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = (bannerPage + 1) % BANNERS.length;
      bannerRef.current?.scrollToIndex({ index: next, animated: true });
      setBannerPage(next);
    }, 4000);
    return () => clearInterval(interval);
  }, [bannerPage]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    goldPrice.refresh().catch(() => {}).finally(() => setRefreshing(false));
  }, [goldPrice]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Günaydın';
    if (h < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
        {/* ── Top Bar ── */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.topBar}>
          <View>
            <Text style={[styles.greeting, { color: colors.subtext }]}>{greeting()},</Text>
            <Text style={[styles.userName, { color: colors.text }]}>{user?.name?.split(' ')[0] || 'Kuyumcu'} 👋</Text>
          </View>
          <View style={styles.topBarActions}>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              onPress={() => { lightImpact(); router.push('/notifications'); }}
            >
              <Ionicons name="notifications-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={styles.topSpacer} />

        {/* ── Keşfet: Kategoriler + Günün Fırsatları (banner'ın üstünde) ── */}
        <CollectionsSection
          colors={colors}
          isDark={isDark}
          router={router}
          dealProducts={featuredProducts}
          dealLoading={featuredLoading}
        />

        {/* ── Promosyon Banner Carousel ── */}
        <Animated.View entering={FadeInDown.duration(500).delay(80)} style={styles.bannerWrap}>
          <FlatList
            ref={bannerRef}
            data={BANNERS}
            keyExtractor={(b) => b.key}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={BANNER_W + 12}
            decelerationRate="fast"
            contentContainerStyle={{ gap: 12 }}
            onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
              const page = Math.round(e.nativeEvent.contentOffset.x / (BANNER_W + 12));
              if (page !== bannerPage) { setBannerPage(page); }
            }}
            scrollEventThrottle={16}
            renderItem={({ item }) => <PromoBanner item={item} />}
          />
          <View style={styles.dotsRow}>
            {BANNERS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === bannerPage ? colors.primary : colors.subtext + '30',
                    width: i === bannerPage ? 20 : 6,
                  },
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* ── Canlı Piyasa Fiyatları ── */}
        <LivePricesSection colors={colors} isDark={isDark} />

     

        {/* ── Ürün Slider ── */}
        <ProductOfWeekSlider products={featuredProducts} isLoading={featuredLoading} />

      </Animated.ScrollView>
    </SafeAreaView>
  );
}

/* ═══ Styles ═══ */
const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: PAD, paddingBottom: TAB_H },

  /* Top bar */
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14, paddingBottom: 12,
  },
  greeting: { fontSize: 12, fontWeight: '500' },
  userName: { fontSize: 20, fontWeight: '800', marginTop: 1 },
  topBarActions: { flexDirection: 'row', gap: 10 },
  iconBtn: {
    width: 42, height: 42, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  topSpacer: { height: 19 },

  /* Banner */
  bannerWrap: { marginBottom: 20 },
  banner: {
    width: BANNER_W, height: BANNER_H,
    borderRadius: 22, overflow: 'hidden',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 18,
    justifyContent: 'space-between',
  },
  bannerTop: { flexDirection: 'row', alignItems: 'flex-start' },
  bannerBottom: { gap: 4 },
  bannerCircle1: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    top: -50, right: -50,
  },
  bannerCircle2: {
    position: 'absolute', width: 110, height: 110, borderRadius: 55,
    top: 30, right: 70,
  },
  bannerBadge: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 999, borderWidth: 1,
  },
  bannerBadgeText: { fontSize: 11, fontWeight: '700' },
  bannerTitle: { fontSize: 22, fontWeight: '900', lineHeight: 28, letterSpacing: -0.4 },
  bannerSubtitle: { fontSize: 13, fontWeight: '600' },
  bannerBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 999, marginTop: 6,
  },
  bannerBtnText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  bannerIconWrap: {
    position: 'absolute', top: 16, right: 20,
    width: 64, height: 64, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  dotsRow: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 5, marginTop: 10,
  },
  dot: { height: 6, borderRadius: 3 },

  /* Fiyat bölümü */
  pricesSection: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 999, borderWidth: 1,
  },
  liveBadgeText: { fontSize: 12, fontWeight: '700' },

  /* Pulse dot */
  pulseWrap: { width: 14, height: 14, alignItems: 'center', justifyContent: 'center' },
  pulseRing: {
    position: 'absolute', width: 14, height: 14,
    borderRadius: 7, borderWidth: 1.5,
  },
  pulseDot: { width: 6, height: 6, borderRadius: 3 },

  /* Fiyat kartı */
  priceRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  priceCard: {
    width: CARD_HALF,
    borderRadius: 20, borderWidth: 1,
    padding: 16, overflow: 'hidden',
    marginTop: 0,
    gap: 2,
  },
  priceCardWide: { width: BANNER_W },
  priceCardAccent: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 4,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
  },
  priceCardTop: {
    marginBottom: 10, marginTop: 6,
  },
  priceCardLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  priceCardIcon: {
    width: 26,
    height: 26,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  priceCardLabel: { fontSize: 14, fontWeight: '800', letterSpacing: -0.2 },
  priceCardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    marginTop: 2,
  },
  priceCardSublabel: { fontSize: 11, fontWeight: '500', flex: 1 },
  priceCardPrice: { fontSize: 28, fontWeight: '900', letterSpacing: -0.8 },
  priceCardCurrency: { fontSize: 18, fontWeight: '700' },
  priceCardBuy: { fontSize: 11, fontWeight: '500', marginTop: 3 },
  priceCardBar: { height: 3, borderRadius: 999, marginTop: 12, width: '40%' },
  changePill: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    paddingHorizontal: 6, paddingVertical: 3, borderRadius: 999,
    flexShrink: 0,
  },
  changeText: { fontSize: 10, fontWeight: '700' },

  /* Keşfet bölümü */
  collSection: { marginBottom: 20 },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllText: { fontSize: 13, fontWeight: '700' },
  sectionSub: { fontSize: 11, fontWeight: '500', marginTop: 1 },

  /* Kategoriler */
  catRow: { gap: 12, paddingBottom: 4, paddingTop: 10 },
  catChip: { alignItems: 'center', gap: 8, width: 68 },
  catLetterWrap: {
    width: 66, height: 66, borderRadius: 96, padding: 4, alignSelf: 'center',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5,
  },
  catLetter: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  catLabel: { fontSize: 12, fontWeight: '700', textAlign: 'center' },

  /* Deal kartları */
  dealsRow: { gap: 12, paddingBottom: 4, paddingTop: 10 },
  dealCard: {
    width: 148, borderRadius: 16, borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  dealThumb: {
    height: 130, alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  dealFavBtn: {
    position: 'absolute', top: 8, right: 8,
    width: 28, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },
  dealContent: { padding: 10, gap: 3 },
  dealName: { fontSize: 13, fontWeight: '700', lineHeight: 17 },
  dealSub: { fontSize: 11, fontWeight: '500' },
  dealSalePrice: { fontSize: 15, fontWeight: '900', marginTop: 2 },
  dealsLoader: {
    marginTop: 10, paddingVertical: 24, borderRadius: 16, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  dealsLoaderText: { fontSize: 13, fontWeight: '600' },
  dealsEmpty: {
    marginTop: 10, paddingVertical: 24, paddingHorizontal: 20, borderRadius: 16, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  dealsEmptyText: { fontSize: 13, fontWeight: '600' },
});
