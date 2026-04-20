import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';

import { Spacing } from '../src/Constants/Spacing';
import { ScreenHeader } from '../src/Shared/Header';
import { useTheme } from '../src/Context/ThemeContext';
import { useOrdersStore } from '../src/store/orders/ordersStore';
import type { EcommerceOrder, OrderFilter } from '../src/Types/ecommerce-order';
import { getStatusInfo } from '../src/features/orders/statusInfo';
import { lightImpact } from '../src/Utils/haptics';

const TAB_BAR_HEIGHT = 100;

const FILTERS: { key: OrderFilter; label: string }[] = [
  { key: 'ALL', label: 'Tümü' },
  { key: 'PENDING', label: 'Beklemede' },
  { key: 'CONFIRMED', label: 'Onaylandı' },
  { key: 'PROCESSING', label: 'Hazırlanıyor' },
  { key: 'SHIPPED', label: 'Kargoda' },
  { key: 'DELIVERED', label: 'Teslim Edildi' },
  { key: 'CANCELLED', label: 'İptal' },
];

function FilterChip({
  filter,
  isActive,
  onPress,
  colors,
}: {
  filter: { key: OrderFilter; label: string };
  isActive: boolean;
  onPress: () => void;
  colors: any;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.filterChip,
        {
          backgroundColor: isActive ? colors.primary : colors.card,
          borderColor: isActive ? colors.primary : colors.cardBorder,
        },
      ]}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.filterChipText,
          { color: isActive ? '#FFF' : colors.text },
        ]}
      >
        {filter.label}
      </Text>
    </TouchableOpacity>
  );
}

function OrderCard({
  order,
  colors,
  isDark,
  onPress,
}: {
  order: EcommerceOrder;
  colors: any;
  isDark: boolean;
  onPress: () => void;
}) {
  const statusInfo = getStatusInfo(order.status);
  const firstItem = order.items[0];
  const itemCount = order.items.length;
  const GOLD = colors.catalogGold;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.orderCard,
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
      activeOpacity={0.88}
    >
      {/* Üst kısım: Sipariş numarası ve durum */}
      <View style={styles.orderHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.orderNumber, { color: colors.text }]}>
            {order.orderNumber}
          </Text>
          <Text style={[styles.orderDate, { color: colors.subtext }]}>
            {new Date(order.createdAt).toLocaleDateString('tr-TR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
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
          <Ionicons name={statusInfo.icon} size={14} color={statusInfo.color} />
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.label}
          </Text>
        </View>
      </View>

      {/* Ürün önizlemesi */}
      <View style={styles.orderItems}>
        {firstItem?.product.imageUrl ? (
          <Image
            source={{ uri: firstItem.product.imageUrl }}
            style={styles.orderItemImage}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.orderItemPlaceholder, { backgroundColor: GOLD + '08' }]}>
            <Ionicons name="diamond-outline" size={20} color={GOLD + '60'} />
          </View>
        )}
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.orderItemName, { color: colors.text }]} numberOfLines={1}>
            {firstItem?.product.name || 'Ürün'}
          </Text>
          {itemCount > 1 && (
            <Text style={[styles.orderItemCount, { color: colors.subtext }]}>
              +{itemCount - 1} ürün daha
            </Text>
          )}
        </View>
        <Text style={[styles.orderTotal, { color: colors.primary }]}>
          {order.totalAmount.toLocaleString('tr-TR')}₺
        </Text>
      </View>

      {/* Alt ok ikonu */}
      <View style={styles.orderFooter}>
        <Ionicons name="chevron-forward" size={16} color={colors.subtext + '60'} />
      </View>
    </TouchableOpacity>
  );
}

export default function OrdersScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { orders } = useOrdersStore();
  const [selectedFilter, setSelectedFilter] = useState<OrderFilter>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const filteredOrders = useMemo(() => {
    if (selectedFilter === 'ALL') return orders;
    return orders.filter((o) => o.status === selectedFilter);
  }, [orders, selectedFilter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.content}>
        <ScreenHeader title="Siparişlerim" subtitle={`${orders.length} sipariş`} />

        {/* Filtreler */}
        <View style={styles.filtersContainer}>
          <FlatList
            data={FILTERS}
            keyExtractor={(item) => item.key}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersList}
            renderItem={({ item }) => (
              <FilterChip
                filter={item}
                isActive={selectedFilter === item.key}
                onPress={() => {
                  lightImpact();
                  setSelectedFilter(item.key);
                }}
                colors={colors}
              />
            )}
          />
        </View>

        {/* Sipariş listesi */}
        {filteredOrders.length === 0 ? (
          <Animated.View
            entering={FadeInDown.duration(500).springify()}
            style={styles.emptyContainer}
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
              <Ionicons name="receipt-outline" size={48} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {selectedFilter === 'ALL' ? 'Henüz sipariş yok' : 'Bu kategoride sipariş yok'}
            </Text>
            <Text style={[styles.emptySub, { color: colors.subtext }]}>
              {selectedFilter === 'ALL'
                ? 'İlk siparişinizi vermek için kataloğa göz atın.'
                : 'Farklı bir filtre seçmeyi deneyin.'}
            </Text>
            {selectedFilter === 'ALL' && (
              <TouchableOpacity
                onPress={() => {
                  lightImpact();
                  router.push('/(tabs)/catalog');
                }}
                style={[styles.emptyCta, { backgroundColor: colors.primary }]}
                activeOpacity={0.85}
              >
                <Text style={styles.emptyCtaText}>Kataloğa Git</Text>
                <Ionicons name="diamond-outline" size={18} color="#FFF" />
              </TouchableOpacity>
            )}
          </Animated.View>
        ) : (
          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <OrderCard
                order={item}
                colors={colors}
                isDark={isDark}
                onPress={() => {
                  lightImpact();
                  router.push(`/orders/${item.id}`);
                }}
              />
            )}
            contentContainerStyle={styles.ordersList}
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
  content: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: TAB_BAR_HEIGHT,
  },
  filtersContainer: {
    marginTop: 16,
    marginBottom: 20,
  },
  filtersList: {
    gap: 10,
    paddingRight: Spacing.screenPadding,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  ordersList: {
    gap: 12,
    paddingBottom: 12,
  },
  orderCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  orderDate: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  orderItems: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderItemImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  orderItemPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderItemCount: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  orderFooter: {
    alignItems: 'flex-end',
    marginTop: -4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
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
    marginBottom: 24,
  },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  emptyCtaText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
});
