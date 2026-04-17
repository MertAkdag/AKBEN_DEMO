/**
 * Fiyat Detay Modalı
 *
 * Ürün detayında fiyat bileşenlerini gösterir.
 * İleriye dönük: priceService.getPriceBreakdown(productId) endpoint'ine bağlanacak.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';

import type { Product } from '../../Types/catalog';
import { lightImpact } from '../../Utils/haptics';

interface PriceRow {
  label: string;
  value: string;
  highlight?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
}

interface Props {
  visible: boolean;
  product: Product;
  onClose: () => void;
  onAddToCart?: (quantity: number) => void;
  alreadyInCart?: boolean;
  colors: any;
  isDark: boolean;
  goldPrice?: number;
}

function buildPriceRows(product: Product, quantity: number, goldPrice?: number): PriceRow[] {
  const base = product.pricePerUnit;
  const isGold = product.unit?.symbol === 'gr' || product.unit?.name?.toLowerCase().includes('gram');

  const rows: PriceRow[] = [];

  if (isGold && goldPrice) {
    rows.push({
      label: 'Anlık Gram Altın',
      value: `${goldPrice.toLocaleString('tr-TR')}₺`,
      icon: 'trending-up-outline',
      color: '#C9963B',
    });
    const weight = base / goldPrice;
    rows.push({
      label: 'Tahmini Gram',
      value: `${weight.toFixed(2)} gr`,
      icon: 'scale-outline',
    });
  }

  rows.push({
    label: 'Birim Fiyat',
    value: base > 0 ? `${base.toLocaleString('tr-TR')}₺` : '—',
    icon: 'pricetag-outline',
  });

  if (product.variant?.name) {
    rows.push({
      label: 'Ayar / Varyant',
      value: product.variant.name,
      icon: 'diamond-outline',
    });
  }

  rows.push({
    label: 'KDV',
    value: `%${product.kdvOrani.toFixed(2)}`,
    icon: 'receipt-outline',
    color: '#10B981',
  });

  const total = base * quantity;
  rows.push({
    label: `Toplam (${quantity} adet)`,
    value: total > 0 ? `${total.toLocaleString('tr-TR')}₺` : '—',
    icon: 'checkmark-circle-outline',
    highlight: true,
  });

  return rows;
}

export function PriceDetailModal({ visible, product, onClose, onAddToCart, alreadyInCart, colors, isDark, goldPrice }: Props) {
  const [quantity, setQuantity] = useState(1);
  const GOLD = colors.catalogGold ?? colors.primary;

  useEffect(() => {
    if (visible) setQuantity(1);
  }, [visible]);

  const rows = buildPriceRows(product, quantity, goldPrice);

  const handleDecrease = useCallback(() => {
    lightImpact();
    setQuantity((q) => Math.max(1, q - 1));
  }, []);

  const handleIncrease = useCallback(() => {
    lightImpact();
    setQuantity((q) => q + 1);
  }, []);

  const handleAddToCart = useCallback(() => {
    lightImpact();
    onAddToCart?.(quantity);
  }, [onAddToCart, quantity]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <Animated.View
            entering={SlideInDown.duration(400).springify()}
            exiting={SlideOutDown.duration(250).springify()}
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              borderColor: colors.cardBorder,
              ...Platform.select({
                ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: isDark ? 0.4 : 0.12, shadowRadius: 16 },
                android: { elevation: 12 },
              }),
            },
          ]}
        >
          <SafeAreaView edges={['bottom']}>
            <View style={[styles.handle, { backgroundColor: colors.divider }]} />

            <View style={styles.header}>
              <View style={[styles.headerIcon, { backgroundColor: colors.primary + '14' }]}>
                <Ionicons name="bar-chart-outline" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: colors.text }]}>Fiyat Detayı</Text>
                <Text style={[styles.productName, { color: colors.subtext }]} numberOfLines={1}>
                  {product.name}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.card }]} activeOpacity={0.7}>
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.rows} showsVerticalScrollIndicator={false}>
              {rows.map((row, i) => (
                <View
                  key={i}
                  style={[
                    styles.row,
                    row.highlight && {
                      backgroundColor: colors.primary + '10',
                      borderColor: colors.primary + '25',
                      borderWidth: 1,
                      borderRadius: 14,
                      marginTop: 8,
                    },
                    i > 0 && !row.highlight && { borderTopWidth: 1, borderTopColor: colors.divider },
                  ]}
                >
                  <View style={styles.rowLeft}>
                    {row.icon && (
                      <Ionicons
                        name={row.icon}
                        size={16}
                        color={row.color ?? (row.highlight ? colors.primary : colors.subtext)}
                      />
                    )}
                    <Text style={[styles.rowLabel, { color: row.highlight ? colors.text : colors.subtext }]}>
                      {row.label}
                    </Text>
                  </View>
                  <Text style={[
                    styles.rowValue,
                    { color: row.color ?? (row.highlight ? colors.primary : colors.text) },
                    row.highlight && { fontWeight: '900', fontSize: 17 },
                  ]}>
                    {row.value}
                  </Text>
                </View>
              ))}

              <View style={[styles.note, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Ionicons name="information-circle-outline" size={14} color={colors.subtext} />
                <Text style={[styles.noteText, { color: colors.subtext }]}>
                  Fiyatlar anlık piyasa koşullarına göre değişebilir. Sipariş anındaki fiyat geçerlidir.
                </Text>
              </View>

              {/* Adet Secici + Sepete Ekle */}
              {onAddToCart && (
                <View style={styles.cartSection}>
                  <View style={styles.stepperRow}>
                    <Text style={[styles.stepperLabel, { color: colors.text }]}>Adet</Text>
                    <View style={[styles.stepper, { backgroundColor: colors.background, borderColor: colors.divider }]}>
                      <Pressable
                        onPress={handleDecrease}
                        style={({ pressed }) => [styles.stepperBtn, pressed && { opacity: 0.5 }]}
                        hitSlop={6}
                      >
                        <Ionicons
                          name="remove"
                          size={16}
                          color={quantity <= 1 ? colors.divider : GOLD}
                        />
                      </Pressable>
                      <View style={[styles.stepperDivider, { backgroundColor: colors.divider }]} />
                      <View style={styles.stepperCountWrap}>
                        <Text style={[styles.stepperCount, { color: colors.text }]}>{quantity}</Text>
                      </View>
                      <View style={[styles.stepperDivider, { backgroundColor: colors.divider }]} />
                      <Pressable
                        onPress={handleIncrease}
                        style={({ pressed }) => [styles.stepperBtn, pressed && { opacity: 0.5 }]}
                        hitSlop={6}
                      >
                        <Ionicons name="add" size={16} color={GOLD} />
                      </Pressable>
                    </View>
                  </View>

                  <Pressable
                    onPress={handleAddToCart}
                    style={({ pressed }) => [
                      styles.addToCartBtn,
                      {
                        backgroundColor: GOLD,
                        opacity: pressed ? 0.85 : 1,
                        ...Platform.select({
                          ios: { shadowColor: GOLD, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8 },
                          android: { elevation: 4 },
                        }),
                      },
                    ]}
                  >
                    <Ionicons
                      name={alreadyInCart ? 'cart' : 'cart-outline'}
                      size={20}
                      color={colors.background}
                    />
                    <Text style={[styles.addToCartText, { color: colors.background }]}>
                      {alreadyInCart ? `${quantity} Adet Daha Ekle` : `Sepete Ekle (${quantity})`}
                    </Text>
                  </Pressable>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.48)' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderBottomWidth: 0, paddingTop: 12 },
  handle: { width: 38, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, marginBottom: 20 },
  headerIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  productName: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  closeBtn: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rows: { paddingHorizontal: 20, paddingBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 4 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '500' },
  rowValue: { fontSize: 14, fontWeight: '700' },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, marginTop: 16 },
  noteText: { fontSize: 12, fontWeight: '400', lineHeight: 16, flex: 1 },

  cartSection: { marginTop: 20, gap: 14 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepperLabel: { fontSize: 15, fontWeight: '700' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  stepperBtn: { width: 42, height: 40, alignItems: 'center', justifyContent: 'center' },
  stepperDivider: { width: 1, height: '60%' },
  stepperCountWrap: { minWidth: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  stepperCount: { fontSize: 16, fontWeight: '800' },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 54,
    borderRadius: 16,
  },
  addToCartText: { fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});
