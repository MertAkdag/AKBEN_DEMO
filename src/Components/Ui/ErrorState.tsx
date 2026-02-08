import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../Constants/Colors';
import { Spacing } from '../../Constants/Spacing';
import { Button } from './Button';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useResponsive } from '../../Hooks/UseResponsive';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState = ({ message = 'Bir hata oluştu', onRetry }: Props) => {
  const { calculateFontSize } = useResponsive();
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name="alert-circle-outline" size={44} color={Colors.error} />
        </View>
        <Text style={[styles.message, { fontSize: calculateFontSize(15) }]}>{message}</Text>
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
    backgroundColor: Colors.card,
    borderRadius: Spacing.radiusXl,
    padding: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    maxWidth: 320,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.error + '18',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  message: {
    color: Colors.subtext,
    textAlign: 'center',
  },
});
