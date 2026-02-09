import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Spacing } from '../../Constants/Spacing';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useResponsive } from '../../Hooks/UseResponsive';
import { useTheme } from '../../Context/ThemeContext';
import { Button } from './Button';

interface Props {
  icon?: keyof typeof Ionicons.glyphMap;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ 
  icon = 'folder-open-outline', 
  title = 'Veri Bulunamadı',
  message = 'Görüntülenecek veri yok',
  actionLabel,
  onAction,
}: Props) => {
  const { calculateFontSize } = useResponsive();
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name={icon} size={48} color={colors.primary + '99'} />
      </View>
      <Text style={[styles.title, { fontSize: calculateFontSize(17), color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { fontSize: calculateFontSize(14), color: colors.subtext }]}>{message}</Text>
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          variant="outline"
          size="sm"
          onPress={onAction}
          style={styles.actionButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontWeight: '600',
    textAlign: 'center',
  },
  message: {
    marginTop: Spacing.sm,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  actionButton: {
    marginTop: Spacing.xl,
  },
});
