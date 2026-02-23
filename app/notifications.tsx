import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Pressable, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { ScreenHeader } from '../src/Shared/Header';
import { useTheme } from '../src/Context/ThemeContext';
import { lightImpact } from '../src/Utils/haptics';

type NotificationType = 'CAMPAIGN' | 'ORDER' | 'PRICE' | 'SYSTEM';

type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timeLabel: string;
  unread: boolean;
};

const FILTERS: Array<{ key: 'all' | NotificationType; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: 'all', label: 'Tümü', icon: 'apps-outline' },
  { key: 'CAMPAIGN', label: 'Kampanya', icon: 'flame-outline' },
  { key: 'ORDER', label: 'Sipariş', icon: 'cube-outline' },
  { key: 'PRICE', label: 'Fiyat', icon: 'trending-up-outline' },
  { key: 'SYSTEM', label: 'Sistem', icon: 'shield-checkmark-outline' },
];

function iconForType(type: NotificationType): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'CAMPAIGN': return 'sparkles-outline';
    case 'ORDER': return 'cube-outline';
    case 'PRICE': return 'stats-chart-outline';
    case 'SYSTEM': return 'shield-checkmark-outline';
  }
}

export default function NotificationsScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | NotificationType>('all');
  const [items, setItems] = useState<NotificationItem[]>([
    { id: 'n1', type: 'CAMPAIGN', title: 'Düğün sezonu kampanyası başladı', message: 'Seçili setlerde özel fiyatlar. Koleksiyonu keşfet.', timeLabel: 'Şimdi', unread: true },
    { id: 'n2', type: 'PRICE', title: 'Has altın güncellendi', message: 'Fiyatlar canlı olarak yenilendi. Ürünleri kontrol et.', timeLabel: '7 dk', unread: true },
    { id: 'n3', type: 'ORDER', title: 'Sipariş durumun değişti', message: 'Siparişin hazırlanıyor. Teslimat bilgilerini incele.', timeLabel: '2 sa', unread: false },
    { id: 'n4', type: 'CAMPAIGN', title: 'Yeni sezon yüzük serisi', message: 'Minimal tasarımlar stokta. Hızlıca incele.', timeLabel: 'Dün', unread: false },
    { id: 'n5', type: 'SYSTEM', title: 'Güvenli giriş', message: 'Hesabın koruma altında. Şüpheli bir işlem yok.', timeLabel: '3 gün', unread: false },
  ]);

  const unreadCount = useMemo(() => items.filter((i) => i.unread).length, [items]);
  const filtered = useMemo(() => (activeFilter === 'all' ? items : items.filter((i) => i.type === activeFilter)), [items, activeFilter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  }, []);

  const markAllRead = useCallback(() => {
    lightImpact();
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  const toggleUnread = useCallback((id: string) => {
    lightImpact();
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n)));
  }, []);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={s.container}>
        <ScreenHeader
          title="Bildirimler"
          subtitle={unreadCount > 0 ? `${unreadCount} yeni bildirim` : 'Güncel gelişmeler'}
          showBackButton
          rightIcon="settings-outline"
          onRightPress={() => { lightImpact(); router.push('/notifications/settings'); }}
        />

        {/* Filtre chips */}
        <Animated.View entering={FadeInDown.duration(450).delay(60)} style={s.filtersWrap}>
          <FlatList
            data={FILTERS}
            keyExtractor={(f) => f.key}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.filtersRow}
            renderItem={({ item }) => {
              const active = activeFilter === item.key;
              return (
                <Pressable
                  onPress={() => { lightImpact(); setActiveFilter(item.key); }}
                  style={[
                    s.filterChip,
                    {
                      backgroundColor: active ? colors.primary : colors.card,
                      borderColor: active ? colors.primary : colors.cardBorder,
                    },
                  ]}
                >
                  <Ionicons name={item.icon} size={14} color={active ? '#FFF' : colors.subtext} />
                  <Text style={[s.filterText, { color: active ? '#FFF' : colors.text }]}>{item.label}</Text>
                </Pressable>
              );
            }}
          />
        </Animated.View>

        {/* Liste */}
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <View style={[s.emptyIcon, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '25' }]}>
                <Ionicons name="notifications-off-outline" size={22} color={colors.primary} />
              </View>
              <Text style={[s.emptyTitle, { color: colors.text }]}>Şimdilik bildirim yok</Text>
              <Text style={[s.emptySub, { color: colors.subtext }]}>Yeni kampanyalar ve sipariş güncellemeleri burada görünecek.</Text>
            </View>
          }
          renderItem={({ item, index }) => {
            const icon = iconForType(item.type);
            return (
              <Animated.View entering={FadeInDown.duration(420).delay(90 + index * 35).springify()}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => { toggleUnread(item.id); router.push(`/notifications/${item.id}`); }}
                  style={[
                    s.card,
                    {
                      backgroundColor: colors.card,
                      borderColor: item.unread ? colors.primary + '55' : colors.cardBorder,
                      ...Platform.select({
                        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDark ? 0.18 : 0.06, shadowRadius: 12 },
                        android: { elevation: item.unread ? 5 : 3 },
                      }),
                    },
                  ]}
                >
                  <View style={[s.iconWrap, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '25' }]}>
                    <Ionicons name={icon} size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={s.rowTop}>
                      <Text style={[s.title, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                      <Text style={[s.time, { color: colors.subtext }]}>{item.timeLabel}</Text>
                    </View>
                    <Text style={[s.message, { color: colors.subtext }]} numberOfLines={2}>{item.message}</Text>
                    {item.unread && (
                      <View style={[s.unreadPill, { backgroundColor: colors.primary + '14', borderColor: colors.primary + '28' }]}>
                        <View style={[s.unreadDot, { backgroundColor: colors.primary }]} />
                        <Text style={[s.unreadText, { color: colors.primary }]}>Yeni</Text>
                      </View>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
                </TouchableOpacity>
              </Animated.View>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 16 },

  filtersWrap: { marginTop: -10, marginBottom: 6 },
  filtersRow: { gap: 8, paddingBottom: 10 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 999, borderWidth: 1,
  },
  filterText: { fontSize: 13, fontWeight: '600' },

  listContent: { paddingBottom: 24 },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 10,
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  title: { fontSize: 15, fontWeight: '800', letterSpacing: -0.2, flex: 1 },
  time: { fontSize: 12, fontWeight: '600' },
  message: { marginTop: 4, fontSize: 12, fontWeight: '500', lineHeight: 16 },

  unreadPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 10,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  unreadDot: { width: 6, height: 6, borderRadius: 3 },
  unreadText: { fontSize: 11, fontWeight: '800' },

  emptyWrap: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 18 },
  emptyIcon: {
    width: 52, height: 52, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 10,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800' },
  emptySub: { marginTop: 6, fontSize: 12, fontWeight: '500', textAlign: 'center', lineHeight: 16 },
});

