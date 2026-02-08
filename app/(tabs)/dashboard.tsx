import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, RefreshControl, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Path, Line, Text as SvgText, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '../../src/Constants/Colors';
import { Spacing } from '../../src/Constants/Spacing';
import { ScreenHeader } from '../../src/Shared/Header';
import { StatCardSkeleton, ChartSkeleton } from '../../src/Components/Ui/Skeleton';
import { ErrorState } from '../../src/Components/Ui/ErrorState';
import { dashboardService, DashboardSummary } from '../../src/Api/dashboardService';
import { goldPriceService } from '../../src/Api/goldPriceService';
import { useResponsive } from '../../src/Hooks/UseResponsive';
import Ionicons from '@expo/vector-icons/Ionicons';

/** Grafik noktaları weeklyGramData.profitGram üzerinden hesaplanacak */

export default function DashboardScreen() {
  const { calculateFontSize, calculateHeight } = useResponsive();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [goldPrice, setGoldPrice] = useState<number | null>(null);
  const [goldPriceIsFallback, setGoldPriceIsFallback] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const response = await dashboardService.getSummary();
      setData(response);
    } catch (err: any) {
      console.log('Dashboard fetch error:', err);
      setError(err.message || 'Veriler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchGoldPrice = useCallback(async () => {
    const result = await goldPriceService.getGramGoldSellPrice();
    setGoldPrice(result.price);
    setGoldPriceIsFallback(result.isFallback);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchGoldPrice();
  }, [fetchGoldPrice]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
    fetchGoldPrice();
  }, [fetchData, fetchGoldPrice]);

  const statsCards = data ? [
    { title: 'Toplam Satış (gr)', value: data.totalSalesGram, icon: 'trending-up-outline', color: Colors.success },
    { title: 'Toplam Alış (gr)', value: data.totalPurchaseGram, icon: 'cart-outline', color: Colors.primary },
    { title: 'Toplam Kar (gr)', value: data.totalProfitGram, icon: 'wallet-outline', color: Colors.primary },
    { title: 'Toplam İşçilik (gr)', value: data.totalLaborGram, icon: 'hammer-outline', color: Colors.primary },
  ] : [];

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 80;
  const chartHeight = 220;
  const chartPadding = { top: 40, right: 20, bottom: 30, left: 20 };
  const graphWidth = chartWidth - chartPadding.left - chartPadding.right;
  const graphHeight = chartHeight - chartPadding.top - chartPadding.bottom;

  const weeklyData = data?.weeklyGramData ?? [];
  const chartValues = weeklyData.map((d) => d.profitGram);
  const minChartVal = Math.min(...chartValues, 0);
  const maxChartVal = Math.max(...chartValues, 1);
  const range = maxChartVal - minChartVal || 1;
  const svgPoints = useMemo(() => {
    return weeklyData.map((d, i) => ({
      x: chartPadding.left + (i / (weeklyData.length - 1 || 1)) * graphWidth,
      y: chartPadding.top + graphHeight - ((d.profitGram - minChartVal) / range) * graphHeight,
      value: d.profitGram,
      label: d.label,
    }));
  }, [graphWidth, graphHeight, weeklyData, minChartVal, maxChartVal, range]);

  const findClosestPoint = useCallback((touchX: number) => {
    if (svgPoints.length === 0) return 0;
    let closestIndex = 0;
    let minDistance = Infinity;
    svgPoints.forEach((point, index) => {
      const distance = Math.abs(point.x - touchX);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });
    return closestIndex;
  }, [svgPoints]);

  const updateSelection = useCallback(
    (x: number) => {
      setSelectedIndex(findClosestPoint(x));
    },
    [findClosestPoint]
  );

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .runOnJS(true)
        .onStart((e) => updateSelection(e.x))
        .onUpdate((e) => updateSelection(e.x)),
    [updateSelection]
  );

  const renderWeeklyChart = () => {
    if (svgPoints.length === 0) return null;
    const pathD = svgPoints.reduce((acc, point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      const prev = svgPoints[index - 1];
      const cpX1 = prev.x + (point.x - prev.x) / 3;
      const cpX2 = prev.x + (2 * (point.x - prev.x)) / 3;
      return `${acc} C ${cpX1} ${prev.y}, ${cpX2} ${point.y}, ${point.x} ${point.y}`;
    }, '');

    const safeIndex = Math.min(selectedIndex, svgPoints.length - 1);
    const selectedPoint = svgPoints[safeIndex];

    return (
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View>
            <Text style={styles.chartSubtitle}>Haftalık özet</Text>
            <Text style={styles.chartMainTitle}>Kar (gr)</Text>
          </View>
          <View style={styles.chartValueBadge}>
            <Text style={styles.chartValue}>{selectedPoint.value.toLocaleString('tr-TR')} gr</Text>
          </View>
        </View>

        <GestureDetector gesture={panGesture}>
          <View
            style={[styles.chartTouchArea, { width: chartWidth, height: chartHeight }]}
            collapsable={false}
          >
            <Svg width={chartWidth} height={chartHeight}>
            <Defs>
              <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={Colors.primary} stopOpacity="0.5" />
                <Stop offset="1" stopColor={Colors.primary} stopOpacity="0" />
              </LinearGradient>
            </Defs>

            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
               const x = chartPadding.left + ratio * graphWidth;
               return (
                 <Line
                   key={i}
                   x1={x}
                   y1={chartPadding.top}
                   x2={x}
                   y2={chartPadding.top + graphHeight}
                   stroke={Colors.border}
                   strokeWidth={1}
                   strokeDasharray="5, 5"
                 />
               );
            })}
            
            <Path
              d={pathD}
              stroke={Colors.primary}
              strokeWidth={3}
              fill="none"
            />

            <Path
              d={`${pathD} L ${svgPoints[svgPoints.length-1].x} ${chartPadding.top + graphHeight} L ${svgPoints[0].x} ${chartPadding.top + graphHeight} Z`}
              fill="url(#gradient)"
            />

            <Line
              x1={selectedPoint.x}
              y1={chartPadding.top}
              x2={selectedPoint.x}
              y2={chartPadding.top + graphHeight}
              stroke={Colors.text}
              strokeWidth={1}
              strokeDasharray="5, 5"
              opacity={0.5}
            />
            
            <Circle
              cx={selectedPoint.x}
              cy={selectedPoint.y}
              r={6}
              fill={Colors.background}
              stroke={Colors.text}
              strokeWidth={3}
            />

            <SvgText
              x={selectedPoint.x}
              y={selectedPoint.y - 15}
              fill={Colors.text}
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
            >
              {selectedPoint.value}
            </SvgText>

            {svgPoints.map((p, i) => (
              <SvgText
                key={i}
                x={p.x}
                y={chartHeight - 10}
                fill={i === safeIndex ? Colors.primary : Colors.subtext}
                fontSize="10"
                textAnchor="middle"
                fontWeight={i === safeIndex ? '600' : '400'}
              >
                {p.label}
              </SvgText>
            ))}

            </Svg>
          </View>
        </GestureDetector>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <ScreenHeader title="Özet" subtitle="Kuyumcu gram özeti" />
          <View style={styles.statsGrid}>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </View>
          <ChartSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ErrorState message={error} onRetry={fetchData} />
      </SafeAreaView>
    );
  }

  const welcomeDate = new Date().toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        <ScreenHeader title="Özet" subtitle="Gram bazlı satış, alış ve kar" />

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroAccent} />
          <View style={styles.heroIconWrap}>
            <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
          </View>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroLabel}>Bugünkü özet</Text>
            <Text style={styles.heroDate}>{welcomeDate}</Text>
          </View>
          <View style={styles.heroGoldWrap}>
            <Ionicons name="diamond-outline" size={16} color={Colors.primary} />
            <Text style={styles.heroGoldLabel}>Has (gr)</Text>
            <Text style={styles.heroGoldValue}>
              {goldPrice != null
                ? `${goldPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺`
                : '—'}
            </Text>
            {goldPriceIsFallback && (
              <Text style={styles.heroGoldFallbackHint}>güncel değil</Text>
            )}
          </View>
        </View>

        {/* Gram özeti başlığı */}
        <Text style={styles.sectionTitle}>Gram özeti</Text>
        <View style={styles.statsGrid}>
          {statsCards.map((stat, index) => (
            <View key={index} style={styles.statCardWrapper}>
              <View
                style={[
                  styles.statCard,
                  { height: calculateHeight(128) },
                  { borderLeftColor: stat.color },
                ]}
              >
                <View style={[styles.statIconWrap, { backgroundColor: stat.color + '22' }]}>
                  <Ionicons name={stat.icon as any} size={22} color={stat.color} />
                </View>
                <Text style={[styles.statValue, { fontSize: calculateFontSize(28) }]} numberOfLines={1}>
                  {stat.value}
                </Text>
                <Text style={[styles.statLabel, { fontSize: calculateFontSize(11) }]} numberOfLines={2}>
                  {stat.title}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Haftalık kar grafiği */}
        <View style={styles.chartBlock}>
          <Text style={styles.sectionTitle}>Haftalık kar</Text>
          <View style={styles.chartSection}>
            {renderWeeklyChart()}
            <Text style={styles.chartHint}>Grafiği sola-sağa kaydırarak günlük değeri inceleyin</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  android: { elevation: 4 },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.screenPadding,
    paddingBottom: 48,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingLeft: Spacing.lg + 4,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: Colors.card,
    borderRadius: Spacing.radiusLg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heroAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: Spacing.radiusLg,
    borderBottomLeftRadius: Spacing.radiusLg,
  },
  heroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + '18',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  heroTextWrap: {
    flex: 1,
  },
  heroLabel: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  heroDate: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  heroGoldWrap: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: Spacing.md,
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
  },
  heroGoldLabel: {
    color: Colors.subtext,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  heroGoldValue: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  heroGoldFallbackHint: {
    color: Colors.subtext,
    fontSize: 9,
    marginTop: 2,
    fontStyle: 'italic',
  },
  sectionTitle: {
    color: Colors.subtext,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCardWrapper: {
    width: '48%',
    marginBottom: Spacing.md,
  },
  statCard: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.radiusLg,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    ...cardShadow,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 999,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  statValue: {
    color: Colors.text,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statLabel: {
    color: Colors.subtext,
    fontWeight: '500',
    lineHeight: 16,
  },
  chartBlock: {
    marginTop: Spacing.xxl,
  },
  chartSection: {
    marginTop: Spacing.sm,
  },
  chartHint: {
    color: Colors.subtext,
    fontSize: 11,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.radiusXl,
    padding: Spacing.xl,
    paddingBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '22',
    position: 'relative',
    overflow: 'hidden',
    ...cardShadow,
  },
  chartTouchArea: {
    zIndex: 1,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
    marginTop: Spacing.xs,
  },
  chartSubtitle: {
    color: Colors.subtext,
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  chartMainTitle: {
    color: Colors.primary,
    fontSize: 17,
    fontWeight: '700',
  },
  chartValueBadge: {
    backgroundColor: Colors.primary + '18',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.radiusMd,
  },
  chartValue: {
    color: Colors.catalogGoldLight,
    fontSize: 18,
    fontWeight: '700',
  },
  chartContainer: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.radiusLg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  noChartData: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.radiusLg,
    padding: 40,
    alignItems: 'center',
  },
  noChartText: {
    color: Colors.subtext,
    fontSize: 14,
  },
  weeklyCard: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.radiusLg,
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  weeklyValue: {
    color: Colors.primary,
    fontWeight: '800',
  },
  weeklyLabel: {
    color: Colors.subtext,
    marginTop: 4,
  },
  machineStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Spacing.radiusMd,
    padding: Spacing.lg,
    marginHorizontal: Spacing.xs,
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  statusValue: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  statusLabel: {
    color: Colors.subtext,
    fontSize: 12,
    marginTop: 4,
  },
});
