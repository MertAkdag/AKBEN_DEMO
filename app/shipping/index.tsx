import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Spacing } from '../../src/Constants/Spacing';
import { ScreenHeader } from '../../src/Shared/Header';
import { useTheme } from '../../src/Context/ThemeContext';
import { useOrdersStore } from '../../src/store/orders/ordersStore';
import { shippingService } from '../../src/Api/shippingService';
import type { ShippingInfo, ShippingFilter, ShippingStatus } from '../../src/Types/ecommerce-order';
import { lightImpact } from '../../src/Utils/haptics';

const TAB_BAR_HEIGHT = 100;

const FILTERS: { key: ShippingFilter; label: string }[] = [
  { key: 'ALL', label: 'Tümü' },
  { key: 'PREPARING', label: 'Hazırlanıyor' },
  { key: 'IN_TRANSIT', label: 'Yolda' },
  { key: 'OUT_FOR_DELIVERY', label: 'Dağıtımda' },
  { key: 'DELIVERED', label: 'Teslim Edildi' },
  { key: 'FAILED', label: 'Başarısız' },
];

export const getShippingStatusInfo = (status: ShippingStatus) => {
  switch (status) {
    case 'PREPARING':
      return { label: 'Hazırlanıyor', color: '#F59E0B', icon: 'cube-outline' as const };
    case 'PICKED_UP':
      return { label: 'Teslim Alındı', color: '#8B5CF6', icon: 'hand-left-outline' as const };
    case 'IN_TRANSIT':
      return { label: 'Yolda', color: '#3B82F6', icon: 'airplane-outline' as const };
    case 'OUT_FOR_DELIVERY':
      return { label: 'Dağıtımda', color: '#06B6D4', icon: 'bicycle-outline' as const };
    case 'DELIVERED':
      return { label: 'Teslim Edildi', color: '#10B981', icon: 'checkmark-circle' as const };
    case 'FAILED':
      return { label: 'Teslim Edilemedi', color: '#EF4444', icon: 'close-circle-outline' as const };
    case 'RETURNED':
      return { label: 'İade Edildi', color: '#6B7280', icon: 'return-down-back-outline' as const };
  }
};

// ─── Kart ────────────────────────────────────────────────────────────────────
function ShippingCard({
  shipping,
  colors,
  isDark,
  onPress,
}: {
  shipping: ShippingInfo;
  colors: any;
  isDark: boolean;
  onPress: () => void;
}) {
  const statusInfo = getShippingStatusInfo(shipping.currentStatus);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.15 : 0.06,
              shadowRadius: 8,
            },
            android: { elevation: 3 },
          }),
        },
      ]}
    >
      {/* Üst: taşıyıcı + durum */}
      <View style={styles.cardTop}>
        <View style={[styles.carrierIcon, { backgroundColor: statusInfo.color + '14' }]}>
          <Ionicons name="car-outline" size={22} color={statusInfo.color} />
        </View>
        <View style={styles.cardMeta}>
          <Text style={[styles.carrier, { color: colors.text }]}>{shipping.carrier}</Text>
          <Text style={[styles.trackingNo, { color: colors.subtext }]}>
            {shipping.trackingNumber}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: statusInfo.color + '14',
              borderColor: statusInfo.color + '30',
            },
          ]}
        >
          <Ionicons name={statusInfo.icon} size={12} color={statusInfo.color} />
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.label}
          </Text>
        </View>
      </View>

      {/* Ayraç */}
      <View style={[styles.divider, { backgroundColor: colors.divider }]} />

      {/* Alt: adres + tarih */}
      <View style={styles.cardBottom}>
        <View style={styles.cardRow}>
          <Ionicons name="location-outline" size={13} color={colors.subtext} />
          <Text style={[styles.cardRowText, { color: colors.subtext }]} numberOfLines={1}>
            {shipping.address.district}, {shipping.address.city}
          </Text>
        </View>
        {shipping.estimatedDelivery && (
          <View style={styles.cardRow}>
            <Ionicons name="calendar-outline" size={13} color={colors.subtext} />
            <Text style={[styles.cardRowText, { color: colors.subtext }]}>
              Tahmini: {new Date(shipping.estimatedDelivery).toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: 'short',
              })}
            </Text>
          </View>
        )}
      </View>

      {/* Ok */}
      <View style={styles.cardFooter}>
        <Ionicons name="chevron-forward" size={16} color={colors.subtext + '60'} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Ekran ───────────────────────────────────────────────────────────────────
export default function ShippingListScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { orders } = useOrdersStore();
  const [filter, setFilter] = useState<ShippingFilter>('ALL');
  const [shipments, setShipments] = useState<ShippingInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const shippedOrderIds = useMemo(
    () =>
      orders
        .filter((o) => o.status === 'SHIPPED' || o.status === 'DELIVERED')
        .map((o) => o.id),
    [orders],
  );

  const loadShipments = useCallback(async () => {
    if (!shippedOrderIds.length) {
      setShipments([]);
      setLoading(false);
      return;
    }
    try {
      const res = await shippingService.getShipments(shippedOrderIds);
      setShipments(res.data);
    } catch {
      // hata
    } finally {
      setLoading(false);
    }
  }, [shippedOrderIds]);

  useEffect(() => {
    loadShipments();
  }, [loadShipments]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadShipments();
    setRefreshing(false);
  }, [loadShipments]);

  const filtered = useMemo(
    () =>
      filter === 'ALL' ? shipments : shipments.filter((s) => s.currentStatus === filter),
    [shipments, filter],
  );

  const subtitle = loading
    ? 'Yükleniyor...'
    : shipments.length > 0
    ? `${shipments.length} gönderi`
    : 'Kargo takip';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.inner}>
        <ScreenHeader title="Sevkiyatlar" subtitle={subtitle} />

        {/* Filtreler */}
        <View style={styles.filtersWrap}>
          <FlatList
            data={FILTERS}
            keyExtractor={(i) => i.key}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersList}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => { lightImpact(); setFilter(item.key); }}
                style={[
                  styles.chip,
                  {
                    backgroundColor: filter === item.key ? colors.primary : colors.card,
                    borderColor: filter === item.key ? colors.primary : colors.cardBorder,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: filter === item.key ? '#FFF' : colors.text },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* İçerik */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : filtered.length === 0 ? (
          <Animated.View
            entering={FadeInDown.duration(500).springify()}
            style={styles.empty}
          >
            <View
              style={[
                styles.emptyIconWrap,
                {
                  backgroundColor: colors.primary + '12',
                  borderColor: colors.primary + '25',
                },
              ]}
            >
              <Ionicons name="car-outline" size={48} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {filter === 'ALL' ? 'Henüz sevkiyat yok' : 'Bu kategoride sevkiyat yok'}
            </Text>
            <Text style={[styles.emptySub, { color: colors.subtext }]}>
              {filter === 'ALL'
                ? 'Siparişleriniz kargoya verildiğinde burada görünecek.'
                : 'Farklı bir filtre seçmeyi deneyin.'}
            </Text>
          </Animated.View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <ShippingCard
                shipping={item}
                colors={colors}
                isDark={isDark}
                onPress={() => {
                  lightImpact();
                  router.push(`/shipping/${item.orderId}`);
                }}
              />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: TAB_BAR_HEIGHT,
  },

  filtersWrap: { marginBottom: 20 },
  filtersList: { gap: 10, paddingRight: Spacing.screenPadding },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: '600' },

  list: { gap: 12, paddingBottom: 12 },
  card: { borderRadius: 20, borderWidth: 1, padding: 16, gap: 0 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  carrierIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardMeta: { flex: 1 },
  carrier: { fontSize: 15, fontWeight: '700' },
  trackingNo: { fontSize: 12, fontWeight: '500', marginTop: 2, letterSpacing: 0.2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  divider: { height: 1, marginBottom: 12 },
  cardBottom: { gap: 6 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardRowText: { fontSize: 12, fontWeight: '500', flex: 1 },
  cardFooter: { alignItems: 'flex-end', marginTop: 8 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
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
  },
});
