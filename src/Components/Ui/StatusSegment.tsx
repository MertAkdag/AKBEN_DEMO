import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '../../Constants/Spacing';
import { OrderStatus } from '../../Types/order';
import { useTheme } from '../../Context/ThemeContext';

interface StatusOption {
  value: OrderStatus;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  colorKey: 'warning' | 'info' | 'success';
}

const STATUS_OPTIONS: StatusOption[] = [
  { value: 'PENDING', label: 'Bekleyen', icon: 'time-outline', colorKey: 'warning' },
  { value: 'IN_PROGRESS', label: 'Üretimde', icon: 'play-circle-outline', colorKey: 'info' },
  { value: 'COMPLETED', label: 'Tamamlandı', icon: 'checkmark-circle-outline', colorKey: 'success' },
];

interface Props {
  currentStatus: OrderStatus;
  onStatusChange: (status: OrderStatus) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const StatusSegment = ({ currentStatus, onStatusChange, isLoading, disabled }: Props) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.subtext }]}>Durum Güncelle</Text>
      <View style={styles.segmentContainer}>
        {STATUS_OPTIONS.map((option) => {
          const color = colors[option.colorKey];
          const isSelected = currentStatus === option.value;
          const isDisabled = disabled || (isLoading && !isSelected);
          
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.segment,
                { backgroundColor: colors.card, borderColor: colors.border },
                isSelected && { backgroundColor: color + '20', borderColor: color },
              ]}
              onPress={() => !isDisabled && onStatusChange(option.value)}
              disabled={isDisabled}
              activeOpacity={0.7}
            >
              {isLoading && isSelected ? (
                <ActivityIndicator size="small" color={color} />
              ) : (
                <Ionicons 
                  name={option.icon} 
                  size={18} 
                  color={isSelected ? color : colors.subtext} 
                />
              )}
              <Text 
                style={[
                  styles.segmentText,
                  { color: isSelected ? color : colors.subtext },
                  isSelected && styles.segmentTextActive,
                ]}
                numberOfLines={1}
              >
                {option.label}
              </Text>
              {isSelected && (
                <View style={[styles.checkmark, { backgroundColor: color }]}>
                  <Ionicons name="checkmark" size={10} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
  },
  segmentContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  segment: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Spacing.radiusMd,
    borderWidth: 2,
    gap: Spacing.xs,
    minHeight: 70,
  },
  segmentText: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  segmentTextActive: {
    fontWeight: '700',
  },
  checkmark: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
