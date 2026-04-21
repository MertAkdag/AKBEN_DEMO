/**
 * Sırala & Filtrele Bottom Sheet
 *
 * Katalog ekranında kullanılan panel:
 * - Giriş: `initialSection` ile "Sırala" veya "Filtrele" odaklı açılır; üstte sekme ile geçiş.
 * - Sıralama: varsayılan, fiyat artan/azalan, A-Z, yeni eklenen
 * - Filtreler: markalar (çoklu), "Yeni", "İndirimli", "Stokta Var" toggle'ları
 *
 * Kontrollü bileşen: değerler parent'ta tutulur, "Uygula" ile `onApply` çağrılır.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  type LayoutChangeEvent,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import type { Brand } from '../../Types/catalog';
import { useTheme } from '../../Context/ThemeContext';
import { lightImpact } from '../../Utils/haptics';

export type SortKey =
  | 'default'
  | 'priceAsc'
  | 'priceDesc'
  | 'nameAsc'
  | 'newest';

export interface CatalogFilters {
  brandIds: number[];
  onlyNew: boolean;
  onlyDiscounted: boolean;
  onlyInStock: boolean;
}

export const EMPTY_FILTERS: CatalogFilters = {
  brandIds: [],
  onlyNew: false,
  onlyDiscounted: false,
  onlyInStock: false,
};

/** Sheet hangi girişle açıldı (katalogdaki Sırala / Filtrele butonları). */
export type SortFilterSheetSection = 'sort' | 'filter';

interface SortOption {
  key: SortKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const SEGMENT_SPRING = { stiffness: 260, mass: 0.85 };
const SEGMENT_PAD = 4;
const SEGMENT_GAP = 4;

const SORT_OPTIONS: SortOption[] = [
  { key: 'default', label: 'Varsayılan', icon: 'sparkles-outline' },
  { key: 'priceAsc', label: 'Fiyat: Düşükten Yükseğe', icon: 'arrow-up-outline' },
  { key: 'priceDesc', label: 'Fiyat: Yüksekten Düşüğe', icon: 'arrow-down-outline' },
  { key: 'nameAsc', label: 'İsim: A → Z', icon: 'text-outline' },
  { key: 'newest', label: 'Yeni Eklenen', icon: 'time-outline' },
];

interface Props {
  visible: boolean;
  onClose: () => void;

  /** "Sırala" veya "Filtrele" ile açıldığında ilgili sekme ve içerik öne çıkar. */
  initialSection?: SortFilterSheetSection;

  brands: Brand[];
  brandsLoading?: boolean;

  sortKey: SortKey;
  filters: CatalogFilters;

  onApply: (sortKey: SortKey, filters: CatalogFilters) => void;
  onReset: () => void;
}

export function SortFilterSheet({
  visible,
  onClose,
  initialSection = 'sort',
  brands,
  brandsLoading,
  sortKey,
  filters,
  onApply,
  onReset,
}: Props) {
  const { colors, isDark } = useTheme();
  const GOLD = colors.catalogGold;

  const [localSort, setLocalSort] = useState<SortKey>(sortKey);
  const [localFilters, setLocalFilters] = useState<CatalogFilters>(filters);
  const [section, setSection] = useState<SortFilterSheetSection>(initialSection);

  const segmentProgress = useSharedValue(section === 'sort' ? 0 : 1);
  const railW = useSharedValue(0);
  const railH = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setLocalSort(sortKey);
      setLocalFilters(filters);
      setSection(initialSection);
    }
  }, [visible, sortKey, filters, initialSection]);

  useEffect(() => {
    segmentProgress.value = withSpring(section === 'sort' ? 0 : 1, SEGMENT_SPRING);
  }, [section]);

  const segmentPillSurfaceStyle = useMemo(
    () => ({
      backgroundColor: colors.card,
      borderRadius: 11,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: isDark ? 0.35 : 0.08,
          shadowRadius: 3,
        },
        android: { elevation: 2 },
      }),
    }),
    [colors.card, isDark],
  );

  const onSegmentRailLayout = useCallback(
    (e: LayoutChangeEvent) => {
      railW.value = e.nativeEvent.layout.width;
      railH.value = e.nativeEvent.layout.height;
    },
    [railW, railH],
  );

  const pillAnimatedStyle = useAnimatedStyle(() => {
    const inner = Math.max(0, railW.value - SEGMENT_PAD * 2);
    const segW = inner > SEGMENT_GAP ? (inner - SEGMENT_GAP) / 2 : inner / 2;
    const h = Math.max(0, railH.value - SEGMENT_PAD * 2);
    return {
      position: 'absolute' as const,
      left: SEGMENT_PAD + segmentProgress.value * (segW + SEGMENT_GAP),
      top: SEGMENT_PAD,
      width: segW,
      height: h,
    };
  });

  const toggleBrand = (id: number) => {
    lightImpact();
    setLocalFilters((f) => ({
      ...f,
      brandIds: f.brandIds.includes(id)
        ? f.brandIds.filter((b) => b !== id)
        : [...f.brandIds, id],
    }));
  };

  const toggleFlag = (key: keyof Omit<CatalogFilters, 'brandIds'>) => {
    lightImpact();
    setLocalFilters((f) => ({ ...f, [key]: !f[key] }));
  };

  const handleSelectSort = (key: SortKey) => {
    lightImpact();
    setLocalSort(key);
  };

  const handleReset = () => {
    lightImpact();
    setLocalSort('default');
    setLocalFilters(EMPTY_FILTERS);
    onReset();
  };

  const handleApply = () => {
    lightImpact();
    onApply(localSort, localFilters);
  };

  const activeFilterCount =
    localFilters.brandIds.length +
    (localFilters.onlyNew ? 1 : 0) +
    (localFilters.onlyDiscounted ? 1 : 0) +
    (localFilters.onlyInStock ? 1 : 0);

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.key === localSort)?.label ?? 'Varsayılan';

  const headerTitle = section === 'sort' ? 'Sırala' : 'Filtrele';
  const headerSubtitle =
    section === 'sort'
      ? currentSortLabel
      : activeFilterCount > 0
        ? `${activeFilterCount} aktif filtre`
        : 'Marka ve özellik seçin';

  const setSectionSort = () => {
    lightImpact();
    setSection('sort');
  };
  const setSectionFilter = () => {
    lightImpact();
    setSection('filter');
  };

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
            <View style={[styles.handle, { backgroundColor: colors.divider }]} />

            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: colors.text }]}>{headerTitle}</Text>
                <Text style={[styles.subtitle, { color: colors.subtext }]} numberOfLines={2}>
                  {headerSubtitle}
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

            <View
              style={[styles.segmentRail, { backgroundColor: colors.input }]}
              onLayout={onSegmentRailLayout}
            >
              <Animated.View
                style={[segmentPillSurfaceStyle, pillAnimatedStyle]}
                pointerEvents="none"
              />
              <View style={styles.segmentRow}>
                <Pressable
                  onPress={setSectionSort}
                  style={({ pressed }) => [styles.segmentPressable, pressed && { opacity: 0.72 }]}
                >
                  <Ionicons
                    name="swap-vertical"
                    size={15}
                    color={section === 'sort' ? GOLD : colors.subtext}
                  />
                  <Text
                    style={[
                      styles.segmentLabel,
                      { color: section === 'sort' ? colors.text : colors.subtext },
                    ]}
                  >
                    Sırala
                  </Text>
                </Pressable>
                <Pressable
                  onPress={setSectionFilter}
                  style={({ pressed }) => [styles.segmentPressable, pressed && { opacity: 0.72 }]}
                >
                  <Ionicons
                    name="options-outline"
                    size={15}
                    color={section === 'filter' ? GOLD : colors.subtext}
                  />
                  <Text
                    style={[
                      styles.segmentLabel,
                      { color: section === 'filter' ? colors.text : colors.subtext },
                    ]}
                  >
                    Filtrele
                  </Text>
                  {activeFilterCount > 0 ? (
                    <View style={[styles.segmentBadge, { backgroundColor: GOLD }]}>
                      <Text style={styles.segmentBadgeText}>{activeFilterCount}</Text>
                    </View>
                  ) : null}
                </Pressable>
              </View>
            </View>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {section === 'sort' ? (
                <>
                  <Text style={[styles.sectionTitle, { color: colors.subtext }]}>Sıralama</Text>
                  <View style={styles.sortList}>
                    {SORT_OPTIONS.map((opt) => {
                      const selected = localSort === opt.key;
                      return (
                        <TouchableOpacity
                          key={opt.key}
                          onPress={() => handleSelectSort(opt.key)}
                          activeOpacity={0.8}
                          style={[
                            styles.sortRow,
                            {
                              backgroundColor: selected ? GOLD + '14' : colors.card,
                              borderColor: selected ? GOLD : colors.cardBorder,
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.sortIconWrap,
                              {
                                backgroundColor: selected ? GOLD + '22' : colors.input,
                              },
                            ]}
                          >
                            <Ionicons
                              name={opt.icon}
                              size={16}
                              color={selected ? GOLD : colors.subtext}
                            />
                          </View>
                          <Text
                            style={[
                              styles.sortLabel,
                              { color: selected ? GOLD : colors.text },
                            ]}
                          >
                            {opt.label}
                          </Text>
                          {selected ? (
                            <View style={[styles.check, { backgroundColor: GOLD }]}>
                              <Ionicons name="checkmark" size={14} color="#FFF" />
                            </View>
                          ) : (
                            <View style={[styles.radio, { borderColor: colors.divider }]} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              ) : (
                <>
                  <Text style={[styles.sectionTitle, { color: colors.subtext }]}>Hızlı filtreler</Text>
                  <View style={styles.flagsWrap}>
                    <FlagChip
                      active={localFilters.onlyInStock}
                      label="Stokta Var"
                      icon="checkmark-circle-outline"
                      activeIcon="checkmark-circle"
                      colors={colors}
                      onPress={() => toggleFlag('onlyInStock')}
                    />
                    <FlagChip
                      active={localFilters.onlyNew}
                      label="Yeni"
                      icon="star-outline"
                      activeIcon="star"
                      colors={colors}
                      onPress={() => toggleFlag('onlyNew')}
                    />
                    <FlagChip
                      active={localFilters.onlyDiscounted}
                      label="İndirimli"
                      icon="pricetag-outline"
                      activeIcon="pricetag"
                      colors={colors}
                      onPress={() => toggleFlag('onlyDiscounted')}
                    />
                  </View>

                  <Text style={[styles.sectionTitle, { color: colors.subtext, marginTop: 24 }]}>
                    Marka
                    {localFilters.brandIds.length > 0 ? (
                      <Text style={{ color: GOLD, fontWeight: '800' }}>
                        {'  '}• {localFilters.brandIds.length} seçili
                      </Text>
                    ) : null}
                  </Text>

                  {brandsLoading ? (
                    <View style={styles.brandLoading}>
                      <Text style={[styles.brandLoadingText, { color: colors.subtext }]}>
                        Markalar yükleniyor...
                      </Text>
                    </View>
                  ) : brands.length === 0 ? (
                    <View style={styles.brandLoading}>
                      <Text style={[styles.brandLoadingText, { color: colors.subtext }]}>
                        Marka bulunamadı
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.brandWrap}>
                      {brands.map((b) => {
                        const active = localFilters.brandIds.includes(b.id);
                        return (
                          <TouchableOpacity
                            key={b.id}
                            onPress={() => toggleBrand(b.id)}
                            activeOpacity={0.85}
                            style={[
                              styles.brandChip,
                              {
                                backgroundColor: active ? GOLD + '1F' : colors.card,
                                borderColor: active ? GOLD : colors.cardBorder,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.brandText,
                                { color: active ? GOLD : colors.text },
                              ]}
                              numberOfLines={1}
                            >
                              {b.name || b.markaAdi}
                            </Text>
                            {active ? (
                              <Ionicons name="checkmark-circle" size={14} color={GOLD} />
                            ) : null}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </>
              )}
            </ScrollView>

            {/* Aksiyonlar */}
            <View style={[styles.footer, { borderTopColor: colors.divider }]}>
              <TouchableOpacity
                onPress={handleReset}
                activeOpacity={0.7}
                style={[styles.resetBtn, { borderColor: colors.cardBorder }]}
              >
                <Ionicons name="refresh" size={16} color={colors.subtext} />
                <Text style={[styles.resetText, { color: colors.subtext }]}>Sıfırla</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleApply}
                activeOpacity={0.85}
                style={[styles.applyBtn, {
                  backgroundColor: GOLD,
                  ...Platform.select({
                    ios: { shadowColor: GOLD, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
                    android: { elevation: 4 },
                  }),
                }]}
              >
                <Text style={styles.applyText}>Uygula</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

/* ─── Yardımcı chip bileşeni ─── */
interface FlagChipProps {
  active: boolean;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  colors: any;
}

function FlagChip({ active, label, icon, activeIcon, onPress, colors }: FlagChipProps) {
  const GOLD = colors.catalogGold;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        flagStyles.chip,
        {
          backgroundColor: active ? GOLD + '1F' : colors.card,
          borderColor: active ? GOLD : colors.cardBorder,
        },
      ]}
    >
      <Ionicons
        name={active ? activeIcon : icon}
        size={15}
        color={active ? GOLD : colors.subtext}
      />
      <Text
        style={[
          flagStyles.text,
          { color: active ? GOLD : colors.text },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const flagStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  text: { fontSize: 13, fontWeight: '700' },
});

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.48)' },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingTop: 12,
    maxHeight: '90%',
  },
  handle: { width: 38, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  title: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  subtitle: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },

  segmentRail: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 14,
    padding: SEGMENT_PAD,
    justifyContent: 'center',
  },
  segmentRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  segmentPressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    paddingHorizontal: 8,
    zIndex: 1,
  },
  segmentLabel: { fontSize: 14, fontWeight: '700' },
  segmentBadge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  segmentBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '800' },

  scroll: { maxHeight: 520 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
  },

  sortList: { gap: 8 },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  sortIconWrap: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  sortLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
  check: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5 },

  flagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  brandWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  brandChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    maxWidth: '100%',
  },
  brandText: { fontSize: 13, fontWeight: '700' },
  brandLoading: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  brandLoadingText: { fontSize: 13, fontWeight: '500' },

  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
    borderTopWidth: 1,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
  },
  resetText: { fontSize: 14, fontWeight: '700' },
  applyBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: { color: '#FFF', fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
});
