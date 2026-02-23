import React, { useEffect, useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Spacing } from '../../src/Constants/Spacing';
import { useTheme } from '../../src/Context/ThemeContext';
import { shippingService } from '../../src/Api/shippingService';
import { getShippingStatusInfo } from './index';
import type { ShippingInfo, ShippingStatus, TrackingEvent } from '../../src/Types/ecommerce-order';
import { lightImpact } from '../../src/Utils/haptics';

// Tüm olası kargo adımları (başarısız / iade durumları hariç normal akış)
const FLOW_STATUSES: ShippingStatus[] = [
  'PREPARING',
  'PICKED_UP',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

// ─── Kargo olayı satırı ──────────────────────────────────────────────────────
const TrackingEventRow = memo(function TrackingEventRow({
  event,
  isLast,
  colors,
}: {
  event: TrackingEvent;
  isLast: boolean;
  colors: any;
}) {
  const info = getShippingStatusInfo(event.status);

  return (
    <View style={styles.eventRow}>
      {/* Sol: dot + çizgi */}
      <View style={styles.eventLeft}>
        <View style={[styles.eventDot, { backgroundColor: info.color, borderColor: info.color + '40' }]}>
          <Ionicons name={info.icon} size={13} color="#FFF" />
        </View>
        {!isLast && <View style={[styles.eventLine, { backgroundColor: colors.divider }]} />}
      </View>

      {/* Sağ: içerik */}
      <View style={[styles.eventContent, isLast && styles.eventContentLast]}>
        <Text style={[styles.eventStatusLabel, { color: colors.text }]}>{info.label}</Text>
        <Text style={[styles.eventDesc, { color: colors.subtext }]}>{event.description}</Text>
        <View style={styles.eventFooter}>
          <Ionicons name="location-outline" size={12} color={colors.subtext} />
          <Text style={[styles.eventFooterText, { color: colors.subtext }]}>{event.location}</Text>
          <Text style={[styles.eventSep, { color: colors.subtext + '50' }]}>·</Text>
          <Text style={[styles.eventFooterText, { color: colors.subtext }]}>
            {new Date(event.timestamp).toLocaleDateString('tr-TR', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    </View>
  );
});

// ─── Adres kartı ─────────────────────────────────────────────────────────────
const AddressCard = memo(function AddressCard({
  shipping,
  colors,
  isDark,
}: {
  shipping: ShippingInfo;
  colors: any;
  isDark: boolean;
}) {
  const { address } = shipping;
  return (
    <View
      style={[
        styles.sectionCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.12 : 0.05, shadowRadius: 8 },
            android: { elevation: 3 },
          }),
        },
      ]}
    >
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: colors.primary + '12' }]}>
          <Ionicons name="location" size={17} color={colors.primary} />
        </View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Teslimat Adresi</Text>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.divider }]} />
      <Text style={[styles.addrName, { color: colors.text }]}>{address.fullName}</Text>
      <Text style={[styles.addrLine, { color: colors.subtext }]}>{address.addressLine}</Text>
      <Text style={[styles.addrLine, { color: colors.subtext }]}>
        {address.district}, {address.city} {address.zipCode}
      </Text>
      <View style={styles.addrPhoneRow}>
        <Ionicons name="call-outline" size={13} color={colors.subtext} />
        <Text style={[styles.addrPhone, { color: colors.subtext }]}>{address.phone}</Text>
      </View>
    </View>
  );
});

// ─── Ana ekran ────────────────────────────────────────────────────────────────
export default function ShippingDetailScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { id: orderId } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useTheme();

  const [shipping, setShipping] = useState<ShippingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await shippingService.getShipmentByOrderId(orderId || '');
      setShipping(res.data);
    } catch {
      // hata
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  // Geri butonu — her zaman çalışır
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        const canGoBack = navigation.canGoBack();
        return (
          <TouchableOpacity
            onPress={() => { canGoBack ? router.back() : router.push('/shipping'); }}
            style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: 4, paddingHorizontal: 8 }}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
            <Text style={{ fontSize: 17, color: colors.text, lineHeight: 24 }}>Sevkiyatlar</Text>
          </TouchableOpacity>
        );
      },
    });
  }, [navigation, router, colors.text]);

  const handleRefresh = useCallback(async () => {
    lightImpact();
    setRefreshing(true);
    try {
      await shippingService.refreshTracking(orderId || '');
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [orderId, load]);

  const handleOpenTracking = useCallback(() => {
    if (!shipping?.trackingUrl) {
      Alert.alert('Takip Linki Yok', 'Bu kargo için harici takip linki bulunmuyor.');
      return;
    }
    Linking.openURL(shipping.trackingUrl).catch(() =>
      Alert.alert('Hata', 'Tarayıcı açılamadı.'),
    );
  }, [shipping]);

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={[]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.subtext }]}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Not found ─────────────────────────────────────────────────────────────
  if (!shipping) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={[]}>
        <View style={styles.center}>
          <View style={[styles.notFoundIcon, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '25' }]}>
            <Ionicons name="alert-circle-outline" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.notFoundTitle, { color: colors.text }]}>Sevkiyat Bulunamadı</Text>
          <Text style={[styles.notFoundSub, { color: colors.subtext }]}>
            Bu siparişe ait kargo bilgisi henüz oluşturulmamış.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.85}
          >
            <Text style={styles.backBtnText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusInfo = getShippingStatusInfo(shipping.currentStatus);
  const statusIndex = FLOW_STATUSES.indexOf(shipping.currentStatus);
  const sortedEvents = [...shipping.events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={[]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Özet kartı ─────────────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.duration(500).springify()}
          style={[
            styles.summaryCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              ...Platform.select({
                ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: isDark ? 0.15 : 0.06, shadowRadius: 10 },
                android: { elevation: 4 },
              }),
            },
          ]}
        >
          {/* Taşıyıcı + durum */}
          <View style={styles.summaryTop}>
            <View style={[styles.summaryIcon, { backgroundColor: statusInfo.color + '14' }]}>
              <Ionicons name={statusInfo.icon} size={28} color={statusInfo.color} />
            </View>
            <View style={styles.summaryMeta}>
              <Text style={[styles.summaryCarrier, { color: colors.text }]}>{shipping.carrier}</Text>
              <Text style={[styles.summaryTracking, { color: colors.subtext }]}>
                {shipping.trackingNumber}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '14', borderColor: statusInfo.color + '30' }]}>
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>

          {/* İlerleme adımları */}
          <View style={styles.progressRow}>
            {FLOW_STATUSES.map((s, i) => {
              const done = i <= statusIndex && statusIndex !== -1;
              const si = getShippingStatusInfo(s);
              return (
                <View key={s} style={styles.progressStep}>
                  <View
                    style={[
                      styles.progressDot,
                      {
                        backgroundColor: done ? si.color : (isDark ? '#333' : '#E5E7EB'),
                        borderColor: done ? si.color : (isDark ? '#444' : '#D1D5DB'),
                      },
                    ]}
                  >
                    {done && <Ionicons name="checkmark" size={10} color="#FFF" />}
                  </View>
                  {i < FLOW_STATUSES.length - 1 && (
                    <View
                      style={[
                        styles.progressLine,
                        {
                          backgroundColor:
                            done && i < statusIndex ? si.color : (isDark ? '#333' : '#E5E7EB'),
                        },
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </View>

          {/* Tahmini teslim */}
          {shipping.estimatedDelivery && (
            <View style={[styles.estRow, { backgroundColor: colors.primary + '08', borderColor: colors.primary + '18' }]}>
              <Ionicons name="calendar-outline" size={15} color={colors.primary} />
              <Text style={[styles.estText, { color: colors.primary }]}>
                Tahmini teslim:{' '}
                {new Date(shipping.estimatedDelivery).toLocaleDateString('tr-TR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* ─── Kargo hareketleri ───────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(500).delay(80).springify()}>
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                ...Platform.select({
                  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.12 : 0.05, shadowRadius: 8 },
                  android: { elevation: 3 },
                }),
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: '#3B82F6' + '12' }]}>
                <Ionicons name="map-outline" size={17} color="#3B82F6" />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Kargo Hareketleri</Text>
              <TouchableOpacity
                onPress={handleRefresh}
                style={styles.refreshBtn}
                disabled={refreshing}
                hitSlop={8}
              >
                {refreshing
                  ? <ActivityIndicator size="small" color={colors.primary} />
                  : <Ionicons name="refresh-outline" size={20} color={colors.primary} />
                }
              </TouchableOpacity>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            <View>
              {sortedEvents.map((event, index) => (
                <TrackingEventRow
                  key={event.id}
                  event={event}
                  isLast={index === sortedEvents.length - 1}
                  colors={colors}
                />
              ))}
            </View>
          </View>
        </Animated.View>

        {/* ─── Adres ───────────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(500).delay(160).springify()}>
          <AddressCard shipping={shipping} colors={colors} isDark={isDark} />
        </Animated.View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ─── Alt buton ────────────────────────────────────────────────────── */}
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: colors.background }}>
        <View style={[styles.bottomBar, { borderTopColor: colors.divider }]}>
          <TouchableOpacity
            onPress={handleOpenTracking}
            style={[
              styles.trackBtn,
              {
                backgroundColor: colors.primary,
                ...Platform.select({
                  ios: { shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
                  android: { elevation: 4 },
                }),
              },
            ]}
            activeOpacity={0.85}
          >
            <Ionicons name="open-outline" size={20} color="#FFF" />
            <Text style={styles.trackBtnText}>{shipping.carrier} Sitesinde Takip Et</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: 16,
    paddingBottom: 20,
  },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20 },
  loadingText: { fontSize: 14, fontWeight: '500', marginTop: 4 },

  notFoundIcon: {
    width: 88,
    height: 88,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  notFoundTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  notFoundSub: { fontSize: 14, fontWeight: '400', textAlign: 'center', lineHeight: 20 },
  backBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14, marginTop: 4 },
  backBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },

  // ─── Özet kartı
  summaryCard: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 16 },
  summaryTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  summaryIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  summaryMeta: { flex: 1 },
  summaryCarrier: { fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
  summaryTracking: { fontSize: 12, fontWeight: '500', marginTop: 3, letterSpacing: 0.3 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: { fontSize: 11, fontWeight: '700' },

  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  progressStep: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  progressDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressLine: { flex: 1, height: 2, marginHorizontal: 3 },

  estRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  estText: { fontSize: 13, fontWeight: '600', flex: 1 },

  // ─── Bölüm kartı (ortak)
  sectionCard: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', flex: 1 },
  refreshBtn: { padding: 4 },
  divider: { height: 1, marginBottom: 14 },

  // ─── Kargo olayları
  eventRow: { flexDirection: 'row', marginBottom: 0 },
  eventLeft: { width: 36, alignItems: 'center', marginRight: 12 },
  eventDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventLine: { width: 2, flex: 1, marginTop: 4, minHeight: 20 },
  eventContent: { flex: 1, paddingBottom: 20 },
  eventContentLast: { paddingBottom: 0 },
  eventStatusLabel: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  eventDesc: { fontSize: 13, fontWeight: '400', lineHeight: 18, marginBottom: 5 },
  eventFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  eventFooterText: { fontSize: 12, fontWeight: '500' },
  eventSep: { fontSize: 12 },

  // ─── Adres
  addrName: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  addrLine: { fontSize: 13, fontWeight: '400', lineHeight: 20 },
  addrPhoneRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  addrPhone: { fontSize: 13, fontWeight: '500' },

  // ─── Alt buton
  bottomBar: { paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1 },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
  },
  trackBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
