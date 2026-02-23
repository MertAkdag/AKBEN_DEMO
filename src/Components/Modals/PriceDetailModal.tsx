/**
 * Fiyat Detay Modalı
 *
 * Ürün detayında fiyat bileşenlerini gösterir.
 * İleriye dönük: priceService.getPriceBreakdown(productId) endpoint'ine bağlanacak.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';

import type { Product } from '../../Types/catalog';

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
  colors: any;
  isDark: boolean;
  goldPrice?: number; // Anlık gram altın fiyatı
}

function buildPriceRows(product: Product, goldPrice?: number): PriceRow[] {
  // TODO: Gerçek fiyat breakdown API'sinden gelecek
  // API: GET /api/v1/products/:id/price-breakdown
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
    value: '%0 (B2B)',
    icon: 'receipt-outline',
    color: '#10B981',
  });

  const total = base;
  rows.push({
    label: 'Toplam (1 adet)',
    value: total > 0 ? `${total.toLocaleString('tr-TR')}₺` : '—',
    icon: 'checkmark-circle-outline',
    highlight: true,
  });

  return rows;
}

export function PriceDetailModal({ visible, product, onClose, colors, isDark, goldPrice }: Props) {
  const rows = buildPriceRows(product, goldPrice);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <Animated.View
          entering={SlideInDown.springify().damping(20).stiffness(200)}
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
});
