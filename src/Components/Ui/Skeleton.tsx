import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../Context/ThemeContext';

interface Props {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton = ({ width, height, borderRadius = 8, style }: Props) => {
  const { colors } = useTheme();
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
        { backgroundColor: colors.skeleton, width: Number(width), height: Number(height), borderRadius: Number(borderRadius), opacity },
        style,
      ]}
    />
  );
};

export const StatCardSkeleton = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card }]}>
      <Skeleton width={80} height={14} />
      <View style={{ flex: 1 }} />
      <Skeleton width={60} height={32} />
    </View>
  );
};

export const ChartSkeleton = () => (
  <View style={styles.chartContainer}>
    <Skeleton width={120} height={18} style={{ marginBottom: 16 }} />
    <Skeleton width="100%" height={200} borderRadius={12} />
  </View>
);

export const TransactionCardSkeleton = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.transactionCard, { backgroundColor: colors.card }]}>
      <View style={styles.transactionHeader}>
        <Skeleton width={160} height={18} />
        <Skeleton width={80} height={24} borderRadius={12} />
      </View>
      <Skeleton width={100} height={14} style={{ marginBottom: 12 }} />
      <View style={styles.transactionInfoRow}>
        <Skeleton width={120} height={14} />
        <Skeleton width={80} height={14} />
      </View>
    </View>
  );
};

export const OrderCardSkeleton = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.orderCard, { backgroundColor: colors.card }]}>
      <View style={styles.orderHeader}>
        <Skeleton width={180} height={18} />
        <Skeleton width={90} height={28} borderRadius={14} />
      </View>
      <View style={[styles.orderDivider, { backgroundColor: colors.border }]} />
      <Skeleton width={150} height={14} style={{ marginBottom: 8 }} />
      <Skeleton width={130} height={14} />
    </View>
  );
};

export const ProductCardSkeleton = () => {
  const { colors, isDark } = useTheme();
  return (
    <View style={styles.productCard}>
      <View style={[styles.productCardInner, { backgroundColor: colors.card }]}>
        <View style={[styles.productImgWrap, { backgroundColor: isDark ? colors.card : '#F7F5F0' }]}>
          <Skeleton width={100} height={100} borderRadius={0} style={StyleSheet.absoluteFillObject as any} />
        </View>
        <View style={styles.productContent}>
          <Skeleton width={50} height={9} style={{ marginBottom: 8 }} />
          <Skeleton width={100} height={13} style={{ marginBottom: 8 }} />
          <Skeleton width={64} height={24} borderRadius={8} />
        </View>
      </View>
    </View>
  );
};

export const CatalogSkeletonGrid = ({ count = 6 }: { count?: number }) => {
  const rows = Array.from({ length: Math.ceil(count / 2) });
  return (
    <>
      {rows.map((_, i) => (
        <View key={i} style={styles.skeletonRow}>
          <ProductCardSkeleton />
          {i * 2 + 1 < count && <ProductCardSkeleton />}
        </View>
      ))}
    </>
  );
};

export const CategoryChipSkeleton = () => (
  <Skeleton width={72} height={40} borderRadius={12} />
);

const styles = StyleSheet.create({
  statCard: {
    width: '48%',
    height: 126,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  chartContainer: {
    width: '100%',
    marginTop: 20,
  },
  transactionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionInfoRow: {
    flexDirection: 'row',
    gap: 20,
  },
  orderCard: {
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
    marginVertical: 12,
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productCard: {
    flex: 1,
    maxWidth: '48%',
  },
  productCardInner: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  productImgWrap: {
    aspectRatio: 1,
    position: 'relative',
  },
  productContent: {
    padding: 14,
  },
});
