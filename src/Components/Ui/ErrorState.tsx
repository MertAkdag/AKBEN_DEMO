import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../Constants/Colors';
import { Button } from './Button';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState = ({ message = 'Bir hata oluştu', onRetry }: Props) => {
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={64} color={Colors.error} />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button
          title="Tekrar Dene"
          variant="outline"
          size="sm"
          onPress={onRetry}
          style={{ marginTop: 16, width: 150 }}
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
    padding: 20,
  },
  message: {
    color: Colors.subtext,
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});
