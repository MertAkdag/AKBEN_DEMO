import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Spacing } from '../Constants/Spacing';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useResponsive } from '../Hooks/UseResponsive';
import { useTheme } from '../Context/ThemeContext';

interface Props {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backLabel?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
}

export const ScreenHeader = ({ title, subtitle, showBackButton = false, backLabel, rightIcon, onRightPress }: Props) => {
  const router = useRouter();
  const { calculateFontSize } = useResponsive();
  const { colors } = useTheme();
  const canGoBack = router.canGoBack();
  const shouldShowBack = showBackButton || canGoBack;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.left}>
          {shouldShowBack && (
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color={colors.text} />
              {backLabel && (
                <Text style={[styles.backLabel, { color: colors.subtext }]}>{backLabel}</Text>
              )}
            </TouchableOpacity>
          )}
          <View>
            <Text style={[styles.title, { fontSize: calculateFontSize(28), color: colors.text }]}>{title}</Text>
            {subtitle && (
              <Text style={[styles.subtitle, { fontSize: calculateFontSize(15), color: colors.subtext }]}>{subtitle}</Text>
            )}
          </View>
        </View>

        {rightIcon && (
          <TouchableOpacity onPress={onRightPress} style={[styles.actionBtn, { backgroundColor: colors.primary + '18' }]}>
            <Ionicons name={rightIcon} size={22} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.sm,
    padding: Spacing.xs,
    minHeight: 44,
    justifyContent: 'center',
  },
  backLabel: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 4,
  },
  title: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 2,
    fontWeight: '400',
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
