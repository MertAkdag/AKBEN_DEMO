import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../Constants/Colors';
import { Spacing } from '../../Constants/Spacing';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useResponsive } from '../../Hooks/UseResponsive';

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
  const { calculateFontSize } = useResponsive();
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={48} color={Colors.primary + '99'} />
      </View>
      <Text style={[styles.title, { fontSize: calculateFontSize(17) }]}>{title}</Text>
      <Text style={[styles.message, { fontSize: calculateFontSize(14) }]}>{message}</Text>
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
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    color: Colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  message: {
    color: Colors.subtext,
    marginTop: Spacing.sm,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
});
