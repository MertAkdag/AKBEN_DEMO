import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../Constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Props {
  icon?: keyof typeof Ionicons.glyphMap;
  title?: string;
  message?: string;
}

export const EmptyState = ({ 
  icon = 'folder-open-outline', 
  title = 'Veri Bulunamadı',
  message = 'Görüntülenecek veri yok' 
}: Props) => {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={Colors.subtext} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
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
  title: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  message: {
    color: Colors.subtext,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
