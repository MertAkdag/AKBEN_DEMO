import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Transaction, transactionTypeLabel } from '../../Types/transaction';
import { useResponsive } from '../../Hooks/UseResponsive';
import { useTheme } from '../../Context/ThemeContext';
import { lightImpact } from '../../Utils/haptics';

const AnimPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  transaction: Transaction;
  onPress: () => void;
  index?: number;
}

export const TransactionCard = ({ transaction, onPress, index = 0 }: Props) => {
  const { calculateFontSize } = useResponsive();
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);
  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const TYPE_MAP: Record<string, { color: string; icon: string; bg: string }> = {
    SALE: { color: colors.success, icon: 'trending-up', bg: colors.success + '12' },
    PURCHASE: { color: '#60A5FA', icon: 'cart', bg: '#60A5FA12' },
    LABOR: { color: colors.warning, icon: 'construct', bg: colors.warning + '12' },
  };

  const t = TYPE_MAP[transaction.type] ?? TYPE_MAP.LABOR;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

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
      <View style={s.row}>
        <View style={[s.iconBox, { backgroundColor: t.bg, borderColor: t.color + '20' }]}>
          <Ionicons name={t.icon as any} size={18} color={t.color} />
        </View>

        <View style={s.info}>
          <View style={s.topRow}>
            <View style={[s.typePill, { backgroundColor: t.color + '10', borderColor: t.color + '1A' }]}>
              <Text style={[s.typeText, { color: t.color }]}>
                {transactionTypeLabel[transaction.type]}
              </Text>
            </View>
            <Text style={[s.date, { color: colors.subtext }]}>{formatDate(transaction.date)}</Text>
          </View>
          <Text style={[s.desc, { fontSize: calculateFontSize(14), color: colors.text }]} numberOfLines={1}>
            {transaction.description}
          </Text>
          {transaction.customerName ? (
            <View style={s.customerRow}>
              <Ionicons name="person" size={10} color={colors.subtext} />
              <Text style={[s.customer, { color: colors.subtext }]}>{transaction.customerName}</Text>
            </View>
          ) : null}
        </View>

        <View style={s.valBox}>
          <Text style={[s.gram, { color: t.color }]}>
            {transaction.gram.toLocaleString('tr-TR')}
          </Text>
          <Text style={[s.gramUnit, { color: t.color }]}>gr</Text>
        </View>
      </View>

      <View style={[s.accentBar, { backgroundColor: t.color }]} />
    </AnimPressable>
  );
};

const s = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
  },
  accentBar: {
    position: 'absolute', left: 0, top: 14, bottom: 14,
    width: 3, borderTopRightRadius: 3, borderBottomRightRadius: 3, opacity: 0.5,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  info: { flex: 1, gap: 4 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typePill: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
    borderWidth: 1,
  },
  typeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.2 },
  date: { fontSize: 11, fontWeight: '500' },
  desc: { fontWeight: '600' },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  customer: { fontSize: 11, fontWeight: '500' },
  valBox: { alignItems: 'flex-end' },
  gram: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  gramUnit: { fontSize: 11, fontWeight: '600', opacity: 0.7 },
});
