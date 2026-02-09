import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Order, statusToDisplay } from '../../Types/order';
import { useResponsive } from '../../Hooks/UseResponsive';
import { useTheme } from '../../Context/ThemeContext';
import { lightImpact } from '../../Utils/haptics';

const AnimPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  order: Order;
  onPress: () => void;
  index?: number;
}

export const OrderCard = ({ order, onPress, index = 0 }: Props) => {
  const { calculateFontSize } = useResponsive();
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);
  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const STATUS_MAP: Record<string, { color: string; icon: string }> = {
    COMPLETED: { color: colors.success, icon: 'checkmark-circle' },
    IN_PROGRESS: { color: colors.primary, icon: 'time' },
    PENDING: { color: colors.warning, icon: 'hourglass' },
  };

  const st = STATUS_MAP[order.status] ?? STATUS_MAP.PENDING;
  const display = statusToDisplay[order.status];

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });

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
      <View style={s.header}>
        <View style={[s.statusIcon, { backgroundColor: st.color + '12', borderColor: st.color + '20' }]}>
          <Ionicons name={st.icon as any} size={18} color={st.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.title, { fontSize: calculateFontSize(16), color: colors.text }]} numberOfLines={2}>
            {order.title}
          </Text>
        </View>
        <View style={[s.statusPill, { backgroundColor: st.color + '10', borderColor: st.color + '1A' }]}>
          <View style={[s.statusDot, { backgroundColor: st.color }]} />
          <Text style={[s.statusText, { color: st.color }]}>{display}</Text>
        </View>
      </View>

      <View style={[s.sep, { backgroundColor: colors.divider }]} />

      <View style={s.infoGrid}>
        <InfoItem icon="person" label="Müşteri" value={order.assignedUser.name} colors={colors} />
        <InfoItem icon="diamond-outline" label="Ürün" value={order.machine.name} colors={colors} />
        <InfoItem icon="calendar" label="Teslim" value={formatDate(order.deadline)} colors={colors} />
      </View>

      <View style={[s.accentBar, { backgroundColor: st.color }]} />
    </AnimPressable>
  );
};

function InfoItem({ icon, label, value, colors }: { icon: string; label: string; value: string; colors: any }) {
  return (
    <View style={s.infoItem}>
      <Ionicons name={icon as any} size={13} color={colors.subtext} style={{ opacity: 0.5 }} />
      <Text style={[s.infoLabel, { color: colors.subtext }]}>{label}</Text>
      <Text style={[s.infoVal, { color: colors.text }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

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
    width: 3, borderTopRightRadius: 3, borderBottomRightRadius: 3, opacity: 0.5,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusIcon: {
    width: 40, height: 40, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  title: { fontWeight: '700' },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
    borderWidth: 1,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  sep: { height: 1, marginVertical: 14 },
  infoGrid: { gap: 10 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoLabel: { fontSize: 12, fontWeight: '500', width: 56 },
  infoVal: { fontSize: 13, fontWeight: '600', flex: 1 },
});
