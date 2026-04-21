/**
 * Alt Kategori Seçim Bottom Sheet
 *
 * Ana kategori satırında "Tümünü Gör" chip'i tıklandığında açılır.
 * - Arama ile alt kategori filtreleme
 * - "Tümü" seçeneği (sadece ana kategori seçimine dön)
 * - Alt kategori listesi — ürün sayısı (childCount) ile
 */
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import type { Category } from '../../Types/catalog';
import { useTheme } from '../../Context/ThemeContext';
import { lightImpact } from '../../Utils/haptics';

interface Props {
  visible: boolean;
  onClose: () => void;

  /** Seçilen ana kategori başlığı (subtitle'da gösterilir) */
  mainCategoryName?: string;
  subCategories: Category[];
  subCategoriesLoading?: boolean;

  selectedSubCategoryId?: number;
  onSelect: (subCategoryId?: number) => void;
}

export function SubCategorySheet({
  visible,
  onClose,
  mainCategoryName,
  subCategories,
  subCategoriesLoading,
  selectedSubCategoryId,
  onSelect,
}: Props) {
  const { colors, isDark } = useTheme();
  const GOLD = colors.catalogGold;

  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR');
    if (!q) return subCategories;
    return subCategories.filter((c) =>
      (c.name || c.kategoriAdi || '').toLocaleLowerCase('tr-TR').includes(q),
    );
  }, [query, subCategories]);

  const handleSelect = useCallback(
    (id?: number) => {
      lightImpact();
      onSelect(id);
      onClose();
    },
    [onSelect, onClose],
  );

  const handleRequestClose = useCallback(() => {
    setQuery('');
    onClose();
  }, [onClose]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleRequestClose}>
      <Animated.View entering={FadeIn.duration(180)} style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleRequestClose} />

        <Animated.View
          entering={SlideInDown.springify().stiffness(200)}
          exiting={SlideOutDown.duration(220)}
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

            {/* Başlık */}
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: colors.text }]}>Alt Kategoriler</Text>
                {mainCategoryName ? (
                  <Text style={[styles.subtitle, { color: colors.subtext }]} numberOfLines={1}>
                    {mainCategoryName}
                  </Text>
                ) : null}
              </View>
              <TouchableOpacity
                onPress={handleRequestClose}
                style={[styles.closeBtn, { backgroundColor: colors.card }]}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Arama */}
            <View style={[styles.searchWrap, { backgroundColor: colors.input }]}>
              <Ionicons name="search-outline" size={18} color={colors.subtext} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Alt kategori ara..."
                placeholderTextColor={colors.subtext}
                style={[styles.searchInput, { color: colors.text }]}
                autoCorrect={false}
                returnKeyType="search"
              />
              {query.length > 0 ? (
                <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color={colors.subtext} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Liste */}
            <FlatList
              data={filtered}
              keyExtractor={(item) => String(item.id)}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              ListHeaderComponent={
                <AllRow
                  selected={selectedSubCategoryId == null}
                  onPress={() => handleSelect(undefined)}
                  colors={colors}
                  label={mainCategoryName ? `${mainCategoryName} — Tümü` : 'Tümü'}
                />
              }
              renderItem={({ item }) => {
                const selected = selectedSubCategoryId === item.id;
                const count = item.productCount ?? item.childCount ?? 0;
                return (
                  <TouchableOpacity
                    onPress={() => handleSelect(item.id)}
                    activeOpacity={0.85}
                    style={[
                      styles.row,
                      {
                        backgroundColor: selected ? GOLD + '14' : colors.card,
                        borderColor: selected ? GOLD : colors.cardBorder,
                      },
                    ]}
                  >
                    <View style={[styles.iconWrap, {
                      backgroundColor: selected ? GOLD + '22' : colors.input,
                    }]}>
                      <Ionicons
                        name={selected ? 'pricetag' : 'pricetag-outline'}
                        size={18}
                        color={selected ? GOLD : colors.subtext}
                      />
                    </View>
                    <View style={styles.rowInfo}>
                      <Text
                        style={[styles.rowLabel, { color: selected ? GOLD : colors.text }]}
                        numberOfLines={1}
                      >
                        {item.name || item.kategoriAdi}
                      </Text>
                      {count > 0 ? (
                        <Text style={[styles.rowCount, { color: colors.subtext }]}>
                          {count} ürün
                        </Text>
                      ) : null}
                    </View>
                    {selected ? (
                      <View style={[styles.check, { backgroundColor: GOLD }]}>
                        <Ionicons name="checkmark" size={14} color="#FFF" />
                      </View>
                    ) : (
                      <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Ionicons
                    name={subCategoriesLoading ? 'hourglass-outline' : 'search-outline'}
                    size={26}
                    color={colors.subtext}
                  />
                  <Text style={[styles.emptyText, { color: colors.subtext }]}>
                    {subCategoriesLoading
                      ? 'Alt kategoriler yükleniyor...'
                      : query
                        ? 'Aramaya uygun kategori yok'
                        : 'Alt kategori bulunamadı'}
                  </Text>
                </View>
              }
            />
          </SafeAreaView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

/* ─── "Tümü" satırı ─── */
function AllRow({
  selected,
  onPress,
  colors,
  label,
}: {
  selected: boolean;
  onPress: () => void;
  colors: any;
  label: string;
}) {
  const GOLD = colors.catalogGold;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.row,
        {
          backgroundColor: selected ? GOLD + '14' : colors.card,
          borderColor: selected ? GOLD : colors.cardBorder,
          marginBottom: 8,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: selected ? GOLD + '22' : colors.input }]}>
        <Ionicons
          name={selected ? 'apps' : 'apps-outline'}
          size={18}
          color={selected ? GOLD : colors.subtext}
        />
      </View>
      <View style={styles.rowInfo}>
        <Text style={[styles.rowLabel, { color: selected ? GOLD : colors.text }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
      {selected ? (
        <View style={[styles.check, { backgroundColor: GOLD }]}>
          <Ionicons name="checkmark" size={14} color="#FFF" />
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
      )}
    </TouchableOpacity>
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
    maxHeight: '85%',
  },
  handle: { width: 38, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  subtitle: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    ...Platform.select({ android: { paddingVertical: 0 } }),
  },

  list: { maxHeight: 460 },
  listContent: { paddingHorizontal: 20, paddingBottom: 20, gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  iconWrap: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  rowInfo: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '700', letterSpacing: -0.2 },
  rowCount: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  check: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },

  empty: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 10,
  },
  emptyText: { fontSize: 13, fontWeight: '500' },
});
