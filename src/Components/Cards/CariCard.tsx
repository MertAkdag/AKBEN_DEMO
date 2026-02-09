import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Cari } from '../../Types/cari';
import { useResponsive } from '../../Hooks/UseResponsive';
import { useTheme } from '../../Context/ThemeContext';
import { lightImpact } from '../../Utils/haptics';

const AnimPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  cari: Cari;
  onPress: () => void;
  index?: number;
}

export const CariCard = ({ cari, onPress, index = 0 }: Props) => {
  const { calculateFontSize } = useResponsive();
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);
  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const isAlacak = cari.balance > 0;
  const isBorclu = cari.balance < 0;
  const accent = isAlacak ? colors.success : isBorclu ? colors.warning : colors.subtext;
  const label = isAlacak ? 'Alacak' : isBorclu ? 'Borç' : 'Dengede';

  const initials = cari.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <AnimPressable
      entering={FadeInDown.duration(400).delay(index * 50).springify()}
      style={[s.card, {
        backgroundColor: colors.card,
        borderColor: colors.cardBorder,
        ...Platform.select({
          ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: isDark ? 0.15 : 0.06, shadowRadius: 10 },
          android: { elevation: 4 },
        }),
      }, scaleStyle]}
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 15, stiffness: 300 }); lightImpact(); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={s.top}>
        <View style={[s.avatar, { backgroundColor: accent + '14', borderColor: accent + '25' }]}>
          <Text style={[s.avatarText, { color: accent }]}>{initials}</Text>
        </View>

        <View style={s.topInfo}>
          <Text style={[s.name, { fontSize: calculateFontSize(16), color: colors.text }]} numberOfLines={1}>
            {cari.name}
          </Text>
          <View style={s.phoneRow}>
            <Ionicons name="call" size={11} color={colors.subtext} />
            <Text style={[s.phone, { color: colors.subtext }]}>{cari.phone}</Text>
          </View>
        </View>

        <View style={[s.badge, { backgroundColor: accent + '12', borderColor: accent + '20' }]}>
          <Text style={[s.badgeLabel, { color: accent }]}>{label}</Text>
          <Text style={[s.badgeVal, { color: accent }]}>
            {Math.abs(cari.balance).toLocaleString('tr-TR')} ₺
          </Text>
        </View>
      </View>

      {cari.address ? (
        <View style={[s.addrRow, { borderTopColor: colors.divider }]}>
          <Ionicons name="location" size={12} color={colors.subtext} style={{ opacity: 0.6 }} />
          <Text style={[s.addr, { color: colors.subtext }]} numberOfLines={1}>{cari.address}</Text>
        </View>
      ) : null}

      <View style={[s.accentBar, { backgroundColor: accent }]} />
    </AnimPressable>
  );
};

const s = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
  },
  accentBar: {
    position: 'absolute', left: 0, top: 16, bottom: 16,
    width: 3, borderTopRightRadius: 3, borderBottomRightRadius: 3, opacity: 0.6,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  avatarText: { fontSize: 16, fontWeight: '800' },
  topInfo: { flex: 1, gap: 3 },
  name: { fontWeight: '700' },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  phone: { fontSize: 12, fontWeight: '500' },
  badge: {
    alignItems: 'flex-end',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14,
    borderWidth: 1,
  },
  badgeLabel: { fontSize: 10, fontWeight: '600', marginBottom: 2 },
  badgeVal: { fontSize: 14, fontWeight: '800' },
  addrRow: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    marginTop: 12, paddingTop: 12,
    borderTopWidth: 1,
  },
  addr: { fontSize: 12, fontWeight: '400', flex: 1 },
});
