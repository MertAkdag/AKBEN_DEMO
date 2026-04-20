import React, { useMemo, useEffect, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';

import { Spacing } from '../../src/Constants/Spacing';
import { useTheme } from '../../src/Context/ThemeContext';
import { useOrdersStore } from '../../src/store/orders/ordersStore';
import { useCartStore } from '../../src/store/cart/cartStore';
import { getStatusInfo } from '../../src/features/orders/statusInfo';
import type { OrderStatus } from '../../src/Types/ecommerce-order';
import { lightImpact } from '../../src/Utils/haptics';
import { useResponsive } from '../../src/Hooks/UseResponsive';

const TAB_BAR_HEIGHT = 100;

const OrderItemRow = memo(function OrderItemRow({
  item,
  colors,
  isDark,
}: {
  item: { product: any; quantity: number; pricePerUnit: number };
  colors: any;
  isDark: boolean;
}) {
  const GOLD = colors.catalogGold;
  const total = item.quantity * item.pricePerUnit;

  return (
    <View
      style={[
        styles.orderItemRow,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isDark ? 0.1 : 0.05,
              shadowRadius: 4,
            },
            android: { elevation: 2 },
          }),
        },
      ]}
    >
      <View style={styles.orderItemLeft}>
        {item.product.imageUrl ? (
          <Image
            source={{ uri: item.product.imageUrl }}
            style={styles.orderItemImg}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.orderItemPlaceholder, { backgroundColor: GOLD + '08' }]}>
            <Ionicons name="diamond-outline" size={24} color={GOLD + '60'} />
          </View>
        )}
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.orderItemName, { color: colors.text }]} numberOfLines={2}>
            {item.product.name}
          </Text>
          {item.product.variant?.name && (
            <Text style={[styles.orderItemVariant, { color: colors.subtext }]}>
              {item.product.variant.name}
            </Text>
          )}
          <Text style={[styles.orderItemQty, { color: colors.subtext }]}>
            Adet: {item.quantity}
          </Text>
        </View>
      </View>
      <View style={styles.orderItemRight}>
        <Text style={[styles.orderItemPrice, { color: colors.text }]}>
          {item.pricePerUnit.toLocaleString('tr-TR')}₺
        </Text>
        <Text style={[styles.orderItemTotal, { color: colors.primary }]}>
          {total.toLocaleString('tr-TR')}₺
        </Text>
      </View>
    </View>
  );
});

function OrderStatusTimeline({
  statusHistory,
  currentStatus,
  colors,
  isDark,
}: {
  statusHistory: Array<{ status: OrderStatus; timestamp: string; note?: string }>;
  currentStatus: OrderStatus;
  colors: any;
  isDark: boolean;
}) {
  const allStatuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

  if (currentStatus === 'CANCELLED') {
    const cancelEntry = statusHistory.find((h) => h.status === 'CANCELLED');
    return (
      <View
        style={[
          styles.timelineCard,
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
        <View style={styles.timelineCardHeader}>
          <View style={[styles.timelineIconWrap, { backgroundColor: '#EF4444' + '18' }]}>
            <Ionicons name="close-circle" size={22} color="#EF4444" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.timelineCardTitle, { color: colors.text }]}>Sipariş İptal Edildi</Text>
            {cancelEntry && (
              <Text style={[styles.timelineCardDate, { color: colors.subtext }]}>
                {new Date(cancelEntry.timestamp).toLocaleDateString('tr-TR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            )}
          </View>
        </View>
        {cancelEntry?.note && (
          <View style={[styles.timelineCardNoteWrap, { borderTopColor: colors.divider }]}>
            <Text style={[styles.timelineCardNote, { color: colors.subtext }]}>
              {cancelEntry.note}
            </Text>
          </View>
        )}
      </View>
    );
  }

  const statusIndex = allStatuses.indexOf(currentStatus);
  const statusesToShow = allStatuses.slice(0, statusIndex + 1);

  return (
    <View
      style={[
        styles.timelineCard,
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
      <View style={styles.timelineCardHeader}>
        <View style={[styles.timelineIconWrap, { backgroundColor: colors.primary + '18' }]}>
          <Ionicons name="time-outline" size={22} color={colors.primary} />
        </View>
        <Text style={[styles.timelineCardTitle, { color: colors.text }]}>Sipariş Durumu</Text>
      </View>

      <View style={styles.timelineSteps}>
        {allStatuses.map((status, index) => {
          const isCompleted = statusesToShow.includes(status);
          const isCurrent = status === currentStatus;
          const statusInfo = getStatusInfo(status);
          const historyEntry = statusHistory.find((h) => h.status === status);
          const isLast = index === allStatuses.length - 1;

          return (
            <View key={status} style={[styles.timelineStepRow, isLast && styles.timelineStepRowLast]}>
              {/* Sol: İkon ve çizgi */}
              <View style={styles.timelineStepLeft}>
                <View
                  style={[
                    styles.timelineStepIcon,
                    {
                      backgroundColor: isCompleted ? statusInfo.color : colors.divider,
                      borderColor: isCompleted ? statusInfo.color : colors.cardBorder,
                      ...(isCurrent && {
                        borderWidth: 3,
                        borderColor: statusInfo.color,
                      }),
                    },
                  ]}
                >
                  {isCompleted ? (
                    <Ionicons name={statusInfo.icon} size={16} color="#FFF" />
                  ) : (
                    <View style={[styles.timelineStepIconDot, { backgroundColor: colors.subtext + '40' }]} />
                  )}
                </View>
                {index < allStatuses.length - 1 && (
                  <View
                    style={[
                      styles.timelineStepLine,
                      {
                        backgroundColor: isCompleted ? statusInfo.color + '60' : colors.divider,
                      },
                    ]}
                  />
                )}
              </View>

              {/* Sağ: İçerik */}
              <View style={styles.timelineStepRight}>
                <View style={styles.timelineStepContent}>
                  <Text
                    style={[
                      styles.timelineStepLabel,
                      {
                        color: isCompleted ? colors.text : colors.subtext,
                        fontWeight: isCompleted ? '700' : '500',
                      },
                    ]}
                  >
                    {statusInfo.label}
                  </Text>
                  {historyEntry && (
                    <Text style={[styles.timelineStepDate, { color: colors.subtext }]}>
                      {new Date(historyEntry.timestamp).toLocaleDateString('tr-TR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  )}
                  {!historyEntry && !isCompleted && (
                    <Text style={[styles.timelineStepDate, { color: colors.subtext + '60' }]}>
                      Bekleniyor
                    </Text>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function OrderDetailScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useTheme();
  const { calculateFontSize } = useResponsive();
  const { getOrderById, cancelOrder } = useOrdersStore();
  const { addToCart } = useCartStore();

  const order = useMemo(() => getOrderById(id || ''), [id, getOrderById]);

  // Geri butonu her zaman çalışsın diye navigation ayarı
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        const canGoBack = navigation.canGoBack();
        return (
          <TouchableOpacity
            onPress={() => {
              if (canGoBack) {
                router.back();
              } else {
                router.push('/orders');
              }
            }}
            style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: 4, paddingHorizontal: 8 }}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
            <Text style={{ fontSize: 17, color: colors.text, lineHeight: 24 }}>Siparişler</Text>
          </TouchableOpacity>
        );
      },
    });
  }, [navigation, router, colors.text]);

  if (!order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={[]}>
        <View style={styles.content}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.subtext} />
            <Text style={[styles.errorText, { color: colors.text }]}>Sipariş bulunamadı</Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={[styles.backBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.backBtnText}>Geri Dön</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const canCancel = order.status === 'PENDING' || order.status === 'CONFIRMED';
  const canReorder = order.status !== 'CANCELLED';

  const handleReorder = () => {
    lightImpact();
    order.items.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        addToCart(item.product);
      }
    });
    Alert.alert('Başarılı', 'Ürünler sepete eklendi', [
      { text: 'Tamam', onPress: () => router.push('/(tabs)/cart') },
    ]);
  };

  const handleCancel = () => {
    Alert.alert(
      'Siparişi İptal Et',
      'Bu siparişi iptal etmek istediğinize emin misiniz?',
      [
        { text: 'Hayır', style: 'cancel' },
        {
          text: 'Evet, İptal Et',
          style: 'destructive',
          onPress: () => {
            cancelOrder(order.id, 'Müşteri tarafından iptal edildi');
            lightImpact();
            router.back();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={[]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* Sipariş özeti kartı */}
        <Animated.View
          entering={FadeInDown.duration(500).springify()}
          style={[
            styles.summaryCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              ...Platform.select({
                ios: {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: isDark ? 0.15 : 0.06,
                  shadowRadius: 10,
                },
                android: { elevation: 4 },
              }),
            },
          ]}
        >
          <View style={styles.summaryHeader}>
            <View>
              <Text style={[styles.summaryLabel, { color: colors.subtext }]}>Sipariş No</Text>
              <Text style={[styles.summaryValue, { fontSize: calculateFontSize(17), color: colors.text }]}>
                {order.orderNumber}
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
              <Ionicons name={statusInfo.icon} size={16} color={statusInfo.color} />
              <Text style={[styles.statusBadgeText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.divider }]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.subtext }]}>Sipariş Tarihi</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.subtext }]}>Altının Gramı</Text>
            <Text style={[styles.summaryTotal, { color: colors.primary }]}>
              {order.totalAmount.toLocaleString('tr-TR')} gr
            </Text>
          </View>
        </Animated.View>

        {/* Durum zaman çizelgesi */}
        <Animated.View entering={FadeInDown.duration(500).delay(80).springify()}>
          <OrderStatusTimeline
            statusHistory={order.statusHistory}
            currentStatus={order.status}
            colors={colors}
            isDark={isDark}
          />
        </Animated.View>

        {/* Ürünler */}
        <Animated.View entering={FadeInDown.duration(500).delay(120).springify()}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Ürünler</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.subtext }]}>
              {order.items.length} ürün
            </Text>
          </View>
          <View style={styles.itemsContainer}>
            {order.items.map((item, index) => (
              <OrderItemRow
                key={`${item.product.id}-${index}`}
                item={item}
                colors={colors}
                isDark={isDark}
              />
            ))}
          </View>
        </Animated.View>

        {/* Alt boşluk */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Alt butonlar */}
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: colors.background }}>
        <View style={[styles.bottomBar, { borderTopColor: colors.divider }]}>
          {/* Kargo takip butonu (SHIPPED veya DELIVERED) */}
          {(order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
            <TouchableOpacity
              onPress={() => { lightImpact(); router.push(`/shipping/${order.id}`); }}
              style={[styles.actionBtn, {
                backgroundColor: '#06B6D4',
                ...Platform.select({
                  ios: { shadowColor: '#06B6D4', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
                  android: { elevation: 4 },
                }),
              }]}
              activeOpacity={0.85}
            >
              <Ionicons name="car-outline" size={20} color="#FFF" />
              <Text style={styles.actionBtnText}>Kargo Takip</Text>
            </TouchableOpacity>
          )}
          {canReorder && (
            <TouchableOpacity
              onPress={handleReorder}
              style={[styles.actionBtn, styles.reorderBtn, {
                backgroundColor: colors.primary,
                ...Platform.select({
                  ios: { shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
                  android: { elevation: 4 },
                }),
              }]}
              activeOpacity={0.85}
            >
              <Ionicons name="repeat-outline" size={20} color="#FFF" />
              <Text style={styles.actionBtnText}>Tekrar Sipariş Ver</Text>
            </TouchableOpacity>
          )}
          {canCancel && (
            <TouchableOpacity
              onPress={handleCancel}
              style={[styles.actionBtn, styles.cancelBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              activeOpacity={0.85}
            >
              <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
              <Text style={[styles.cancelBtnText, { color: '#EF4444' }]}>İptal Et</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: TAB_BAR_HEIGHT + 20,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 24,
  },
  backBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  summaryCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  summaryTotal: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  summaryDivider: {
    height: 1,
    marginVertical: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  timelineCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
  },
  timelineCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  timelineIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  timelineCardDate: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  timelineCardNoteWrap: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  timelineCardNote: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  timelineSteps: {
    gap: 0,
  },
  timelineStepRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineStepRowLast: {
    marginBottom: 0,
  },
  timelineStepLeft: {
    width: 44,
    alignItems: 'center',
    marginRight: 12,
  },
  timelineStepIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineStepIconDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timelineStepLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    minHeight: 40,
  },
  timelineStepRight: {
    flex: 1,
    paddingTop: 4,
  },
  timelineStepContent: {
    gap: 4,
  },
  timelineStepLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  timelineStepDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  itemsContainer: {
    gap: 10,
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  orderItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderItemImg: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  orderItemPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: '700',
  },
  orderItemVariant: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  orderItemQty: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  orderItemRight: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  orderItemPrice: {
    fontSize: 13,
    fontWeight: '600',
  },
  orderItemTotal: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  bottomBar: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  reorderBtn: {},
  cancelBtn: {
    borderWidth: 1,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
