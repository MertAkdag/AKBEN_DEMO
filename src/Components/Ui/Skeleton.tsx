import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../Constants/Colors';

interface Props {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton = ({ width, height, borderRadius = 8, style }: Props) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: Number(width), height: Number(height), borderRadius: Number(borderRadius), opacity },
        style,
      ]}
    />
  );
};

export const StatCardSkeleton = () => (
  <View style={styles.statCard}>
    <Skeleton width={80} height={14} />
    <View style={{ flex: 1 }} />
    <Skeleton width={60} height={32} />
  </View>
);

export const ChartSkeleton = () => (
  <View style={styles.chartContainer}>
    <Skeleton width={120} height={18} style={{ marginBottom: 16 }} />
    <Skeleton width="100%" height={200} borderRadius={12} />
  </View>
);

export const MachineCardSkeleton = () => (
  <View style={styles.machineCard}>
    <View style={styles.machineHeader}>
      <Skeleton width={160} height={18} />
      <Skeleton width={80} height={24} borderRadius={12} />
    </View>
    <Skeleton width={100} height={14} style={{ marginBottom: 12 }} />
    <View style={styles.machineInfoRow}>
      <Skeleton width={120} height={14} />
      <Skeleton width={80} height={14} />
    </View>
  </View>
);

export const OrderCardSkeleton = () => (
  <View style={styles.orderCard}>
    <View style={styles.orderHeader}>
      <Skeleton width={180} height={18} />
      <Skeleton width={90} height={28} borderRadius={14} />
    </View>
    <View style={styles.orderDivider} />
    <Skeleton width={150} height={14} style={{ marginBottom: 8 }} />
    <Skeleton width={130} height={14} />
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.card,
  },
  statCard: {
    width: '48%',
    height: 126,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  chartContainer: {
    width: '100%',
    marginTop: 20,
  },
  machineCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  machineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  machineInfoRow: {
    flexDirection: 'row',
    gap: 20,
  },
  orderCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
});
