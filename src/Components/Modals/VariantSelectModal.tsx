/**
 * Varyant Seçim Modalı
 *
 * Ürün detayında varyant seçimi için kullanılır.
 * İleriye dönük: variantService.getVariants(productId) endpoint'ine bağlanacak.
 */
import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';

import type { Variant, Product } from '../../Types/catalog';
import { lightImpact } from '../../Utils/haptics';

interface Props {
  visible: boolean;
  variants: Variant[];
  selectedVariant: Variant | null;
  product: Product;
  onSelect: (variant: Variant) => void;
  onClose: () => void;
  colors: any;
  isDark: boolean;
}

export function VariantSelectModal({
  visible,
  variants,
  selectedVariant,
  product,
  onSelect,
  onClose,
  colors,
  isDark,
}: Props) {
  const handleSelect = useCallback(
    (v: Variant) => {
      lightImpact();
      onSelect(v);
      onClose();
    },
    [onSelect, onClose],
  );

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <Animated.View
          entering={SlideInDown.springify().damping(20).stiffness(200)}
          exiting={SlideOutDown.duration(250)}
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
              <View>
                <Text style={[styles.title, { color: colors.text }]}>Varyant Seçin</Text>
                <Text style={[styles.productName, { color: colors.subtext }]} numberOfLines={1}>
                  {product.name}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.card }]} activeOpacity={0.7}>
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Varyantlar */}
            <FlatList
              data={variants}
              keyExtractor={(v) => v.id}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const isSelected = selectedVariant?.id === item.id;
                return (
                  <TouchableOpacity
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.8}
                    style={[
                      styles.variantRow,
                      {
                        backgroundColor: isSelected ? colors.primary + '14' : colors.card,
                        borderColor: isSelected ? colors.primary : colors.cardBorder,
                      },
                    ]}
                  >
                    <View style={[styles.variantIcon, {
                      backgroundColor: isSelected ? colors.primary + '20' : colors.background,
                      borderColor: isSelected ? colors.primary + '40' : colors.divider,
                    }]}>
                      <Ionicons
                        name={isSelected ? 'diamond' : 'diamond-outline'}
                        size={18}
                        color={isSelected ? colors.primary : colors.subtext}
                      />
                    </View>
                    <Text style={[styles.variantName, { color: isSelected ? colors.primary : colors.text }]}>
                      {item.name}
                    </Text>
                    {isSelected && (
                      <View style={[styles.checkWrap, { backgroundColor: colors.primary }]}>
                        <Ionicons name="checkmark" size={14} color="#FFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  productName: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  closeBtn: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  list: { maxHeight: 320 },
  listContent: { gap: 10, paddingHorizontal: 20, paddingBottom: 20 },
  variantRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 16, borderWidth: 1.5 },
  variantIcon: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  variantName: { flex: 1, fontSize: 15, fontWeight: '700' },
  checkWrap: { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
