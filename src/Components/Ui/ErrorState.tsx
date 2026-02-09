import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Spacing } from '../../Constants/Spacing';
import { Button } from './Button';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useResponsive } from '../../Hooks/UseResponsive';
import { useTheme } from '../../Context/ThemeContext';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState = ({ message = 'Bir hata oluştu', onRetry }: Props) => {
  const { calculateFontSize } = useResponsive();
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.error + '18' }]}>
          <Ionicons name="alert-circle-outline" size={44} color={colors.error} />
        </View>
        <Text style={[styles.message, { fontSize: calculateFontSize(15), color: colors.subtext }]}>{message}</Text>
        {onRetry && (
          <Button
            title="Tekrar Dene"
            variant="outline"
            size="sm"
            onPress={onRetry}
            style={{ marginTop: Spacing.lg }}
          />
        )}
      </View>
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
  card: {
    borderRadius: Spacing.radiusXl,
    padding: Spacing.xxl,
    borderWidth: 1,
    alignItems: 'center',
    maxWidth: 320,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  message: {
    textAlign: 'center',
  },
});
