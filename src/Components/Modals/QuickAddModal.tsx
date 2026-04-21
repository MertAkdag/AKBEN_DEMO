/**
 * Hızlı Sepete Ekle Modalı
 *
 * Katalog ürün kartından doğrudan sepete ekleme akışı.
 * - Miktar seçici (−/+)
 * - Sepette varsa "Güncelle" moduna geçer
 * - Stok üst sınırı otomatik uygulanır
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import type { Product } from '../../Types/catalog';
import { useTheme } from '../../Context/ThemeContext';
import { lightImpact } from '../../Utils/haptics';

interface Props {
  visible: boolean;
  product: Product;
  /** Ürün sepette zaten varsa mevcut miktar */
  currentCartQty: number;
  /** Üst sınır — bakiyeCount > 0 ise bakiyeCount, yoksa 99 */
  maxQty: number;
  /** Kullanıcı "Sepete Ekle / Güncelle" butonuna bastığında */
  onConfirm: (quantity: number) => void;
  onClose: () => void;
}

function formatPrice(value: number | undefined | null): string {
  if (value == null || Number.isNaN(value) || value <= 0) return '—';
  return `${value.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺`;
}

export function QuickAddModal({
  visible,
  product,
  currentCartQty,
  maxQty,
  onConfirm,
  onClose,
}: Props) {
  const { colors, isDark } = useTheme();
  const isUpdateMode = currentCartQty > 0;

  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (visible) setQty(1);
  }, [visible, product.id]);

  const effectiveMax = Math.max(1, Math.min(maxQty ?? 99, 99));

  const handleDec = useCallback(() => {
    lightImpact();
    setQty((q) => Math.max(1, q - 1));
  }, []);

  const handleInc = useCallback(() => {
    lightImpact();
    setQty((q) => Math.min(effectiveMax, q + 1));
  }, [effectiveMax]);

  const handleConfirm = useCallback(() => {
    onConfirm(qty);
  }, [onConfirm, qty]);

  const unitPrice = product.satisFiyati ?? 0;
  const totalText = useMemo(() => formatPrice(unitPrice * qty), [unitPrice, qty]);
  const priceText = useMemo(() => formatPrice(unitPrice), [unitPrice]);

  const canIncrease = qty < effectiveMax;
  const canDecrease = qty > 1;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(180)} style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <Animated.View
          entering={SlideInDown.springify().stiffness(990)}
          exiting={SlideOutDown.duration(500)}
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
            {/* Handle */}
            <View style={[styles.handle, { backgroundColor: colors.divider }]} />

            {/* Başlık */}
            <View style={styles.header}>
              <View style={styles.headerInfo}>
                <Text style={[styles.title, { color: colors.text }]}>
                  {isUpdateMode ? 'Sepeti Güncelle' : 'Sepete Ekle'}
                </Text>
                <Text style={[styles.subtitle, { color: colors.subtext }]} numberOfLines={1}>
                  {isUpdateMode ? `Sepette ${currentCartQty} adet var` : 'Dilediğin miktarda ekle'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.closeBtn, { backgroundColor: colors.card }]}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Ürün önizleme */}
            <View style={[styles.productRow, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={[styles.imgWrap, { backgroundColor: isDark ? colors.input : '#F7F5F0' }]}>
                {product.imageUrl ? (
                  <Image source={{ uri: product.imageUrl }} style={styles.img} contentFit="cover" />
                ) : (
                  <Ionicons name="diamond-outline" size={28} color={colors.catalogGold + '80'} />
                )}
              </View>
              <View style={styles.productMeta}>
                {product.category?.name ? (
                  <Text style={[styles.catTag, { color: colors.catalogGold }]} numberOfLines={1}>
                    {product.category.name}
                  </Text>
                ) : null}
                <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={[styles.unitPrice, { color: colors.subtext }]} numberOfLines={1}>
                  Birim: <Text style={{ color: colors.text, fontWeight: '700' }}>{priceText}</Text>
                </Text>
              </View>
            </View>

            {/* Miktar seçici */}
            <View style={styles.qtySection}>
              <Text style={[styles.qtyLabel, { color: colors.subtext }]}>Miktar</Text>
              <View style={[styles.qtyControl, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <TouchableOpacity
                  onPress={handleDec}
                  disabled={!canDecrease}
                  activeOpacity={0.7}
                  style={[styles.qtyBtn, {
                    backgroundColor: canDecrease ? colors.input : 'transparent',
                    opacity: canDecrease ? 1 : 0.4,
                  }]}
                >
                  <Ionicons name="remove" size={20} color={colors.text} />
                </TouchableOpacity>

                <View style={styles.qtyValueWrap}>
                  <Text style={[styles.qtyValue, { color: colors.text }]}>{qty}</Text>
                  <Text style={[styles.qtyMax, { color: colors.subtext }]}>/ {effectiveMax} adet</Text>
                </View>

                <TouchableOpacity
                  onPress={handleInc}
                  disabled={!canIncrease}
                  activeOpacity={0.7}
                  style={[styles.qtyBtn, {
                    backgroundColor: canIncrease ? colors.catalogGold : 'transparent',
                    opacity: canIncrease ? 1 : 0.4,
                  }]}
                >
                  <Ionicons name="add" size={20} color={canIncrease ? '#FFF' : colors.subtext} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Özet + CTA */}
            <View style={styles.summary}>
              <View style={styles.summaryInfo}>
                <Text style={[styles.summaryLabel, { color: colors.subtext }]}>Toplam</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]} numberOfLines={1}>
                  {totalText}
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleConfirm}
                activeOpacity={0.85}
                style={[styles.cta, {
                  backgroundColor: colors.catalogGold,
                  ...Platform.select({
                    ios: { shadowColor: colors.catalogGold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
                    android: { elevation: 4 },
                  }),
                }]}
              >
                <Ionicons
                  name={isUpdateMode ? 'refresh' : 'bag-add'}
                  size={18}
                  color="#FFF"
                />
                <Text style={styles.ctaText}>
                  {isUpdateMode ? 'Sepete Ekle' : 'Sepete Ekle'}
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.48)' },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingTop: 12,
  },
  handle: { width: 38, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  headerInfo: { flex: 1, paddingRight: 10 },
  title: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  subtitle: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },

  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
  },
  imgWrap: {
    width: 64, height: 64,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  img: { width: '100%', height: '100%' },
  productMeta: { flex: 1 },
  catTag: {
    fontSize: 10, fontWeight: '700',
    letterSpacing: 1.2, textTransform: 'uppercase',
    marginBottom: 2, opacity: 0.9,
  },
  productName: { fontSize: 14, fontWeight: '700', letterSpacing: -0.2, marginBottom: 4 },
  unitPrice: { fontSize: 12, fontWeight: '500' },

  qtySection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  qtyLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
  qtyBtn: {
    width: 44, height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValueWrap: {
    flex: 1,
    alignItems: 'center',
  },
  qtyValue: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  qtyMax: { fontSize: 11, fontWeight: '600', marginTop: 2 },

  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  summaryInfo: { flex: 1 },
  summaryLabel: {
    fontSize: 11, fontWeight: '700',
    letterSpacing: 1, textTransform: 'uppercase',
    marginBottom: 2,
  },
  summaryValue: { fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    height: 52,
    borderRadius: 16,
  },
  ctaText: { color: '#FFF', fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
});
