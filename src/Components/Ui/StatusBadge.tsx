import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../Constants/Colors';

interface Props {
  status: string;
  showDot?: boolean;
}

export const StatusBadge = ({ status, showDot = true }: Props) => {
  const normalizedStatus = status?.toLowerCase() || 'unknown';

  const getVariantColor = () => {
    if (['active', 'running', 'completed'].includes(normalizedStatus)) return Colors.success;
    if (['maintenance', 'in-progress'].includes(normalizedStatus)) return Colors.info;
    if (['pending', 'warning'].includes(normalizedStatus)) return Colors.warning;
    if (['offline', 'deactivated', 'error'].includes(normalizedStatus)) return Colors.error;
    return Colors.subtext;
  };

  const color = getVariantColor();

  return (
    <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color + '40' }]}>
      {showDot && <View style={[styles.dot, { backgroundColor: color }]} />}
      <Text style={[styles.text, { color: color }]}>
        {status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1, 
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  }
});