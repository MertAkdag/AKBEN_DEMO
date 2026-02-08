import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../Constants/Colors';
import { Spacing } from '../Constants/Spacing';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useResponsive } from '../Hooks/UseResponsive';

interface Props {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  rightIcon?: keyof typeof Ionicons.glyphMap; 
  onRightPress?: () => void;
}

export const ScreenHeader = ({ title, subtitle, showBackButton, rightIcon, onRightPress }: Props) => {
  const router = useRouter();
  const { calculateFontSize } = useResponsive();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.leftContainer}>
          {showBackButton && (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={Colors.text} />
            </TouchableOpacity>
          )}
          <Text style={[styles.title, { fontSize: calculateFontSize(22) }]}>{title}</Text>
        </View>

        {rightIcon && (
          <TouchableOpacity onPress={onRightPress} style={styles.rightButton}>
            <Ionicons name={rightIcon} size={24} color={Colors.text} />
          </TouchableOpacity>
        )}
      </View>
      
      {subtitle && (
        <Text style={[styles.subtitle, { fontSize: calculateFontSize(14) }]}>{subtitle}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: Spacing.md,
    padding: Spacing.xs,
  },
  title: {
    color: Colors.text,
    fontWeight: '700',
  },
  subtitle: {
    color: Colors.subtext,
  },
  rightButton: {
    backgroundColor: Colors.card, 
    padding: Spacing.sm,
    borderRadius: Spacing.radiusMd,
    borderWidth: 1,
    borderColor: Colors.border,
  }
});