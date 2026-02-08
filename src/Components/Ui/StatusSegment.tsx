import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../Constants/Colors';
import { Spacing } from '../../Constants/Spacing';
import { OrderStatus, statusToDisplay } from '../../Types/order';

interface StatusOption {
  value: OrderStatus;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const STATUS_OPTIONS: StatusOption[] = [
  { value: 'PENDING', label: 'Bekleyen', icon: 'time-outline', color: Colors.warning },
  { value: 'IN_PROGRESS', label: 'Üretimde', icon: 'play-circle-outline', color: Colors.info },
  { value: 'COMPLETED', label: 'Tamamlandı', icon: 'checkmark-circle-outline', color: Colors.success },
];

interface Props {
  currentStatus: OrderStatus;
  onStatusChange: (status: OrderStatus) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const StatusSegment = ({ currentStatus, onStatusChange, isLoading, disabled }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Durum Güncelle</Text>
      <View style={styles.segmentContainer}>
        {STATUS_OPTIONS.map((option) => {
          const isSelected = currentStatus === option.value;
          const isDisabled = disabled || (isLoading && !isSelected);
          
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.segment,
                isSelected && { backgroundColor: option.color + '20', borderColor: option.color },
              ]}
              onPress={() => !isDisabled && onStatusChange(option.value)}
              disabled={isDisabled}
              activeOpacity={0.7}
            >
              {isLoading && isSelected ? (
                <ActivityIndicator size="small" color={option.color} />
              ) : (
                <Ionicons 
                  name={option.icon} 
                  size={18} 
                  color={isSelected ? option.color : Colors.subtext} 
                />
              )}
              <Text 
                style={[
                  styles.segmentText,
                  { color: isSelected ? option.color : Colors.subtext },
                  isSelected && styles.segmentTextActive,
                ]}
                numberOfLines={1}
              >
                {option.label}
              </Text>
              {isSelected && (
                <View style={[styles.checkmark, { backgroundColor: option.color }]}>
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
    color: Colors.subtext,
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
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.border,
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
