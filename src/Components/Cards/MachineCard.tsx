import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Machine } from '../../Types/machine';
import { formatRuntime, getStatusColor, getStatusText } from '../../Utils/machineHelpers';
import { useResponsive } from '../../Hooks/UseResponsive';
import { useTheme } from '../../Context/ThemeContext';
import { lightImpact } from '../../Utils/haptics';

const AnimPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  machine: Machine;
  onPress: () => void;
  index?: number;
}

export const MachineCard = ({ machine, onPress, index = 0 }: Props) => {
  const { calculateFontSize } = useResponsive();
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);
  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const color = getStatusColor(machine.status, colors);
  const statusLabel = getStatusText(machine.status);

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
        <View style={[s.machineIcon, { backgroundColor: color + '12', borderColor: color + '20' }]}>
          <Ionicons name="cog" size={20} color={color} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[s.name, { fontSize: calculateFontSize(16), color: colors.text }]} numberOfLines={1}>
            {machine.name}
          </Text>
          <Text style={[s.model, { color: colors.subtext }]}>{machine.model}</Text>
        </View>

        <View style={[s.statusPill, { backgroundColor: color + '10', borderColor: color + '1A' }]}>
          <View style={[s.statusDot, { backgroundColor: color }]} />
          <Text style={[s.statusText, { color }]}>{statusLabel}</Text>
        </View>
      </View>

      <View style={[s.sep, { backgroundColor: colors.divider }]} />

      <View style={s.bottom}>
        <View style={[s.infoChip, { backgroundColor: colors.divider }]}>
          <Ionicons name="location" size={12} color={colors.subtext} style={{ opacity: 0.5 }} />
          <Text style={[s.chipText, { color: colors.subtext }]}>{machine.location}</Text>
        </View>
        <View style={[s.infoChip, { backgroundColor: colors.divider }]}>
          <Ionicons name="time" size={12} color={colors.subtext} style={{ opacity: 0.5 }} />
          <Text style={[s.chipText, { color: colors.subtext }]}>{formatRuntime(machine.runtime)}</Text>
        </View>
      </View>

      <View style={[s.accentBar, { backgroundColor: color }]} />
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
    width: 3, borderTopRightRadius: 3, borderBottomRightRadius: 3, opacity: 0.5,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  machineIcon: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  name: { fontWeight: '700' },
  model: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
    borderWidth: 1,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  sep: { height: 1, marginVertical: 14 },
  bottom: { flexDirection: 'row', gap: 12 },
  infoChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
  },
  chipText: { fontSize: 12, fontWeight: '500' },
});
