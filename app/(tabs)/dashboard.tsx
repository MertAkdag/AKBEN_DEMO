import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Platform,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeInDown,
} from 'react-native-reanimated';
import Svg, {
  Path,
  Line,
  Text as SvgText,
  Circle,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { ScreenHeader } from '../../src/Shared/Header';
import { StatCardSkeleton, ChartSkeleton } from '../../src/Components/Ui/Skeleton';
import { ErrorState } from '../../src/Components/Ui/ErrorState';
import { dashboardService, DashboardSummary } from '../../src/Api/dashboardService';
import { FinanceItem } from '../../src/Api/goldPriceService';
import { catalogService } from '../../src/Api/catalogService';
import { ProductOfWeekSlider } from '../../src/Components/Cards/ProductOfWeekSlider';
import type { Product } from '../../src/Types/catalog';
import { useGoldPrice } from '../../src/Context/GoldPriceContext';
import { useResponsive } from '../../src/Hooks/UseResponsive';
import { useTheme } from '../../src/Context/ThemeContext';
import { lightImpact } from '../../src/Utils/haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ThemeColors } from '../../src/Constants/Theme';

/* ─── Animated SVG ─── */
const AnimCircle = Animated.createAnimatedComponent(Circle);
const AnimLine = Animated.createAnimatedComponent(Line);

/* ─── Layout ─── */
const SW = Dimensions.get('window').width;
const PAD = 20;
const CPAD = 20;
const CHART_W = SW - PAD * 2 - CPAD * 2;
const CHART_H = 200;
const CP = { top: 24, right: 8, bottom: 28, left: 8 };
const GW = CHART_W - CP.left - CP.right;
const GH = CHART_H - CP.top - CP.bottom;
const TAB_H = 100;
const SPRING = { damping: 20, stiffness: 180, mass: 0.7 };

/* Finans ticker boyutları */
const TICKER_GAP = 10;
const TICKER_CARD_W = SW - PAD * 2;

/* ─── Glass Card wrapper ─── */
function GlassCard({ children, style, delay = 0, colors, isDark }: {
  children: React.ReactNode; style?: any; delay?: number; colors: ThemeColors; isDark: boolean;
}) {
  return (
    <Animated.View entering={FadeInDown.duration(500).delay(delay).springify()} style={[
      styles.glass,
      {
        backgroundColor: colors.card,
        borderColor: colors.cardBorder,
        ...Platform.select({
          ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDark ? 0.18 : 0.06, shadowRadius: 12 },
          android: { elevation: 6 },
        }),
      },
      style,
    ]}>
      {children}
    </Animated.View>
  );
}

/* ─── Finans Ticker Card ─── */
function FinanceTickerCard({ item, colors, isDark, isFallback, source }: {
  item: FinanceItem; colors: ThemeColors; isDark: boolean; isFallback: boolean; source: string;
}) {
  const isUp = item.changeNum > 0;
  const isDown = item.changeNum < 0;
  const changeColor = isUp ? colors.success : isDown ? colors.error : colors.subtext;
  const changeIcon = isUp ? 'trending-up' : isDown ? 'trending-down' : 'remove-outline';
  const isSocket = source === 'socket';
  const liveColor = isFallback ? colors.warning : isSocket ? '#10B981' : colors.success;
  const liveLabel = isFallback ? 'Çevrimdışı' : isSocket ? 'Anlık' : 'Canlı';

  return (
    <View style={[
      styles.tickerCard,
      {
        backgroundColor: colors.card,
        borderColor: colors.cardBorder,
        width: TICKER_CARD_W,
        ...Platform.select({
          ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDark ? 0.18 : 0.06, shadowRadius: 12 },
          android: { elevation: 6 },
        }),
      },
    ]}>
      {/* Üst satır: ikon + isim + canlı badge */}
      <View style={styles.tickerTop}>
        <View style={[styles.tickerIcon, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '20' }]}>
          <Ionicons name={item.icon as any} size={20} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.tickerLabel, { color: colors.text }]}>{item.label}</Text>
          <Text style={[styles.tickerSub, { color: colors.subtext }]}>{item.subtitle}</Text>
        </View>
        <View style={[styles.liveBadge, { backgroundColor: liveColor + '15' }]}>
          <View style={[styles.liveDot, { backgroundColor: liveColor }]} />
          <Text style={[styles.liveText, { color: liveColor }]}>{liveLabel}</Text>
        </View>
      </View>

      {/* Alt satır: fiyat + değişim */}
      <View style={styles.tickerBottom}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.tickerPrice, { color: colors.text }]}>
            {item.sell > 0
              ? `${item.unit}${item.sell.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : '—'}
          </Text>
          {item.buy > 0 && (
            <Text style={[styles.tickerBuy, { color: colors.subtext }]}>
              Alış: {item.unit}{item.buy.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          )}
        </View>
        {!isFallback && (
          <View style={[styles.changePill, { backgroundColor: changeColor + '12' }]}>
            <Ionicons name={changeIcon as any} size={14} color={changeColor} />
            <Text style={[styles.changeText, { color: changeColor }]}>{item.change}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

/* ─── Stat card ─── */
function StatItem({ label, value, icon, color, idx, colors, isDark }: {
  label: string; value: string | number; icon: string; color: string; idx: number;
  colors: ThemeColors; isDark: boolean;
}) {
  return (
    <GlassCard style={styles.statCard} delay={idx * 60} colors={colors} isDark={isDark}>
      <View style={[styles.statIconBox, { backgroundColor: color + '12' }]}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <Text style={[styles.statVal, { color: colors.text }]} numberOfLines={1}>
        {typeof value === 'number' ? value.toLocaleString('tr-TR') : value}
      </Text>
      <Text style={[styles.statLabel, { color: colors.subtext }]}>{label}</Text>
      <View style={[styles.cornerDot, { backgroundColor: color }]} />
    </GlassCard>
  );
}

export default function DashboardScreen() {
  const { calculateFontSize } = useResponsive();
  const { colors, isDark } = useTheme();
  const goldPrice = useGoldPrice();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selIdx, setSelIdx] = useState(0);
  const [tickerPage, setTickerPage] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  /* Finans verileri artık GoldPriceContext'ten geliyor */
  const financeItems = goldPrice.items;
  const financeFallback = goldPrice.isFallback;

  const fetchData = useCallback(async () => {
    try { setError(null); setData(await dashboardService.getSummary()); }
    catch (e: any) { setError(e.message || 'Veriler yüklenemedi'); }
    finally { setIsLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    catalogService.getFeaturedProducts().then((res) => {
      setFeaturedProducts(res.data);
    }).finally(() => setFeaturedLoading(false));
  }, []);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
    goldPrice.refresh();
  }, [fetchData, goldPrice.refresh]);

  const stats = data ? [
    { label: 'Satış', val: data.totalSalesGram, icon: 'arrow-up-circle', color: colors.success },
    { label: 'Alış', val: data.totalPurchaseGram, icon: 'arrow-down-circle', color: '#60A5FA' },
    { label: 'Kar', val: data.totalProfitGram, icon: 'trending-up', color: '#A78BFA' },
    { label: 'İşçilik', val: data.totalLaborGram, icon: 'construct', color: colors.warning },
  ] : [];

  const weekly = data?.weeklyGramData ?? [];
  const vals = weekly.map(d => d.profitGram);
  const mn = Math.min(...vals, 0), mx = Math.max(...vals, 1), rng = mx - mn || 1;

  const pts = useMemo(() =>
    weekly.map((d, i) => ({
      x: CP.left + (i / (weekly.length - 1 || 1)) * GW,
      y: CP.top + GH - ((d.profitGram - mn) / rng) * GH,
      v: d.profitGram, l: d.label,
    })), [weekly, mn, rng]);

  /* ─── Animated dot ─── */
  const dotX = useSharedValue(pts[0]?.x ?? 0);
  const dotY = useSharedValue(pts[0]?.y ?? 0);
  const valOp = useSharedValue(1);

  useEffect(() => {
    if (!pts.length) return;
    const si = Math.min(selIdx, pts.length - 1);
    dotX.value = withSpring(pts[si].x, SPRING);
    dotY.value = withSpring(pts[si].y, SPRING);
    valOp.value = withTiming(0.3, { duration: 60 }, () => {
      valOp.value = withTiming(1, { duration: 200 });
    });
  }, [selIdx, pts]);

  const glowP = useAnimatedProps(() => ({ cx: dotX.value, cy: dotY.value }));
  const dotOP = useAnimatedProps(() => ({ cx: dotX.value, cy: dotY.value }));
  const dotIP = useAnimatedProps(() => ({ cx: dotX.value, cy: dotY.value }));
  const vLP = useAnimatedProps(() => ({ x1: dotX.value, x2: dotX.value }));
  const valA = useAnimatedStyle(() => ({ opacity: valOp.value }));

  const closest = useCallback((tx: number) => {
    let idx = 0, best = Infinity;
    pts.forEach((p, i) => { const d = Math.abs(p.x - tx); if (d < best) { best = d; idx = i; } });
    return idx;
  }, [pts]);

  const prevIdx = useSharedValue(0);
  const pan = useMemo(() =>
    Gesture.Pan().minDistance(0).runOnJS(true)
      .onStart(e => { const i = closest(e.x); if (i !== selIdx) lightImpact(); setSelIdx(i); })
      .onUpdate(e => { const i = closest(e.x); if (i !== selIdx) lightImpact(); setSelIdx(i); }),
    [closest, selIdx]);

  /* ─── Chart ─── */
  const renderChart = () => {
    if (!pts.length) return null;
    const path = pts.reduce((a, p, i) => {
      if (!i) return `M ${p.x} ${p.y}`;
      const pr = pts[i - 1];
      return `${a} C ${pr.x + (p.x - pr.x) * 0.4} ${pr.y}, ${pr.x + (p.x - pr.x) * 0.6} ${p.y}, ${p.x} ${p.y}`;
    }, '');
    const si = Math.min(selIdx, pts.length - 1);
    const sp = pts[si];

    return (
      <GlassCard style={{ padding: CPAD }} delay={280} colors={colors} isDark={isDark}>
        <View style={styles.chartHead}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.chartSub, { color: colors.subtext }]}>Haftalık Kar</Text>
            <Animated.View style={[{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }, valA]}>
              <Text style={[styles.chartBig, { color: colors.text }]}>
                {sp.v.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <Text style={[styles.chartUnit, { color: colors.subtext }]}>gr</Text>
            </Animated.View>
          </View>
          <Animated.View style={[styles.dayPill, { backgroundColor: colors.primary + '14', borderColor: colors.primary + '20' }, valA]}>
            <Text style={[styles.dayPillText, { color: colors.primary }]}>{sp.l}</Text>
          </Animated.View>
        </View>

        <GestureDetector gesture={pan}>
          <View style={{ width: CHART_W, height: CHART_H }} collapsable={false}>
            <Svg width={CHART_W} height={CHART_H}>
              <Defs>
                <LinearGradient id="af" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={colors.primary} stopOpacity="0.2" />
                  <Stop offset="0.6" stopColor={colors.primary} stopOpacity="0.03" />
                  <Stop offset="1" stopColor={colors.primary} stopOpacity="0" />
                </LinearGradient>
                <LinearGradient id="lg" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={colors.primary} stopOpacity="0.35" />
                  <Stop offset="0.4" stopColor={colors.primary} stopOpacity="1" />
                  <Stop offset="0.6" stopColor={colors.primary} stopOpacity="1" />
                  <Stop offset="1" stopColor={colors.primary} stopOpacity="0.35" />
                </LinearGradient>
              </Defs>
              {[0.25, 0.5, 0.75].map((r, i) => (
                <Line key={i} x1={CP.left} y1={CP.top + r * GH} x2={CP.left + GW} y2={CP.top + r * GH}
                  stroke={colors.text} strokeWidth={0.5} opacity={0.04} />
              ))}
              <Path d={`${path} L ${pts[pts.length - 1].x} ${CP.top + GH} L ${pts[0].x} ${CP.top + GH} Z`} fill="url(#af)" />
              <Path d={path} stroke="url(#lg)" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <AnimLine animatedProps={vLP} y1={CP.top} y2={CP.top + GH} stroke={colors.primary} strokeWidth={0.6} opacity={0.12} strokeDasharray="3,3" />
              <AnimCircle animatedProps={glowP} r={18} fill={colors.primary} opacity={0.06} />
              <AnimCircle animatedProps={glowP} r={10} fill={colors.primary} opacity={0.1} />
              <AnimCircle animatedProps={dotOP} r={5.5} fill={colors.primary} />
              <AnimCircle animatedProps={dotIP} r={2.5} fill={colors.card} />
              {pts.map((p, i) => (
                <SvgText key={i} x={p.x} y={CHART_H - 6}
                  fill={i === si ? colors.primary : colors.subtext}
                  fontSize="10" textAnchor="middle" fontWeight={i === si ? '700' : '400'}
                  opacity={i === si ? 1 : 0.4}>
                  {p.l}
                </SvgText>
              ))}
            </Svg>
          </View>
        </GestureDetector>
      </GlassCard>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <ScreenHeader title="Özet" subtitle="Yükleniyor..." />
          <View style={styles.statsGrid}>{[1, 2, 3, 4].map(k => <StatCardSkeleton key={k} />)}</View>
          <ChartSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }
  if (error) return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ErrorState message={error} onRetry={fetchData} />
    </SafeAreaView>
  );

  const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}>
        <ScreenHeader title="Özet" subtitle={today} />

        {/* Finans Ticker */}
        {financeItems.length > 0 && (
          <Animated.View entering={FadeInDown.duration(500).delay(80).springify()} style={{ marginBottom: 16 }}>
            <FlatList
              data={financeItems}
              keyExtractor={(item) => item.key}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToInterval={TICKER_CARD_W + TICKER_GAP}
              decelerationRate="fast"
              contentContainerStyle={{ gap: TICKER_GAP }}
              onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
                const page = Math.round(e.nativeEvent.contentOffset.x / (TICKER_CARD_W + TICKER_GAP));
                if (page !== tickerPage) { setTickerPage(page); lightImpact(); }
              }}
              scrollEventThrottle={16}
              renderItem={({ item }) => (
                <FinanceTickerCard item={item} colors={colors} isDark={isDark} isFallback={financeFallback} source={goldPrice.source} />
              )}
            />
            {/* Sayfa göstergesi */}
            <View style={styles.dotsRow}>
              {financeItems.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: i === tickerPage ? colors.primary : colors.subtext + '30',
                      width: i === tickerPage ? 18 : 6,
                    },
                  ]}
                />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Haftanın Ürünü kampanya slider */}
        <ProductOfWeekSlider products={featuredProducts} isLoading={featuredLoading} />

        {/* Stats */}
        <View style={styles.statsGrid}>
          {stats.map((c, i) => (
            <StatItem key={i} idx={i} label={c.label} value={c.val} icon={c.icon} color={c.color} colors={colors} isDark={isDark} />
          ))}
        </View>

        {/* Chart */}
        {renderChart()}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ═══ Styles ═══ */
const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: PAD, paddingBottom: TAB_H },

  glass: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },

  /* Finans ticker */
  tickerCard: {
    borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, padding: 16, gap: 14,
  },
  tickerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tickerIcon: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  tickerLabel: { fontSize: 16, fontWeight: '700' },
  tickerSub: { fontSize: 12, fontWeight: '500', marginTop: 1 },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  liveText: { fontSize: 11, fontWeight: '600' },
  tickerBottom: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  tickerPrice: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  tickerBuy: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  changePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12,
  },
  changeText: { fontSize: 13, fontWeight: '700' },
  dotsRow: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 5, marginTop: 10,
  },
  dot: { height: 6, borderRadius: 3 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1,
    minWidth: (SW - PAD * 2 - 10) / 2 - 6,
    paddingVertical: 18,
    paddingHorizontal: 14,
    gap: 8,
  },
  statIconBox: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  statVal: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { fontSize: 12, fontWeight: '500' },
  cornerDot: {
    position: 'absolute', top: 12, right: 12,
    width: 5, height: 5, borderRadius: 3, opacity: 0.35,
  },

  chartHead: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 12,
  },
  chartSub: { fontSize: 13, fontWeight: '500', marginBottom: 4 },
  chartBig: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  chartUnit: { fontSize: 14, fontWeight: '500' },
  dayPill: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12,
    borderWidth: 1,
  },
  dayPillText: { fontSize: 12, fontWeight: '700' },
});
