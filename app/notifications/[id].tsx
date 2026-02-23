import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useTheme } from '../../src/Context/ThemeContext';
import { lightImpact } from '../../src/Utils/haptics';
import { Spacing } from '../../src/Constants/Spacing';

type NotificationType = 'CAMPAIGN' | 'ORDER' | 'PRICE' | 'SYSTEM';

function getTypeInfo(type: NotificationType): {
  label: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
} {
  switch (type) {
    case 'CAMPAIGN':
      return { label: 'Kampanya', color: '#F59E0B', icon: 'sparkles-outline' };
    case 'ORDER':
      return { label: 'Sipariş', color: '#3B82F6', icon: 'cube-outline' };
    case 'PRICE':
      return { label: 'Fiyat', color: '#10B981', icon: 'stats-chart-outline' };
    case 'SYSTEM':
      return { label: 'Sistem', color: '#8B5CF6', icon: 'shield-checkmark-outline' };
  }
}

// TODO: GET /api/v1/notifications/:id ile alınacak
const MOCK_DETAILS: Record<string, {
  type: NotificationType;
  title: string;
  body: string;
  timeLabel: string;
}> = {
  n1: {
    type: 'CAMPAIGN',
    title: 'Düğün sezonu kampanyası başladı',
    body: 'Bu hafta sonu seçili yüzük ve bilezik setlerinde %15\'e varan indirimler başladı. Koleksiyonumuzu keşfedin ve özel fiyatlardan yararlanın.',
    timeLabel: 'Az önce',
  },
  n2: {
    type: 'PRICE',
    title: 'Has altın güncellendi',
    body: 'Gram has altın fiyatı anlık olarak güncellendi. Ürün fiyatları bu değişime yansıyacak. Sepetinizdeki ürünleri kontrol etmenizi öneririz.',
    timeLabel: '7 dk önce',
  },
  n3: {
    type: 'ORDER',
    title: 'Sipariş durumun değişti',
    body: 'Siparişiniz hazırlanmaya başlandı. Tahmini kargoya veriliş süresi 1-2 iş günüdür.',
    timeLabel: '2 saat önce',
  },
  n4: {
    type: 'CAMPAIGN',
    title: 'Yeni sezon yüzük serisi',
    body: 'Minimal tasarımlar ve klasik formlara sahip yeni sezon yüzük serimiz stokta. Hızlıca incelemenizi öneririz, stoklar sınırlıdır.',
    timeLabel: 'Dün',
  },
  n5: {
    type: 'SYSTEM',
    title: 'Güvenli giriş',
    body: 'Hesabınıza başarılı giriş yapıldı. Herhangi bir şüpheli işlem tespit etmedik. Güvenlik ayarlarınızı düzenlemek için profil sayfasını ziyaret edin.',
    timeLabel: '3 gün önce',
  },
};

// Bildirim tiplerine göre eylem butonu bilgisi
function getActionConfig(type: NotificationType, router: ReturnType<typeof useRouter>): {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
} | null {
  switch (type) {
    case 'ORDER':
      return {
        label: 'Siparişlere Git',
        icon: 'receipt-outline',
        color: '#3B82F6',
        onPress: () => { lightImpact(); router.push('/orders'); },
      };
    case 'CAMPAIGN':
      return {
        label: 'Ürünlere Git',
        icon: 'storefront-outline',
        color: '#F59E0B',
        onPress: () => { lightImpact(); router.push('/(tabs)/catalog'); },
      };
    case 'PRICE':
      return {
        label: 'Ana Sayfaya Git',
        icon: 'trending-up-outline',
        color: '#10B981',
        onPress: () => { lightImpact(); router.push('/(tabs)/dashboard'); },
      };
    default:
      return null;
  }
}

export default function NotificationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useTheme();

  const detail = MOCK_DETAILS[id ?? ''] ?? {
    type: 'SYSTEM' as NotificationType,
    title: 'Bildirim',
    body: 'Bildirim içeriği bulunamadı.',
    timeLabel: '',
  };

  const typeInfo = getTypeInfo(detail.type);
  const action = getActionConfig(detail.type, router);

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Nav */}
      <View style={[s.nav, { borderBottomColor: colors.divider }]}>
        <TouchableOpacity
          onPress={() => { lightImpact(); router.back(); }}
          style={s.navBtn}
          activeOpacity={0.7}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[s.navTitle, { color: colors.text }]}>Bildirim Detayı</Text>
        <View style={s.navBtn} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500).springify()}>
          {/* İkon + tip */}
          <View style={s.iconArea}>
            <View
              style={[
                s.iconWrap,
                {
                  backgroundColor: typeInfo.color + '12',
                  borderColor: typeInfo.color + '25',
                  ...Platform.select({
                    ios: {
                      shadowColor: typeInfo.color,
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.15,
                      shadowRadius: 20,
                    },
                    android: { elevation: 6 },
                  }),
                },
              ]}
            >
              <Ionicons name={typeInfo.icon} size={42} color={typeInfo.color} />
            </View>
            <View
              style={[
                s.typeBadge,
                {
                  backgroundColor: typeInfo.color + '12',
                  borderColor: typeInfo.color + '28',
                },
              ]}
            >
              <Text style={[s.typeBadgeText, { color: typeInfo.color }]}>{typeInfo.label}</Text>
            </View>
          </View>

          {/* İçerik kartı */}
          <View
            style={[
              s.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                ...Platform.select({
                  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: isDark ? 0.14 : 0.06, shadowRadius: 10 },
                  android: { elevation: 3 },
                }),
              },
            ]}
          >
            <Text style={[s.cardTitle, { color: colors.text }]}>{detail.title}</Text>
            {detail.timeLabel ? (
              <View style={s.timeRow}>
                <Ionicons name="time-outline" size={13} color={colors.subtext} />
                <Text style={[s.timeText, { color: colors.subtext }]}>{detail.timeLabel}</Text>
              </View>
            ) : null}
            <View style={[s.cardDivider, { backgroundColor: colors.divider }]} />
            <Text style={[s.cardBody, { color: colors.text }]}>{detail.body}</Text>
          </View>

          {/* Eylem butonu */}
          {action && (
            <TouchableOpacity
              onPress={action.onPress}
              style={[
                s.actionBtn,
                {
                  backgroundColor: action.color,
                  ...Platform.select({
                    ios: { shadowColor: action.color, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 8 },
                    android: { elevation: 4 },
                  }),
                },
              ]}
              activeOpacity={0.85}
            >
              <Ionicons name={action.icon} size={18} color="#FFF" />
              <Text style={s.actionBtnText}>{action.label}</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  navBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  navTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700' },
  content: { padding: Spacing.screenPadding, paddingBottom: 40 },
  iconArea: { alignItems: 'center', gap: 12, marginBottom: 24 },
  iconWrap: {
    width: 100,
    height: 100,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  typeBadgeText: { fontSize: 13, fontWeight: '700' },
  card: { borderRadius: 20, borderWidth: 1, padding: 20, marginBottom: 16 },
  cardTitle: { fontSize: 19, fontWeight: '800', letterSpacing: -0.4, marginBottom: 8 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 16 },
  timeText: { fontSize: 13, fontWeight: '500' },
  cardDivider: { height: 1, marginBottom: 16 },
  cardBody: { fontSize: 15, fontWeight: '400', lineHeight: 24 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
  },
  actionBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
